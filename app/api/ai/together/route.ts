import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Together AI Configuration (25$ free credit)
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '';
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

// Free models on Together AI
const TOGETHER_MODELS = {
  'meta-llama/Llama-3.2-3B-Instruct-Turbo': 'Fast and efficient',
  'meta-llama/Llama-3.2-1B-Instruct-Turbo': 'Very fast, lightweight',
  'Qwen/Qwen2.5-7B-Instruct-Turbo': 'Good for various tasks',
  'google/gemma-2b-it': 'Google\'s small model',
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, task = 'chat', data = {} } = body;

    // Check API key
    if (!TOGETHER_API_KEY) {
      return NextResponse.json({
        error: 'Together AI API key not configured',
        message: 'Get $25 free credit at together.ai',
        instructions: [
          '1. Go to https://api.together.xyz/signup',
          '2. Create a free account (get $25 credit)',
          '3. Go to https://api.together.xyz/settings/api-keys',
          '4. Create an API key',
          '5. Add to .env.local: TOGETHER_API_KEY="your-key"'
        ]
      }, { status: 500 });
    }

    // Enhance prompt based on task
    let systemPrompt = "You are a helpful e-commerce assistant. Respond in the same language as the user's input.";
    let userPrompt = prompt;
    
    switch(task) {
      case 'product_description':
        userPrompt = `Write an SEO-friendly product description for: ${prompt}`;
        break;
      case 'email_campaign':
        userPrompt = `Create a professional email campaign for: ${prompt}`;
        break;
      case 'social_media':
        userPrompt = `Create a social media post with emojis and hashtags for: ${prompt}`;
        break;
      case 'campaign':
        userPrompt = `Suggest a marketing campaign strategy for: ${prompt}`;
        break;
      case 'store_analysis':
        const storeInfo = data.storeContext ? 
          `Store: ${data.storeContext.name}, ${data.storeContext.productCount} products, ${data.storeContext.orderCount} orders. ` : '';
        userPrompt = `${storeInfo}Provide analysis and recommendations: ${prompt}`;
        break;
    }

    try {
      const response = await fetch(TOGETHER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          stream: false
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Together AI error:', error);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || 'No response generated';

      return NextResponse.json({
        success: true,
        data: {
          result,
          model: 'Llama-3.2-3B',
          task,
          language: 'auto',
          usage: {
            model: 'Llama-3.2-3B',
            provider: 'together',
            timestamp: new Date().toISOString(),
          }
        }
      });

    } catch (apiError: any) {
      console.error('Together AI API failed:', apiError);
      
      // Return fallback response
      return NextResponse.json({
        success: true,
        data: {
          result: getFallbackResponse(task),
          model: 'fallback',
          task,
          language: 'tr',
          usage: {
            model: 'fallback',
            provider: 'local',
            timestamp: new Date().toISOString(),
          }
        }
      });
    }

  } catch (error: any) {
    console.error('[Together AI] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    configured: !!TOGETHER_API_KEY,
    service: 'together',
    message: TOGETHER_API_KEY ? 
      'Together AI is configured' : 
      'Get $25 free credit at together.ai',
    models: Object.entries(TOGETHER_MODELS).map(([id, desc]) => ({
      id,
      description: desc
    })),
    instructions: {
      steps: [
        '1. Go to https://api.together.xyz/signup',
        '2. Create account (get $25 free credit)',
        '3. Go to https://api.together.xyz/settings/api-keys',
        '4. Create API key',
        '5. Add to .env.local: TOGETHER_API_KEY="your-key"'
      ],
      pricing: '$25 free credit on signup',
      limits: 'Llama models: ~$0.0001-0.0002 per 1K tokens'
    }
  });
}

function getFallbackResponse(task: string): string {
  const responses: Record<string, string> = {
    product_description: 'Bu ürün yüksek kaliteli malzemelerden üretilmiştir. Modern tasarımı ve fonksiyonel özellikleri ile dikkat çeker.',
    email_campaign: 'Değerli Müşterimiz, özel kampanyamızdan yararlanmak için mağazamızı ziyaret edin. Seçili ürünlerde %20 indirim!',
    social_media: '🎉 Yeni ürünler geldi! Hemen keşfedin 🛍️ #alışveriş #yenisezon',
    campaign: 'Kampanya Önerisi: 7 gün sürecek, %15 indirim, sosyal medya ve email kanalları kullanılacak.',
    chat: 'Merhaba! Size nasıl yardımcı olabilirim?',
    store_analysis: 'Mağaza performansınız iyi görünüyor. Sosyal medya varlığınızı artırmanızı öneririm.'
  };
  
  return responses[task] || responses.chat;
}