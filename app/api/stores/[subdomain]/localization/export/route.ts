import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - Export translations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    
    const format = searchParams.get('format') || 'json'; // json, csv, po
    const language = searchParams.get('language'); // Optional: export specific language
    const namespace = searchParams.get('namespace'); // Optional: export specific namespace
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get translations
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let translations = (storeSettings?.translations as any[]) || [];
    const localizationSettings = storeSettings?.localizationSettings as any;

    // Apply filters
    if (language) {
      translations = translations.filter(t => t.language === language);
    }
    
    if (namespace) {
      translations = translations.filter(t => t.namespace === namespace);
    }

    // Format based on requested type
    switch (format) {
      case 'csv':
        const csvHeader = 'Language,Namespace,Key,Value,Context,Is Plural,Plural Forms\n';
        const csvRows = translations.map(t => {
          const pluralForms = t.pluralForms ? JSON.stringify(t.pluralForms) : '';
          return `"${t.language}","${t.namespace}","${t.key}","${t.value.replace(/"/g, '""')}","${t.context || ''}","${t.isPlural || false}","${pluralForms.replace(/"/g, '""')}"`;
        }).join('\n');
        
        return new NextResponse(csvHeader + csvRows, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="translations_${subdomain}_${Date.now()}.csv"`
          }
        });
        
      case 'po':
        // GNU gettext format
        let poContent = `# Translations for ${store.name}
# Generated on ${new Date().toISOString()}
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Language: ${language || 'multiple'}\\n"

`;
        
        translations.forEach(t => {
          if (t.context) {
            poContent += `msgctxt "${t.context}"\n`;
          }
          poContent += `msgid "${t.key}"\n`;
          
          if (t.isPlural && t.pluralForms) {
            poContent += `msgid_plural "${t.key}"\n`;
            Object.entries(t.pluralForms).forEach(([form, value], index) => {
              poContent += `msgstr[${index}] "${value}"\n`;
            });
          } else {
            poContent += `msgstr "${t.value}"\n`;
          }
          
          poContent += '\n';
        });
        
        return new NextResponse(poContent, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="translations_${subdomain}_${Date.now()}.po"`
          }
        });
        
      case 'json':
      default:
        // Organize by language and namespace for better structure
        const organized: Record<string, Record<string, Record<string, any>>> = {};
        
        translations.forEach(t => {
          if (!organized[t.language]) {
            organized[t.language] = {};
          }
          if (!organized[t.language][t.namespace]) {
            organized[t.language][t.namespace] = {};
          }
          
          if (t.isPlural && t.pluralForms) {
            organized[t.language][t.namespace][t.key] = {
              value: t.value,
              plural: true,
              forms: t.pluralForms,
              context: t.context
            };
          } else {
            organized[t.language][t.namespace][t.key] = t.context 
              ? { value: t.value, context: t.context }
              : t.value;
          }
        });
        
        const exportData = {
          store: {
            id: store.id,
            name: store.name,
            subdomain: store.subdomain
          },
          settings: {
            defaultLanguage: localizationSettings?.defaultLanguage,
            enabledLanguages: localizationSettings?.enabledLanguages
          },
          translations: organized,
          exportDate: new Date().toISOString(),
          version: '1.0'
        };
        
        return new NextResponse(JSON.stringify(exportData, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="translations_${subdomain}_${Date.now()}.json"`
          }
        });
    }
  } catch (error) {
    console.error('[LOCALIZATION EXPORT API] GET Error:', error);
    return apiResponse.serverError();
  }
}