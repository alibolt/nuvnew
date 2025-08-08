import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Hugging Face Configuration
const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN || '';

// Ücretsiz ve çalışan Hugging Face modelleri
// NOT: Hugging Face Inference API artık çoğu modeli desteklemiyor
// Sadece Pro abonelikle veya Space'lerde çalışıyor
const HUGGINGFACE_MODELS = {
  // Bu modeller genelde çalışmıyor ama deneyebiliriz
  'gpt2': {
    task: 'text-generation',
    description: 'Basic GPT-2'
  },
  'distilgpt2': {
    task: 'text-generation', 
    description: 'Smaller GPT-2'
  },
  'microsoft/DialoGPT-small': {
    task: 'conversational',
    description: 'Small dialog model'
  }
};

// Default model
const DEFAULT_MODEL = 'gpt2';

async function queryHuggingFace(model: string, prompt: string) {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`Hugging Face API error for ${model}:`, error);
    
    // Model yükleniyorsa
    if (response.status === 503) {
      return {
        error: 'Model yükleniyor',
        loading: true,
        retry: true
      };
    }
    
    throw new Error(`API Error: ${response.status}`);
  }

  const result = await response.json();
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, task = 'chat', data = {} } = body;

    // API key kontrolü
    if (!HF_API_TOKEN) {
      return NextResponse.json({
        error: 'Hugging Face API key not configured',
        message: 'Please add HUGGINGFACE_API_TOKEN to your .env.local file',
        instructions: [
          '1. Go to https://huggingface.co/settings/tokens',
          '2. Create a free account if you don\'t have one',
          '3. Generate a new token (Read access is enough)',
          '4. Add to .env.local: HUGGINGFACE_API_TOKEN="hf_..."'
        ]
      }, { status: 500 });
    }

    // Prompt'u zenginleştir
    let enhancedPrompt = prompt;
    const systemPrompt = "You are an e-commerce assistant. Please respond in the same language as the user's input. ";
    
    switch(task) {
      case 'product_description':
        enhancedPrompt = `${systemPrompt}Write an SEO-friendly, compelling product description for: ${prompt}`;
        break;
      case 'email_campaign':
        enhancedPrompt = `${systemPrompt}Create a professional email campaign for an e-commerce store about: ${prompt}`;
        break;
      case 'social_media':
        enhancedPrompt = `${systemPrompt}Create a social media post with emojis and hashtags for: ${prompt}`;
        break;
      case 'campaign':
        enhancedPrompt = `${systemPrompt}Suggest a detailed marketing campaign strategy for: ${prompt}`;
        break;
      case 'store_analysis':
        const storeInfo = data.storeContext ? 
          `Store: ${data.storeContext.name}, ${data.storeContext.productCount} products, ${data.storeContext.orderCount} orders. ` : '';
        enhancedPrompt = `${systemPrompt}${storeInfo}Provide analysis and recommendations: ${prompt}`;
        break;
      default:
        enhancedPrompt = `${systemPrompt}${prompt}`;
    }

    // Format prompt for instruction models
    const formattedPrompt = `<s>[INST] ${enhancedPrompt} [/INST]`;

    let result = null;
    let modelUsed = DEFAULT_MODEL;
    let attempts = 0;
    const maxAttempts = 3;

    // Try different models if one fails
    const modelsToTry = [
      'gpt2',
      'distilgpt2',
      'microsoft/DialoGPT-small'
    ];

    for (const model of modelsToTry) {
      if (attempts >= maxAttempts) break;
      attempts++;

      try {
        console.log(`Trying model: ${model}`);
        const response = await queryHuggingFace(model, formattedPrompt);
        
        if (response.error && response.loading) {
          // Model yükleniyorsa bir sonrakini dene
          console.log(`Model ${model} is loading, trying next...`);
          continue;
        }

        // Parse response
        if (Array.isArray(response)) {
          result = response[0]?.generated_text || response[0];
        } else if (response.generated_text) {
          result = response.generated_text;
        } else if (typeof response === 'string') {
          result = response;
        } else {
          result = JSON.stringify(response);
        }

        modelUsed = model;
        break; // Başarılı, döngüden çık

      } catch (error) {
        console.error(`Model ${model} failed:`, error);
        continue; // Bir sonraki modeli dene
      }
    }

    if (!result) {
      // Tüm modeller başarısız oldu, basit bir yanıt dön
      result = generateFallbackResponse(task, prompt);
      modelUsed = 'fallback';
    }

    // Clean up response
    result = cleanResponse(result);

    return NextResponse.json({
      success: true,
      data: {
        result,
        model: modelUsed,
        task,
        language: 'auto',
        usage: {
          model: modelUsed.split('/').pop(),
          provider: 'huggingface',
          timestamp: new Date().toISOString(),
        }
      }
    });

  } catch (error: any) {
    console.error('[Hugging Face API] Error:', error);
    
    // Fallback response
    const fallbackResponse = generateFallbackResponse('chat', 'Merhaba');
    
    return NextResponse.json({
      success: true,
      data: {
        result: fallbackResponse,
        model: 'fallback',
        task: 'chat',
        language: 'tr',
        usage: {
          model: 'fallback',
          provider: 'local',
          timestamp: new Date().toISOString(),
        }
      }
    });
  }
}

// GET endpoint to check service status
export async function GET() {
  const configured = !!HF_API_TOKEN;
  
  return NextResponse.json({
    configured,
    service: 'huggingface',
    message: configured ? 
      'Hugging Face is configured and ready' : 
      'Please configure HUGGINGFACE_API_TOKEN in your .env.local',
    models: Object.keys(HUGGINGFACE_MODELS).map(model => ({
      id: model,
      ...HUGGINGFACE_MODELS[model as keyof typeof HUGGINGFACE_MODELS]
    })),
    instructions: {
      steps: [
        '1. Go to https://huggingface.co/settings/tokens',
        '2. Create a free account',
        '3. Generate a new token (Read access)',
        '4. Add to .env.local: HUGGINGFACE_API_TOKEN="hf_..."'
      ],
      pricing: 'Free - Rate limited',
      limits: 'Varies by model, generally 10-100 requests per hour'
    }
  });
}

function cleanResponse(text: string): string {
  if (!text) return text;
  
  // Remove instruction tags
  text = text.replace(/<s>|<\/s>|\[INST\]|\[\/INST\]/g, '');
  
  // Remove repeated text
  const lines = text.split('\n');
  const uniqueLines = [...new Set(lines)];
  
  // If too much repetition, use unique lines
  if (lines.length > uniqueLines.length * 2) {
    text = uniqueLines.join('\n');
  }
  
  return text.trim();
}

function generateFallbackResponse(task: string, prompt: string): string {
  const responses: Record<string, string> = {
    product_description: 'Bu ürün yüksek kaliteli malzemelerden üretilmiştir. Modern tasarımı ve dayanıklı yapısı ile öne çıkar. Hem günlük kullanım hem de özel günler için idealdir.',
    
    email_campaign: `Değerli Müşterimiz,

Özel kampanyamızdan haberdar olmak ister misiniz? Seçili ürünlerde %20 indirim fırsatı sizi bekliyor!

Bu fırsat sınırlı sürelidir. Hemen alışverişe başlayın!

Saygılarımızla,
Mağaza Ekibi`,
    
    social_media: '🎉 Yeni sezon ürünleri geldi! Modern tasarımlar, uygun fiyatlar. Hemen keşfedin! 🛍️ #alışveriş #yenisezon #indirim',
    
    campaign: `Kampanya Önerisi:
• Hedef: Yeni müşteri kazanımı
• Süre: 7 gün
• İndirim: İlk alışverişte %15
• Kanal: Email, SMS, Sosyal Medya
• Beklenen Sonuç: %25 müşteri artışı`,
    
    chat: 'Merhaba! Size nasıl yardımcı olabilirim? Ürün açıklamaları, kampanya önerileri veya mağaza yönetimi konularında destek sağlayabilirim.',
    
    store_analysis: `Mağaza Analizi:
• Güçlü yönler: Ürün çeşitliliği, müşteri memnuniyeti
• Geliştirilmesi gerekenler: Stok yönetimi, pazarlama stratejisi
• Öneriler: Email kampanyaları başlatın, sosyal medya varlığınızı artırın`
  };
  
  return responses[task] || responses.chat;
}