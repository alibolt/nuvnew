import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for auto-translation request
const autoTranslateSchema = z.object({
  sourceLanguage: z.string().min(2).max(5),
  targetLanguages: z.array(z.string().min(2).max(5)).min(1),
  namespace: z.enum(['common', 'products', 'checkout', 'account', 'emails', 'errors', 'all']).optional(),
  keys: z.array(z.string()).optional(), // Specific keys to translate
  overwriteExisting: z.boolean().default(false),
  provider: z.enum(['google', 'deepl', 'aws', 'azure']).optional()
});

// Mock translation function (replace with actual API calls)
async function translateText(
  text: string, 
  sourceLang: string, 
  targetLang: string, 
  provider: string
): Promise<string> {
  // In production, call the actual translation API
  // For demo, return a mock translation
  const mockTranslations: Record<string, Record<string, string>> = {
    'en': {
      'es': 'Texto traducido al español',
      'fr': 'Texte traduit en français',
      'de': 'Text ins Deutsche übersetzt',
      'it': 'Testo tradotto in italiano',
      'pt': 'Texto traduzido para português',
      'ja': '日本語に翻訳されたテキスト',
      'zh': '翻译成中文的文本',
      'ar': 'النص المترجم إلى العربية',
      'tr': 'Türkçeye çevrilmiş metin'
    }
  };

  // Simple mock: if we have a predefined translation, use it
  if (mockTranslations[sourceLang]?.[targetLang]) {
    return text.length > 20 
      ? mockTranslations[sourceLang][targetLang]
      : `[${targetLang}] ${text}`;
  }

  // Otherwise, just add language prefix (for demo)
  return `[${targetLang}] ${text}`;
}

// POST - Auto-translate content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = autoTranslateSchema.safeParse(body);
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
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get localization settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const localizationSettings = storeSettings?.localizationSettings as any;
    
    // Check if auto-translation is enabled and configured
    if (localizationSettings?.translationMode === 'manual') {
      return apiResponse.badRequest('Auto-translation is not enabled. Please enable it in localization settings.');
    }

    const provider = validation.data.provider || localizationSettings?.autoTranslateProvider || 'google';
    
    // Get current translations
    const translations = (storeSettings?.translations as any[]) || [];
    
    // Get source translations
    let sourceTranslations = translations.filter(t => t.language === validation.data.sourceLanguage);
    
    // Apply namespace filter
    if (validation.data.namespace && validation.data.namespace !== 'all') {
      sourceTranslations = sourceTranslations.filter(t => t.namespace === validation.data.namespace);
    }
    
    // Apply key filter
    if (validation.data.keys && validation.data.keys.length > 0) {
      sourceTranslations = sourceTranslations.filter(t => validation.data.keys!.includes(t.key));
    }

    if (sourceTranslations.length === 0) {
      return apiResponse.badRequest('No source translations found to translate');
    }

    // Process translations
    const results = {
      translated: 0,
      skipped: 0,
      failed: 0,
      errors: [] as any[]
    };

    const newTranslations = [...translations];

    for (const targetLang of validation.data.targetLanguages) {
      if (targetLang === validation.data.sourceLanguage) continue;

      for (const sourceTranslation of sourceTranslations) {
        try {
          // Check if translation already exists
          const existingIndex = newTranslations.findIndex(t => 
            t.language === targetLang &&
            t.namespace === sourceTranslation.namespace &&
            t.key === sourceTranslation.key
          );

          if (existingIndex !== -1 && !validation.data.overwriteExisting) {
            results.skipped++;
            continue;
          }

          // Translate the text
          const translatedValue = await translateText(
            sourceTranslation.value,
            validation.data.sourceLanguage,
            targetLang,
            provider
          );

          // Handle plural forms if present
          let pluralForms = null;
          if (sourceTranslation.isPlural && sourceTranslation.pluralForms) {
            pluralForms = {} as any;
            for (const [form, text] of Object.entries(sourceTranslation.pluralForms)) {
              pluralForms[form] = await translateText(
                text as string,
                validation.data.sourceLanguage,
                targetLang,
                provider
              );
            }
          }

          const translationEntry = {
            id: existingIndex !== -1 
              ? newTranslations[existingIndex].id 
              : `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            language: targetLang,
            namespace: sourceTranslation.namespace,
            key: sourceTranslation.key,
            value: translatedValue,
            context: sourceTranslation.context,
            maxLength: sourceTranslation.maxLength,
            isPlural: sourceTranslation.isPlural,
            pluralForms: pluralForms,
            autoTranslated: true,
            autoTranslatedFrom: validation.data.sourceLanguage,
            autoTranslatedAt: new Date().toISOString(),
            createdAt: existingIndex !== -1 
              ? newTranslations[existingIndex].createdAt 
              : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: session.user.email
          };

          if (existingIndex !== -1) {
            newTranslations[existingIndex] = translationEntry;
          } else {
            newTranslations.push(translationEntry);
          }

          results.translated++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            key: sourceTranslation.key,
            language: targetLang,
            error: (error as Error).message
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
      message: 'Auto-translation completed',
      results
    });
  } catch (error) {
    console.error('[AUTO-TRANSLATE API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// GET - Get auto-translation status and limits
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

    // Get localization settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const localizationSettings = storeSettings?.localizationSettings as any;
    const translations = (storeSettings?.translations as any[]) || [];

    // Calculate auto-translation stats
    const autoTranslatedCount = translations.filter(t => t.autoTranslated).length;
    const manualCount = translations.filter(t => !t.autoTranslated).length;

    // Mock usage limits (in production, get from translation service)
    const usage = {
      provider: localizationSettings?.autoTranslateProvider || 'google',
      enabled: localizationSettings?.translationMode !== 'manual',
      autoTranslatedCount,
      manualCount,
      totalCount: translations.length,
      limits: {
        charactersPerMonth: 1000000,
        charactersUsed: autoTranslatedCount * 50, // Mock calculation
        charactersRemaining: 1000000 - (autoTranslatedCount * 50),
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      },
      supportedLanguages: [
        'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 
        'ko', 'ar', 'he', 'tr', 'pl', 'sv', 'no', 'da', 'fi', 'cs'
      ]
    };

    return apiResponse.success(usage);
  } catch (error) {
    console.error('[AUTO-TRANSLATE API] GET Error:', error);
    return apiResponse.serverError();
  }
}