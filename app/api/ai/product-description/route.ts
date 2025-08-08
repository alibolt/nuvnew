import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Hugging Face Inference API (Ücretsiz)
const HF_API_URL = "https://api-inference.huggingface.co/models/";
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN; // .env'ye eklenecek

// Hugging Face Ücretsiz Modeller (Test edilmiş)
const MODELS = {
  // Türkçe için en iyi modeller
  turkish_gpt2: "redrussianarmy/gpt2-turkish-cased", // Türkçe GPT-2
  turkish_bert: "dbmdz/bert-base-turkish-cased", // Türkçe BERT
  mT5: "google/mt5-small", // Çok dilli T5 (Türkçe dahil)
  bloom: "bigscience/bloom-560m", // Çok dilli, Türkçe destekli
  
  // Genel amaçlı (İngilizce + çeviri)
  flan_t5: "google/flan-t5-base", // Google'ın instruction-tuned modeli
  bart: "facebook/bart-large-cnn", // Özetleme için
  
  // Sohbet modelleri
  dialogpt: "microsoft/DialoGPT-medium", // Sohbet için
  blenderbot: "facebook/blenderbot-400M-distill", // Facebook sohbet botu
};

// Gemini API (Alternatif - Ücretsiz)
async function generateWithGemini(prompt: string) {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

// Hugging Face API çağrısı
async function generateWithHuggingFace(prompt: string, model: string) {
  try {
    const response = await fetch(HF_API_URL + model, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 250,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || data.generated_text || data;
  } catch (error) {
    console.error('HuggingFace API error:', error);
    return null;
  }
}

// Ollama (Local - Tamamen Ücretsiz)
async function generateWithOllama(prompt: string) {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2', // veya 'mistral'
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama error:', error);
    return null;
  }
}

// Basit template-based üretim (Fallback)
function generateBasicDescription(productData: any) {
  const { name, category, features, price } = productData;
  
  const templates = [
    `${name} ile tanışın! ${category} kategorisindeki bu harika ürün, ${features?.join(', ') || 'benzersiz özellikleri'} ile öne çıkıyor. Sadece ${price} TL'ye sahip olabilirsiniz.`,
    
    `Yeni ${name} ürünümüz ${category} koleksiyonumuzun en yeni üyesi. ${features?.length ? features[0] : 'Üstün kalitesi'} ile dikkat çeken bu ürün, ${price} TL fiyat etiketiyle sizleri bekliyor.`,
    
    `${category} arayanlar için mükemmel bir seçim: ${name}. ${features?.join(' ve ') || 'Özel tasarımı ve kaliteli malzemesi'} sayesinde uzun yıllar kullanabilirsiniz. Şimdi sadece ${price} TL!`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      productName, 
      category, 
      features, 
      price, 
      targetAudience,
      tone = 'professional', // professional, casual, luxury, playful
      language = 'tr',
      method = 'auto' // auto, huggingface, gemini, ollama, basic
    } = body;

    // Prompt oluşturma
    const prompt = language === 'tr' 
      ? `Ürün: ${productName}
Kategori: ${category}
Özellikler: ${features?.join(', ')}
Fiyat: ${price} TL
Hedef Kitle: ${targetAudience || 'Genel'}
Ton: ${tone === 'professional' ? 'Profesyonel' : tone === 'casual' ? 'Samimi' : tone === 'luxury' ? 'Lüks' : 'Eğlenceli'}

Bu ürün için etkileyici, SEO uyumlu bir ürün açıklaması yaz. Açıklama 2-3 paragraf olsun ve ürünün faydalarını vurgulasın.`
      : `Product: ${productName}
Category: ${category}
Features: ${features?.join(', ')}
Price: $${price}
Target Audience: ${targetAudience || 'General'}
Tone: ${tone}

Write a compelling, SEO-friendly product description. The description should be 2-3 paragraphs and highlight the product benefits.`;

    let description = null;
    let usedMethod = method;

    // Otomatik method seçimi
    if (method === 'auto') {
      // 1. Önce Gemini dene (en iyi sonuç, ücretsiz)
      if (process.env.GEMINI_API_KEY) {
        description = await generateWithGemini(prompt);
        usedMethod = 'gemini';
      }
      
      // 2. Hugging Face dene
      if (!description && HF_TOKEN) {
        const model = language === 'tr' ? MODELS.bloom : MODELS.mistral;
        description = await generateWithHuggingFace(prompt, model);
        usedMethod = 'huggingface';
      }
      
      // 3. Ollama dene (local)
      if (!description) {
        description = await generateWithOllama(prompt);
        usedMethod = 'ollama';
      }
      
      // 4. Fallback to basic
      if (!description) {
        description = generateBasicDescription({ 
          name: productName, 
          category, 
          features, 
          price 
        });
        usedMethod = 'basic';
      }
    } else {
      // Manuel method seçimi
      switch(method) {
        case 'huggingface':
          const model = language === 'tr' ? MODELS.bloom : MODELS.mistral;
          description = await generateWithHuggingFace(prompt, model);
          break;
        case 'gemini':
          description = await generateWithGemini(prompt);
          break;
        case 'ollama':
          description = await generateWithOllama(prompt);
          break;
        case 'basic':
        default:
          description = generateBasicDescription({ 
            name: productName, 
            category, 
            features, 
            price 
          });
      }
    }

    // SEO meta description oluştur (kısa özet)
    const metaDescription = description 
      ? description.substring(0, 160).trim() + '...'
      : `${productName} - ${category} kategorisinde ${price} TL fiyatla.`;

    // Keywords önerisi
    const keywords = [
      productName.toLowerCase(),
      category.toLowerCase(),
      ...(features || []).map(f => f.toLowerCase()),
      `${productName} fiyat`,
      `${productName} özellikleri`,
      `en iyi ${category}`,
    ].filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        description,
        metaDescription,
        keywords,
        method: usedMethod,
        language,
      }
    });

  } catch (error) {
    console.error('[AI Product Description] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate product description' },
      { status: 500 }
    );
  }
}

// GET - Mevcut API'lerin durumunu kontrol et
export async function GET() {
  const services = {
    huggingface: {
      available: !!process.env.HUGGINGFACE_API_TOKEN,
      models: Object.keys(MODELS),
      freeQuota: '1000 requests/month',
    },
    gemini: {
      available: !!process.env.GEMINI_API_KEY,
      freeQuota: '60 requests/minute',
    },
    ollama: {
      available: false, // Check if Ollama is running
      info: 'Requires local installation',
    },
    basic: {
      available: true,
      info: 'Template-based generation',
    }
  };

  // Ollama kontrolü
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      services.ollama.available = true;
    }
  } catch (error) {
    // Ollama is not running
  }

  return NextResponse.json({
    services,
    recommended: services.gemini.available ? 'gemini' : 'huggingface',
  });
}