import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// AI asistan için sistem prompt'u
const SYSTEM_PROMPT = `Sen Nuvi E-ticaret platformunun AI asistanısın. Kullanıcılara e-ticaret yönetimi konusunda yardımcı oluyorsun.

Yapabileceklerin:
- Ürün açıklaması ve SEO metinleri yazma
- Kampanya ve indirim önerileri
- E-posta şablonları oluşturma  
- Satış analizi ve raporlama
- Müşteri segmentasyonu önerileri
- Stok yönetimi tavsiyeleri
- Pazarlama stratejileri
- Sosyal medya içerikleri

Her zaman:
- Yardımsever ve profesyonel ol
- Kısa ve net cevaplar ver
- Pratik ve uygulanabilir öneriler sun
- E-ticaret best practice'lerini kullan`;

// Gemini API ile chat
async function chatWithGemini(messages: any[], storeContext?: any) {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Bağlamsal bilgi ekle
    let context = SYSTEM_PROMPT;
    if (storeContext) {
      context += `\n\nMağaza Bilgileri:
- Mağaza Adı: ${storeContext.name}
- Ürün Sayısı: ${storeContext._count?.products || 0}
- Sipariş Sayısı: ${storeContext._count?.orders || 0}
- Müşteri Sayısı: ${storeContext._count?.customers || 0}`;
    }

    // Son mesajı al ve context'i ekle
    const lastMessage = messages[messages.length - 1];
    const prompt = `${context}\n\nKullanıcı: ${lastMessage.content}\n\nAsistan:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini chat error:', error);
    throw error;
  }
}

// Hugging Face chat API
async function chatWithHuggingFace(messages: any[]) {
  const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
  
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            past_user_inputs: messages.slice(0, -1).filter(m => m.role === 'user').map(m => m.content),
            generated_responses: messages.slice(0, -1).filter(m => m.role === 'assistant').map(m => m.content),
            text: messages[messages.length - 1].content,
          },
        }),
      }
    );

    const data = await response.json();
    return data.generated_text || data.response || "Üzgünüm, bir hata oluştu.";
  } catch (error) {
    console.error('HuggingFace chat error:', error);
    throw error;
  }
}

// Basit kural tabanlı yanıtlar (fallback)
function getBasicResponse(message: string, storeContext?: any): string {
  const msg = message.toLowerCase();
  
  // Selamlaşma
  if (msg.includes('merhaba') || msg.includes('selam') || msg.includes('hey')) {
    return `Merhaba! Size nasıl yardımcı olabilirim? Ürün açıklaması, kampanya önerisi veya satış analizi gibi konularda yardımcı olabilirim.`;
  }
  
  // Ürün açıklaması
  if (msg.includes('ürün açıklama') || msg.includes('ürün metni')) {
    return `Ürün açıklaması yazmam için bana şu bilgileri verin:
- Ürün adı
- Kategori
- Özellikler
- Hedef kitle
Örnek: "Kadın çantası için açıklama yaz, deri, el yapımı, lüks segment"`;
  }
  
  // Kampanya
  if (msg.includes('kampanya') || msg.includes('indirim')) {
    return `Size kampanya önerisi hazırlayabilirim. Hangi tür kampanya düşünüyorsunuz?
- Sezonluk indirimler
- Yeni müşteri kampanyası
- Sadakat programı
- Sepet indirimi
- Kargo kampanyası`;
  }
  
  // Analiz
  if (msg.includes('analiz') || msg.includes('rapor')) {
    if (storeContext) {
      return `Mağaza özeti:
📦 Ürün sayısı: ${storeContext._count?.products || 0}
📋 Sipariş sayısı: ${storeContext._count?.orders || 0}
👥 Müşteri sayısı: ${storeContext._count?.customers || 0}

Detaylı analiz için hangi metriği incelemek istersiniz?`;
    }
    return "Satış analizi yapabilmem için önce mağaza verilerinize erişmem gerekiyor.";
  }
  
  // E-posta
  if (msg.includes('e-posta') || msg.includes('email')) {
    return `E-posta şablonu hazırlayabilirim:
- Hoş geldiniz e-postası
- Sipariş onayı
- Kargo bildirimi
- Sepet hatırlatması
- Kampanya duyurusu
Hangisini hazırlayayım?`;
  }
  
  // SEO
  if (msg.includes('seo')) {
    return `SEO optimizasyonu için:
- Meta description yazabilirim
- Anahtar kelime önerileri verebilirim
- URL yapısı tavsiyeleri
- İçerik optimizasyonu
Hangi sayfanız için SEO desteği istersiniz?`;
  }
  
  // Sosyal medya
  if (msg.includes('sosyal medya') || msg.includes('instagram') || msg.includes('facebook')) {
    return `Sosyal medya içeriği hazırlayabilirim:
- Instagram post metni
- Story içeriği
- Facebook paylaşımı
- Twitter/X gönderisi
- Hashtag önerileri
Hangi platform için içerik hazırlayayım?`;
  }
  
  // Genel yardım
  if (msg.includes('yardım') || msg.includes('ne yapabilirsin')) {
    return `Size şu konularda yardımcı olabilirim:
📝 Ürün açıklamaları ve SEO metinleri
🎯 Kampanya ve pazarlama stratejileri
📧 E-posta şablonları
📊 Satış analizleri ve raporlar
👥 Müşteri segmentasyonu
📦 Stok yönetimi önerileri
📱 Sosyal medya içerikleri
💡 E-ticaret ipuçları ve best practice'ler

Hangi konuda yardıma ihtiyacınız var?`;
  }
  
  // Varsayılan
  return `Sorunuzu anladım. Size daha iyi yardımcı olabilmem için biraz daha detay verebilir misiniz? 
Örneğin:
- "Yeni ürünüm için açıklama yaz"
- "Black Friday kampanyası öner"
- "Satışlarımı nasıl artırabilirim?"`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messages, storeId } = body;

    // Mağaza bilgilerini al (opsiyonel)
    let storeContext = null;
    if (storeId) {
      storeContext = await prisma.store.findUnique({
        where: { id: storeId },
        include: {
          _count: {
            select: {
              products: true,
              orders: true,
              customers: true,
              categories: true,
            }
          }
        }
      });
    }

    let response = '';
    let method = 'basic';

    try {
      // Önce Gemini dene
      if (process.env.GEMINI_API_KEY) {
        response = await chatWithGemini(messages, storeContext);
        method = 'gemini';
      }
      // Sonra HuggingFace
      else if (process.env.HUGGINGFACE_API_TOKEN) {
        response = await chatWithHuggingFace(messages);
        method = 'huggingface';
      }
    } catch (error) {
      console.error('AI service error:', error);
    }

    // Fallback to basic responses
    if (!response) {
      const lastMessage = messages[messages.length - 1];
      response = getBasicResponse(lastMessage.content, storeContext);
      method = 'basic';
    }

    return NextResponse.json({
      success: true,
      data: {
        content: response,
        role: 'assistant',
        method,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        fallback: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.'
      },
      { status: 500 }
    );
  }
}