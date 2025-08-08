import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for localization settings
const localizationSettingsSchema = z.object({
  defaultLanguage: z.string().min(2).max(5), // e.g., 'en', 'en-US'
  enabledLanguages: z.array(z.object({
    code: z.string().min(2).max(5),
    name: z.string().min(1),
    nativeName: z.string().min(1),
    flag: z.string().optional(),
    isRTL: z.boolean().default(false),
    enabled: z.boolean().default(true),
    published: z.boolean().default(false)
  })).min(1),
  autoDetectLanguage: z.boolean().default(true),
  showLanguageSelector: z.boolean().default(true),
  selectorPosition: z.enum(['header', 'footer', 'both']).default('header'),
  urlFormat: z.enum(['subdomain', 'subdirectory', 'parameter']).default('subdirectory'),
  // subdomain: en.store.com, subdirectory: store.com/en, parameter: store.com?lang=en
  fallbackBehavior: z.enum(['default', 'hide', 'redirect']).default('default'),
  translationMode: z.enum(['manual', 'automatic', 'hybrid']).default('manual'),
  autoTranslateProvider: z.enum(['google', 'deepl', 'aws', 'azure']).optional(),
  autoTranslateApiKey: z.string().optional(),
  currencies: z.object({
    enableMultiCurrency: z.boolean().default(true),
    autoDetectCurrency: z.boolean().default(true),
    showCurrencySelector: z.boolean().default(true),
    defaultCurrency: z.string().min(3).max(3), // ISO 4217
    enabledCurrencies: z.array(z.object({
      code: z.string().min(3).max(3),
      symbol: z.string(),
      name: z.string(),
      exchangeRate: z.number().positive(),
      roundingRule: z.enum(['up', 'down', 'nearest']).default('nearest'),
      decimalPlaces: z.number().min(0).max(4).default(2),
      enabled: z.boolean().default(true)
    }))
  })
});

// Schema for translation
const translationSchema = z.object({
  language: z.string().min(2).max(5),
  namespace: z.enum(['common', 'products', 'checkout', 'account', 'emails', 'errors', 'custom']),
  key: z.string().min(1),
  value: z.string(),
  context: z.string().optional(),
  maxLength: z.number().optional(),
  isPlural: z.boolean().default(false),
  pluralForms: z.record(z.string()).optional() // { one: "1 item", other: "{count} items" }
});

// Common supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', isRTL: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' }
];

// GET - Get localization settings and translations
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
    
    const language = searchParams.get('language');
    const namespace = searchParams.get('namespace');
    const search = searchParams.get('search');
    
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

    // Get localization settings from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const localizationSettings = storeSettings?.localizationSettings || {
      defaultLanguage: 'en',
      enabledLanguages: [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', enabled: true, published: true }
      ],
      autoDetectLanguage: true,
      showLanguageSelector: true,
      selectorPosition: 'header',
      urlFormat: 'subdirectory',
      fallbackBehavior: 'default',
      translationMode: 'manual',
      currencies: {
        enableMultiCurrency: true,
        autoDetectCurrency: true,
        showCurrencySelector: true,
        defaultCurrency: store.currency || 'USD',
        enabledCurrencies: []
      }
    };

    // Get translations
    let translations = (storeSettings?.translations as any[]) || [];

    // Apply filters
    if (language) {
      translations = translations.filter(t => t.language === language);
    }
    
    if (namespace) {
      translations = translations.filter(t => t.namespace === namespace);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      translations = translations.filter(t =>
        t.key.toLowerCase().includes(searchLower) ||
        t.value.toLowerCase().includes(searchLower)
      );
    }

    // Calculate translation progress
    const translationProgress = {};
    const namespaces = ['common', 'products', 'checkout', 'account', 'emails', 'errors'];
    const baseLanguage = localizationSettings.defaultLanguage;
    const baseTranslations = translations.filter(t => t.language === baseLanguage);
    
    localizationSettings.enabledLanguages.forEach(lang => {
      if (lang.code !== baseLanguage) {
        const langTranslations = translations.filter(t => t.language === lang.code);
        const progress = {};
        
        namespaces.forEach(ns => {
          const baseCount = baseTranslations.filter(t => t.namespace === ns).length;
          const translatedCount = langTranslations.filter(t => t.namespace === ns).length;
          progress[ns] = baseCount > 0 ? Math.round((translatedCount / baseCount) * 100) : 0;
        });
        
        translationProgress[lang.code] = {
          total: baseTranslations.length > 0 
            ? Math.round((langTranslations.length / baseTranslations.length) * 100) 
            : 0,
          byNamespace: progress
        };
      }
    });

    return NextResponse.json({
      settings: localizationSettings,
      translations,
      translationProgress,
      supportedLanguages: SUPPORTED_LANGUAGES
    });
  } catch (error) {
    console.error('[LOCALIZATION API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update localization settings
export async function PUT(
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
    const validation = localizationSettingsSchema.safeParse(body);
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

    // Update localization settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        localizationSettings: validation.data
      },
      create: {
        storeId: store.id,
        localizationSettings: validation.data
      }
    });

    return NextResponse.json({ 
      message: 'Localization settings updated successfully',
      settings: validation.data
    });
  } catch (error) {
    console.error('[LOCALIZATION API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Add/Update translation
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
    
    // Handle bulk translations
    const isBulk = Array.isArray(body);
    const translationsToProcess = isBulk ? body : [body];
    
    // Validate all translations
    const validations = translationsToProcess.map(t => translationSchema.safeParse(t));
    const hasErrors = validations.some(v => !v.success);
    
    if (hasErrors) {
      return NextResponse.json({ 
        error: 'Invalid translations', 
        details: validations.map((v, i) => ({
          index: i,
          errors: v.success ? null : v.error.format()
        }))
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

    const translations = (storeSettings?.translations as any[]) || [];
    
    // Process each translation
    const results = [];
    for (const validation of validations) {
      if (!validation.success) continue;
      
      const translationData = validation.data;
      const translationKey = `${translationData.language}:${translationData.namespace}:${translationData.key}`;
      
      // Find existing translation
      const existingIndex = translations.findIndex(t => 
        t.language === translationData.language &&
        t.namespace === translationData.namespace &&
        t.key === translationData.key
      );
      
      const translationEntry = {
        id: existingIndex !== -1 ? translations[existingIndex].id : `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...translationData,
        createdAt: existingIndex !== -1 ? translations[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.email
      };
      
      if (existingIndex !== -1) {
        translations[existingIndex] = translationEntry;
      } else {
        translations.push(translationEntry);
      }
      
      results.push({
        key: translationKey,
        action: existingIndex !== -1 ? 'updated' : 'created'
      });
    }

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { translations }
    });

    return NextResponse.json({ 
      message: `${results.length} translation(s) processed successfully`,
      results
    });
  } catch (error) {
    console.error('[LOCALIZATION API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete translation(s)
export async function DELETE(
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
    
    const language = searchParams.get('language');
    const namespace = searchParams.get('namespace');
    const key = searchParams.get('key');
    
    if (!language) {
      return NextResponse.json({ 
        error: 'Language is required' 
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

    let translations = (storeSettings?.translations as any[]) || [];
    const originalCount = translations.length;
    
    // Filter out translations to delete
    translations = translations.filter(t => {
      if (t.language !== language) return true;
      if (namespace && t.namespace !== namespace) return true;
      if (key && t.key !== key) return true;
      return false;
    });
    
    const deletedCount = originalCount - translations.length;

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { translations }
    });

    return NextResponse.json({ 
      message: `${deletedCount} translation(s) deleted successfully`,
      deletedCount
    });
  } catch (error) {
    console.error('[LOCALIZATION API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}