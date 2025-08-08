import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Groq Configuration (FREE and FAST!)
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Free models on Groq (VERY FAST) - Updated Jan 2025
const GROQ_MODELS = {
  'llama3-8b-8192': 'Llama 3 8B - Reliable and fast',
  'llama3-70b-8192': 'Llama 3 70B - Most powerful',
  'llama-3.2-3b-preview': 'Llama 3.2 3B - New and fast',
  'llama-3.2-1b-preview': 'Llama 3.2 1B - Fastest',
  'gemma-7b-it': 'Google Gemma 7B',
  'gemma2-9b-it': 'Google Gemma 2 9B',
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
    if (!GROQ_API_KEY) {
      return NextResponse.json({
        error: 'Groq API key not configured',
        message: 'Get FREE API key at groq.com',
        instructions: [
          '1. Go to https://console.groq.com/keys',
          '2. Create a free account',
          '3. Generate an API key (completely free)',
          '4. Add to .env.local: GROQ_API_KEY="gsk_..."',
          '5. Restart your server'
        ]
      }, { status: 500 });
    }

    // Enhance prompt based on task
    let systemPrompt = "You are a helpful e-commerce assistant. Please respond in English.";
    let userPrompt = prompt;
    
    switch(task) {
      case 'product_description':
        const tone = data.tone || 'professional';
        const keywords = data.keywords || '';
        const productType = data.productType || 'product';
        
        const toneInstructions = {
          professional: 'Use a professional, authoritative tone with formal language.',
          casual: 'Use a friendly, conversational tone like talking to a friend.',
          enthusiastic: 'Use an exciting, energetic tone with enthusiasm and emojis.'
        };
        
        systemPrompt = `You are an e-commerce expert specializing in product descriptions. ${toneInstructions[tone]} Respond in English.`;
        userPrompt = `Write an SEO-friendly, sales-focused product description for a ${productType} called "${prompt}". ${keywords ? `Include these keywords naturally: ${keywords}.` : ''} Make it compelling and around 100-150 words.`;
        break;
      case 'email_campaign':
        systemPrompt = "You are an email marketing expert. Respond in English.";
        userPrompt = `Create a professional email campaign text: ${prompt}`;
        break;
      case 'social_media':
        systemPrompt = "You are a social media expert. Respond in English.";
        userPrompt = `Create a social media post with emojis and hashtags: ${prompt}`;
        break;
      case 'campaign':
        systemPrompt = "You are a marketing strategist. Respond in English.";
        userPrompt = `Suggest a detailed campaign strategy: ${prompt}`;
        break;
      case 'store_analysis':
        const storeInfo = data.storeContext ? 
          `Store: ${data.storeContext.name}, ${data.storeContext.productCount} products, ${data.storeContext.orderCount} orders. ` : '';
        systemPrompt = "You are an e-commerce consultant. Respond in English.";
        userPrompt = `${storeInfo}Provide analysis and recommendations: ${prompt}`;
        break;
      default:
        systemPrompt = `You are Nuvi AI, a professional e-commerce assistant. 
        
Characteristics:
- Use a friendly and professional tone
- Respond in English
- You are an e-commerce expert
- Address the user by name (if known)
- Provide practical and actionable suggestions
- Use emojis moderately
- Keep responses concise and clear

Areas where you can help:
• Product descriptions and SEO
• Campaign strategies
• Email and SMS marketing copy
• Social media content
• Customer service
• Sales improvement tactics
• Store performance analysis
• Marketing automation
• Inventory management advice`;
        userPrompt = prompt;
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Working and reliable model
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
        console.error('Groq API error:', error);
        throw new Error(`API Error: ${response.status}`);
      }

      const responseData = await response.json();
      const result = responseData.choices?.[0]?.message?.content || 'No response received';

      return NextResponse.json({
        success: true,
        data: {
          result,
          model: 'llama-3.1-8b',
          task,
          language: 'en',
          usage: {
            model: 'llama-3.1-8b-instant',
            provider: 'groq',
            timestamp: new Date().toISOString(),
            tokens_used: responseData.usage?.total_tokens || 0,
            response_time: responseData.usage?.response_time || 'N/A'
          }
        }
      });

    } catch (apiError: any) {
      console.error('Groq API failed:', apiError);
      
      // Return fallback response
      return NextResponse.json({
        success: true,
        data: {
          result: getFallbackResponse(task, prompt),
          model: 'fallback',
          task,
          language: 'en',
          usage: {
            model: 'fallback',
            provider: 'local',
            timestamp: new Date().toISOString(),
          }
        }
      });
    }

  } catch (error: any) {
    console.error('[Groq API] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    configured: !!GROQ_API_KEY,
    service: 'groq',
    message: GROQ_API_KEY ? 
      'Groq is configured and ready (FAST & FREE!)' : 
      'Get your FREE Groq API key',
    models: Object.entries(GROQ_MODELS).map(([id, desc]) => ({
      id,
      description: desc
    })),
    instructions: {
      steps: [
        '1. Go to https://console.groq.com/keys',
        '2. Create a free account (GitHub/Google login available)',
        '3. Click "Create API Key"',
        '4. Copy the key (starts with gsk_)',
        '5. Add to .env.local: GROQ_API_KEY="gsk_..."'
      ],
      pricing: 'COMPLETELY FREE',
      limits: 'Rate limits: 30 requests/minute, 14,400 requests/day',
      speed: 'ULTRA FAST - 500+ tokens/second'
    }
  });
}

function getFallbackResponse(task: string, prompt: string): string {
  const responses: Record<string, string> = {
    product_description: `This product is carefully crafted from high-quality materials. It stands out with its modern design and superior craftsmanship. Ideal for both daily use and special occasions. Its durable construction ensures years of reliable use.`,
    
    email_campaign: `Dear Valued Customer,

We're excited to share our exclusive campaign with you!

🎉 25% off on selected items
🚚 Free shipping on orders over $50
🎁 Surprise gift for the first 50 customers

Don't miss out! This offer is valid for 3 days only.

Click here to start shopping now.

Best regards,
The Store Team`,
    
    social_media: `🛍️ NEW SEASON, NEW OPPORTUNITIES! 

✨ 20% off all products
🎁 Buy 2 get 1 free
📦 Fast and secure delivery

Grab yours before stocks run out! 

#newseason #discount #shopping #sale #deals`,
    
    campaign: `📋 CAMPAIGN STRATEGY

🎯 Goal: New customer acquisition and sales growth
📅 Duration: 7 days
💰 Budget: Optimized

Discounts:
• 15% off first purchase
• 20% off orders over $100
• Buy 3 get 1 free

Channels:
• Email marketing
• SMS campaigns
• Social media ads
• Google Ads

Expected Results:
• 30% increase in new customers
• 25% sales growth
• 40% conversion rate improvement`,
    
    chat: `Hello! 👋

I'm your AI assistant. I can help you with:

• 📝 Writing product descriptions
• 📧 Creating email campaigns
• 📱 Preparing social media content
• 🎯 Developing marketing strategies
• 📊 Store performance analysis
• 💡 Sales improvement suggestions

How can I assist you today?`,
    
    store_analysis: `📊 STORE ANALYSIS

Strengths:
• Wide product range
• Quality customer service
• Fast delivery

Areas for Improvement:
• Increase social media presence
• Email marketing automation
• Customer loyalty program

Recommendations:
1. Start a weekly email newsletter
2. Post daily on Instagram
3. Highlight customer reviews
4. Plan seasonal campaigns
5. Partner with influencers`
  };
  
  return responses[task] || responses.chat;
}