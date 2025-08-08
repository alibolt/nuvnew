import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Available languages
const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', rtl: false },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', rtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', rtl: false },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', rtl: false },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', rtl: false },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', rtl: false },
];

// Schema for language settings
const languageSettingsSchema = z.object({
  enabledLanguages: z.array(z.string()),
  defaultLanguage: z.string(),
  autoDetect: z.boolean().default(false),
  showLanguageSwitcher: z.boolean().default(true),
  translateUrls: z.boolean().default(false),
});

// Schema for translation
const translationSchema = z.object({
  key: z.string(),
  value: z.string(),
  language: z.string(),
  namespace: z.string().optional().default('common'),
});

// GET - Get language settings
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
    const type = searchParams.get('type'); // 'settings' or 'translations'
    const language = searchParams.get('language');
    const namespace = searchParams.get('namespace') || 'common';
    
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

    // Get language settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const languageSettings = storeSettings?.languageSettings as any || {
      enabledLanguages: ['en'],
      defaultLanguage: 'en',
      autoDetect: false,
      showLanguageSwitcher: true,
      translateUrls: false
    };

    if (type === 'translations') {
      // Return translations for specific language
      const translations = storeSettings?.translations as any || {};
      const languageTranslations = language ? translations[language] || {} : translations;
      
      return NextResponse.json({ 
        translations: languageTranslations,
        namespace
      });
    }

    // Return language settings with available languages
    const enabledLanguageDetails = languageSettings.enabledLanguages.map((code: string) => 
      availableLanguages.find(lang => lang.code === code)
    ).filter(Boolean);

    return NextResponse.json({ 
      languageSettings,
      availableLanguages,
      enabledLanguages: enabledLanguageDetails
    });
  } catch (error) {
    console.error('[LANGUAGES API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update language settings
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
    const validation = languageSettingsSchema.safeParse(body);
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

    // Validate that all enabled languages are supported
    const invalidLanguages = validation.data.enabledLanguages.filter(
      code => !availableLanguages.some(lang => lang.code === code)
    );

    if (invalidLanguages.length > 0) {
      return NextResponse.json({ 
        error: `Unsupported languages: ${invalidLanguages.join(', ')}` 
      }, { status: 400 });
    }

    // Ensure default language is in enabled languages
    if (!validation.data.enabledLanguages.includes(validation.data.defaultLanguage)) {
      return NextResponse.json({ 
        error: 'Default language must be in enabled languages' 
      }, { status: 400 });
    }

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        languageSettings: validation.data
      },
      create: {
        storeId: store.id,
        languageSettings: validation.data
      }
    });

    return NextResponse.json({ 
      message: 'Language settings updated successfully',
      languageSettings: validation.data 
    });
  } catch (error) {
    console.error('[LANGUAGES API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Add/Update translations
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
    
    // Validate translations array
    const translationsSchema = z.array(translationSchema);
    const validation = translationsSchema.safeParse(body.translations);
    
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

    const translations = storeSettings?.translations as any || {};

    // Update translations
    validation.data.forEach(translation => {
      if (!translations[translation.language]) {
        translations[translation.language] = {};
      }
      if (!translations[translation.language][translation.namespace]) {
        translations[translation.language][translation.namespace] = {};
      }
      translations[translation.language][translation.namespace][translation.key] = translation.value;
    });

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        translations
      },
      create: {
        storeId: store.id,
        translations
      }
    });

    return NextResponse.json({ 
      message: 'Translations updated successfully',
      updatedTranslations: validation.data.length
    });
  } catch (error) {
    console.error('[LANGUAGES API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}