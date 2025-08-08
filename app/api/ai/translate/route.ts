import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Groq Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Language names mapping for better context
const languageNames: Record<string, string> = {
  en: 'English',
  tr: 'Turkish',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  nl: 'Dutch',
  sv: 'Swedish',
  pl: 'Polish',
};

export async function POST(request: NextRequest) {
  try {
    // Allow internal API calls from our own actions endpoint
    const referer = request.headers.get('referer');
    const isInternalCall = referer?.includes('/api/ai/actions') || 
                          request.headers.get('x-internal-api-call') === 'true';
    
    if (!isInternalCall) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { text, fromLanguage = 'en', toLanguage = 'tr', context = 'general', batch = false, texts = [] } = body;

    // Validate required fields
    if (!batch && !text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    if (batch && (!texts || texts.length === 0)) {
      return NextResponse.json({ error: 'Texts array is required for batch translation' }, { status: 400 });
    }

    const fromLang = languageNames[fromLanguage] || fromLanguage;
    const toLang = languageNames[toLanguage] || toLanguage;

    // Context-specific instructions
    const contextInstructions = {
      product: 'This is a product name/title and description for an e-commerce store. Maintain marketing appeal and SEO optimization.',
      category: 'This is a category name and description for organizing products. Keep it clear and concise.',
      page: 'This is web page content. Maintain formatting, HTML tags if present, and readability.',
      blogPost: 'This is blog post content. Preserve the tone, style, and any technical terms appropriately.',
      policy: 'This is a legal/policy document. Maintain formal tone and legal accuracy.',
      general: 'Translate naturally while preserving the original meaning and tone.',
    };

    try {
      if (batch) {
        // Batch translation for multiple texts
        const translations = await Promise.all(
          texts.map(async (item: { field: string; text: string }) => {
            const prompt = `You are a professional translator specializing in e-commerce content.
              
              Context: ${contextInstructions[context]}
              
              Translate the following text from ${fromLang} to ${toLang}:
              "${item.text}"
              
              Requirements:
              - Provide ONLY the translated text, no explanations or notes
              - Maintain the original tone and style
              - Preserve any HTML tags or formatting if present
              - Ensure cultural appropriateness for the target language
              - Keep product names, brand names, and technical terms appropriately localized`;

            const response = await fetch(GROQ_API_URL, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a professional translator. Respond only with the translated text, nothing else.',
                  },
                  {
                    role: 'user',
                    content: prompt,
                  },
                ],
                temperature: 0.3,
                max_tokens: 2000,
              }),
            });

            if (!response.ok) {
              throw new Error(`Groq API error: ${response.status}`);
            }

            const completion = await response.json();

            return {
              field: item.field,
              translation: completion.choices[0]?.message?.content?.trim() || '',
            };
          })
        );

        return NextResponse.json({
          success: true,
          translations,
        });
      } else {
        // Single text translation
        const prompt = `You are a professional translator specializing in e-commerce content.
          
          Context: ${contextInstructions[context]}
          
          Translate the following text from ${fromLang} to ${toLang}:
          "${text}"
          
          Requirements:
          - Provide ONLY the translated text, no explanations or notes
          - Maintain the original tone and style
          - Preserve any HTML tags or formatting if present
          - Ensure cultural appropriateness for the target language
          - Keep product names, brand names, and technical terms appropriately localized`;

        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              {
                role: 'system',
                content: 'You are a professional translator. Respond only with the translated text, nothing else.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error(`Groq API error: ${response.status}`);
        }

        const completion = await response.json();

        const translation = completion.choices[0]?.message?.content?.trim() || '';

        return NextResponse.json({
          success: true,
          translation,
          fromLanguage,
          toLanguage,
        });
      }
    } catch (groqError: any) {
      console.error('Groq API error:', groqError);
      
      // Fallback to a simple translation notice if Groq fails
      if (batch) {
        const fallbackTranslations = texts.map((item: { field: string; text: string }) => ({
          field: item.field,
          translation: `[Translation to ${toLang}]: ${item.text}`,
        }));
        
        return NextResponse.json({
          success: true,
          translations: fallbackTranslations,
          warning: 'AI translation unavailable, showing placeholder',
        });
      } else {
        return NextResponse.json({
          success: true,
          translation: `[Translation to ${toLang}]: ${text}`,
          warning: 'AI translation unavailable, showing placeholder',
        });
      }
    }
  } catch (error: any) {
    console.error('[AI Translate] Error:', error);
    return NextResponse.json({
      error: 'Translation failed',
      details: error.message,
    }, { status: 500 });
  }
}

// GET endpoint to check service status
export async function GET() {
  return NextResponse.json({
    service: 'AI Translation Service',
    status: 'active',
    supportedLanguages: Object.keys(languageNames),
    features: [
      'Single text translation',
      'Batch translation',
      'Context-aware translation',
      'E-commerce optimized',
    ],
  });
}