import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for import request
const importSchema = z.object({
  format: z.enum(['json', 'csv', 'po']),
  data: z.string(), // File content or JSON string
  options: z.object({
    overwriteExisting: z.boolean().default(false),
    skipInvalid: z.boolean().default(true),
    validateKeys: z.boolean().default(true),
    targetLanguage: z.string().optional(), // For CSV/PO imports
    namespace: z.string().optional() // Target namespace
  }).optional()
});

// Parse CSV content
function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const translations = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    if (values.length !== headers.length) continue;
    
    const translation = {};
    headers.forEach((header, index) => {
      translation[header.toLowerCase()] = values[index];
    });
    
    // Parse plural forms if present
    if (translation['plural forms']) {
      try {
        translation.pluralForms = JSON.parse(translation['plural forms']);
        translation.isPlural = true;
      } catch {
        translation.pluralForms = null;
        translation.isPlural = false;
      }
    }
    
    translations.push(translation);
  }
  
  return translations;
}

// Parse PO content
function parsePO(content: string): any[] {
  const translations = [];
  const lines = content.split('\n');
  let current = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('msgctxt')) {
      if (current) current.context = trimmed.match(/"(.*)"/)?.[1] || '';
    } else if (trimmed.startsWith('msgid ')) {
      if (current) translations.push(current);
      current = {
        key: trimmed.match(/"(.*)"/)?.[1] || '',
        value: '',
        context: null,
        isPlural: false,
        pluralForms: null
      };
    } else if (trimmed.startsWith('msgid_plural')) {
      if (current) current.isPlural = true;
    } else if (trimmed.startsWith('msgstr')) {
      if (current) {
        const value = trimmed.match(/"(.*)"/)?.[1] || '';
        if (trimmed.includes('[')) {
          // Plural form
          const index = trimmed.match(/msgstr\[(\d+)\]/)?.[1];
          if (!current.pluralForms) current.pluralForms = {};
          current.pluralForms[index] = value;
        } else {
          current.value = value;
        }
      }
    }
  }
  
  if (current) translations.push(current);
  return translations.filter(t => t.key && t.value);
}

// POST - Import translations
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = importSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current translations
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const existingTranslations = (storeSettings?.translations as any[]) || [];
    const options = validation.data.options || {};
    
    // Parse imported data based on format
    let importedTranslations = [];
    
    try {
      switch (validation.data.format) {
        case 'json':
          const jsonData = JSON.parse(validation.data.data);
          
          // Handle different JSON structures
          if (jsonData.translations) {
            // Nuvi export format
            Object.entries(jsonData.translations).forEach(([lang, namespaces]: [string, any]) => {
              Object.entries(namespaces).forEach(([ns, keys]: [string, any]) => {
                Object.entries(keys).forEach(([key, value]: [string, any]) => {
                  if (typeof value === 'string') {
                    importedTranslations.push({
                      language: lang,
                      namespace: ns,
                      key,
                      value,
                      context: null,
                      isPlural: false,
                      pluralForms: null
                    });
                  } else if (value?.value) {
                    importedTranslations.push({
                      language: lang,
                      namespace: ns,
                      key,
                      value: value.value,
                      context: value.context || null,
                      isPlural: value.plural || false,
                      pluralForms: value.forms || null
                    });
                  }
                });
              });
            });
          } else if (Array.isArray(jsonData)) {
            // Array of translation objects
            importedTranslations = jsonData;
          } else {
            // Simple key-value object
            Object.entries(jsonData).forEach(([key, value]) => {
              importedTranslations.push({
                language: options.targetLanguage || 'en',
                namespace: options.namespace || 'common',
                key,
                value: String(value),
                context: null,
                isPlural: false,
                pluralForms: null
              });
            });
          }
          break;
          
        case 'csv':
          importedTranslations = parseCSV(validation.data.data);
          break;
          
        case 'po':
          importedTranslations = parsePO(validation.data.data).map(t => ({
            ...t,
            language: options.targetLanguage || 'en',
            namespace: options.namespace || 'common'
          }));
          break;
      }
    } catch (error) {
      return NextResponse.json({ 
        error: 'Failed to parse import data', 
        details: error.message 
      }, { status: 400 });
    }

    // Validate and process translations
    const results = {
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [] as any[]
    };

    const newTranslations = [...existingTranslations];

    for (const importedTranslation of importedTranslations) {
      try {
        // Validate required fields
        if (!importedTranslation.language || !importedTranslation.key || !importedTranslation.value) {
          if (!options.skipInvalid) {
            results.errors.push({
              translation: importedTranslation,
              error: 'Missing required fields (language, key, value)'
            });
          }
          results.failed++;
          continue;
        }

        // Set defaults
        const translation = {
          language: importedTranslation.language,
          namespace: importedTranslation.namespace || 'common',
          key: importedTranslation.key,
          value: importedTranslation.value,
          context: importedTranslation.context || null,
          isPlural: importedTranslation.isPlural || false,
          pluralForms: importedTranslation.pluralForms || null
        };

        // Check if translation already exists
        const existingIndex = newTranslations.findIndex(t => 
          t.language === translation.language &&
          t.namespace === translation.namespace &&
          t.key === translation.key
        );

        if (existingIndex !== -1) {
          if (options.overwriteExisting) {
            newTranslations[existingIndex] = {
              ...newTranslations[existingIndex],
              ...translation,
              updatedAt: new Date().toISOString(),
              updatedBy: session.user.email
            };
            results.updated++;
          } else {
            results.skipped++;
          }
        } else {
          newTranslations.push({
            id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...translation,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: session.user.email
          });
          results.imported++;
        }
      } catch (error) {
        results.failed++;
        if (!options.skipInvalid) {
          results.errors.push({
            translation: importedTranslation,
            error: error.message
          });
        }
      }
    }

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { translations: newTranslations }
    });

    return NextResponse.json({ 
      message: 'Translation import completed',
      results
    });
  } catch (error) {
    console.error('[LOCALIZATION IMPORT API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET - Get import template/example
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Generate example based on format
    const examples = {
      json: {
        format: 'Nuvi Export Format',
        example: {
          translations: {
            'en': {
              'common': {
                'welcome': 'Welcome',
                'goodbye': 'Goodbye'
              },
              'products': {
                'add_to_cart': 'Add to Cart',
                'out_of_stock': 'Out of Stock'
              }
            },
            'es': {
              'common': {
                'welcome': 'Bienvenido',
                'goodbye': 'Adiós'
              }
            }
          }
        },
        alternativeFormats: [
          {
            name: 'Array Format',
            example: [
              {
                language: 'en',
                namespace: 'common',
                key: 'welcome',
                value: 'Welcome',
                context: null,
                isPlural: false,
                pluralForms: null
              }
            ]
          },
          {
            name: 'Simple Key-Value',
            example: {
              'welcome': 'Welcome',
              'goodbye': 'Goodbye'
            },
            note: 'Requires targetLanguage and namespace in options'
          }
        ]
      },
      csv: {
        format: 'CSV Format',
        headers: 'Language,Namespace,Key,Value,Context,Is Plural,Plural Forms',
        example: `"en","common","welcome","Welcome","","false",""
"en","common","goodbye","Goodbye","","false",""
"es","common","welcome","Bienvenido","","false",""
"en","products","item_count","{count} item","","true","{""one"":""1 item"",""other"":""{count} items""}"`
      },
      po: {
        format: 'GNU gettext PO Format',
        example: `# Translation file
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Language: es\\n"

msgid "welcome"
msgstr "Bienvenido"

msgid "goodbye"
msgstr "Adiós"

msgctxt "product context"
msgid "add_to_cart"
msgstr "Añadir al carrito"`,
        note: 'Requires targetLanguage and namespace in options'
      }
    };

    return NextResponse.json({
      template: examples[format] || examples.json,
      supportedFormats: ['json', 'csv', 'po'],
      importOptions: {
        overwriteExisting: 'Replace existing translations with imported ones',
        skipInvalid: 'Skip invalid translations instead of failing',
        validateKeys: 'Validate translation keys format',
        targetLanguage: 'Target language for CSV/PO imports (required)',
        namespace: 'Target namespace for simple formats (optional)'
      }
    });
  } catch (error) {
    console.error('[LOCALIZATION IMPORT API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}