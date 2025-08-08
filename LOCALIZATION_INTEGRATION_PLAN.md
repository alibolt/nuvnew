# Currency ve Language (Lokalizasyon) Altyapı Entegrasyonu Planı

## Mevcut Durum Analizi

### Currency (Para Birimi) Sistemi
**Mevcut Durum:**
- Currency Selector block: Sadece statik "USD" gösteriyor ✅
- Settings/Currency sayfası: Para birimi ayarları var ama bağlı değil ❌
- Database: `Store.currency` field'ı var ✅
- API: Currency endpoint'i yok ❌

**Eksikler:**
1. Currency Selector block'u store ayarlarından veri almıyor
2. Currency API endpoint'i yok
3. Fiyat formatlaması sistemi yok
4. Multi-currency desteği yok

### Language (Dil) Sistemi  
**Mevcut Durum:**
- Language Selector block: Statik 5 dil gösteriyor (EN, ES, FR, DE, TR) ✅
- Settings/Languages sayfası: Dil ayarları var ama tam bağlı değil ⚠️
- Translation Provider: Var ama kullanılmıyor ⚠️
- API: Languages endpoint'i var ama public değildi (düzeltildi) ✅

**Eksikler:**
1. Türkçe çeviriler yok
2. Dinamik içerik çevirisi yok
3. URL çevirisi yok
4. Product/Category/Page çevirileri yok

## Türkçe Desteği İçin Yapılması Gerekenler

### 1. Currency (Para Birimi) Entegrasyonu

#### A. TRY (Türk Lirası) Ekleme
```javascript
// currency-form-v2.tsx'e eklenecek:
'TRY': { symbol: '₺', name: 'Turkish Lira' }
```

#### B. Currency API Endpoint Oluşturma
```typescript
// /api/stores/[subdomain]/currency/route.ts
- GET: Mağaza para birimi ayarlarını getir (public)
- PUT: Para birimi ayarlarını güncelle (authenticated)
```

#### C. Currency Selector Block Güncelleme
```typescript
// currency-selector-block.tsx güncelleme:
- Store settings'den currency bilgisi alacak
- Dropdown ile para birimi seçimi
- localStorage'a kayıt
- Fiyat formatlaması
```

#### D. Price Formatter Utility
```typescript
// lib/utils/price-formatter.ts
- formatPrice(amount, currency, locale)
- getCurrencySymbol(currency)
- getCurrencyPosition(currency)
```

### 2. Language (Dil) Tam Entegrasyonu

#### A. Türkçe Çeviri Dosyaları
```typescript
// translations/tr.json
{
  "common": {
    "add_to_cart": "Sepete Ekle",
    "buy_now": "Hemen Al",
    "search": "Ara",
    "login": "Giriş Yap",
    "register": "Kayıt Ol",
    "cart": "Sepet",
    "checkout": "Ödeme",
    // ...
  },
  "product": {
    "description": "Ürün Açıklaması",
    "price": "Fiyat",
    "quantity": "Adet",
    // ...
  }
}
```

#### B. Dynamic Content Translation
```typescript
// Product, Category, Page modellerine translation field'ları:
- nameTranslations: Json
- descriptionTranslations: Json
- slugTranslations: Json
```

#### C. Translation Management API
```typescript
// /api/stores/[subdomain]/translations/route.ts
- GET: Çevirileri getir
- POST: Çeviri ekle/güncelle
- DELETE: Çeviri sil
```

#### D. URL Routing for Languages
```typescript
// Middleware güncelleme:
- /tr/urunler -> /products
- /tr/sepet -> /cart
- Subdomain + locale routing
```

### 3. Component Entegrasyonu

#### A. Tüm Commerce Theme Component'lerini Güncelleme
```typescript
// Her component'e useTranslation hook'u ekle:
const { t, locale } = useTranslation();

// Örnek:
<button>{t('add_to_cart')}</button>
```

#### B. Product Card Fiyat Gösterimi
```typescript
const ProductCard = () => {
  const { locale } = useTranslation();
  const { currency } = useCurrency();
  
  return (
    <div className="price">
      {formatPrice(product.price, currency, locale)}
    </div>
  );
};
```

### 4. Admin Panel Entegrasyonu

#### A. Translation Management UI
- Settings/Languages sayfasına çeviri yönetimi ekle
- Product/Category/Page formlarına çeviri field'ları ekle
- Bulk translation import/export

#### B. Currency Management UI  
- Multi-currency ayarları
- Exchange rate yönetimi
- Otomatik kur güncelleme

### 5. Database Schema Güncellemeleri

```prisma
model Store {
  // Mevcut field'lar...
  defaultLocale     String   @default("en")
  enabledLocales    String[] @default(["en"])
  enabledCurrencies String[] @default(["USD"])
}

model Product {
  // Mevcut field'lar...
  nameTranslations        Json?
  descriptionTranslations Json?
  pricesByCurrency        Json?
}

model Translation {
  id        String   @id @default(cuid())
  storeId   String
  locale    String
  namespace String
  key       String
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  store Store @relation(fields: [storeId], references: [id])
  
  @@unique([storeId, locale, namespace, key])
}
```

## Uygulama Adımları (Öncelik Sırası)

### Faz 1: Temel Altyapı (1-2 gün)
1. ✅ Language API endpoint'ini public yap (TAMAMLANDI)
2. Currency API endpoint oluştur
3. Translation ve Currency utility fonksiyonları yaz
4. Database schema güncellemeleri

### Faz 2: Component Entegrasyonu (2-3 gün)
1. Currency Selector block'u güncelle
2. Language Selector block'u API'ye bağla
3. Product Card ve diğer fiyat gösteren component'leri güncelle
4. Header/Footer component'lerine çeviri ekle

### Faz 3: Türkçe İçerik (1-2 gün)
1. Türkçe çeviri dosyaları oluştur
2. TRY para birimi entegrasyonu
3. Türkçe URL routing

### Faz 4: Admin Panel (2-3 gün)
1. Translation management UI
2. Product/Category çeviri field'ları
3. Currency ayarları güncelleme

### Faz 5: Test ve İyileştirme (1-2 gün)
1. End-to-end test
2. Performance optimizasyonu
3. Cache stratejisi
4. Documentation

## Hemen Uygulanabilecek Çözümler

### 1. TRY Ekleme (5 dakika)
```typescript
// currency-form-v2.tsx güncelle
// Currency Selector block'a TRY ekle
```

### 2. Basit Çeviri Sistemi (30 dakika)
```typescript
// Static translation dosyaları oluştur
// useTranslation hook'u kullan
```

### 3. LocalStorage Tabanlı Tercihler (15 dakika)
```typescript
// Currency ve Language tercihlerini localStorage'da tut
// Page load'da tercihler uygula
```

## Sonuç

**Mevcut Durum:** Currency ve Language selector'lar görsel olarak var ama backend ile tam entegre değil.

**Türkçe Çalışması İçin Minimum Gereksinimler:**
1. TRY para birimi eklenmeli ✅ (kolay)
2. Türkçe çeviri dosyaları oluşturulmalı ⏳ (orta)
3. Component'ler useTranslation kullanmalı ⏳ (orta)
4. Fiyatlar formatPrice ile gösterilmeli ⏳ (kolay)

**Tahmini Süre:** Tam entegrasyon için 8-10 gün, minimum çalışan versiyon için 2-3 gün.