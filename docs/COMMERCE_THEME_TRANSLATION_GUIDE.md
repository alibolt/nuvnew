# Commerce Theme Translation Guide

## Overview
Bu doküman, Commerce temasını çok dilli hale getirmek için yapılması gereken değişiklikleri açıklar.

## Değişiklik Stratejisi

### 1. Import useTranslation Hook
Her component'e translation hook'unu ekleyin:
```tsx
import { useTranslation } from '@/lib/hooks/use-translations';
```

### 2. Hook'u Component İçinde Kullanın
```tsx
const { t } = useTranslation();
```

### 3. Statik Metinleri Çeviri Key'leri ile Değiştirin

#### Önce:
```tsx
<h2>Your cart is empty</h2>
<button>Add to Cart</button>
```

#### Sonra:
```tsx
<h2>{t('cart_empty', 'cart')}</h2>
<button>{t('add_to_cart', 'common')}</button>
```

### 4. Settings'den Gelen Metinler için Fallback
Component settings'den gelen metinler için fallback olarak çeviri kullanın:
```tsx
{settings.emptyCartMessage || t('cart_empty', 'cart')}
```

## Component Listesi ve Değişiklikler

### 1. **cart.tsx** ✅ (Örnek olarak tamamlandı)
- `t('cart_empty', 'cart')` - Boş sepet başlığı
- `t('cart_empty_message', 'cart')` - Boş sepet mesajı

### 2. **header.tsx**
- Navigation items
- Search placeholder
- Mobile menu text
- Account links

### 3. **product.tsx**
- Add to cart button
- Product labels (In Stock, Out of Stock)
- Product tabs (Description, Reviews)
- Size/variant selectors

### 4. **checkout-form.tsx**
- Form labels
- Validation messages
- Submit buttons
- Progress indicators

### 5. **login-form.tsx / register-form.tsx**
- Form fields
- Error messages
- Submit buttons
- Links

### 6. **footer.tsx**
- Newsletter
- Footer links
- Copyright text
- Social media labels

### 7. **collection-list.tsx**
- Filter labels
- Sort options
- No products message
- Load more button

### 8. **search-results.tsx**
- Search placeholder
- No results message
- Result count
- Suggestions

## Translation Key Naming Convention

### Namespace Yapısı:
- `common` - Genel kullanılan metinler
- `cart` - Sepet ile ilgili metinler
- `product` - Ürün detay sayfası
- `collection` - Koleksiyon/kategori sayfaları
- `account` - Hesap yönetimi
- `checkout` - Ödeme işlemleri
- `footer` - Footer bölümü
- `search` - Arama fonksiyonları
- `forms` - Form validasyonları
- `errors` - Hata mesajları

### Key Naming:
- Küçük harf ve underscore kullan: `add_to_cart`
- Açıklayıcı olsun: `cart_empty_message` (cart_msg değil)
- Nested yapılar için dot notation: `filters.clear_all`

## CSV Export Format
```csv
Language,Namespace,Key,Value
en,common,add_to_cart,"Add to Cart"
tr,common,add_to_cart,"Sepete Ekle"
es,common,add_to_cart,"Añadir al Carrito"
```

## Implementasyon Adımları

1. **Öncelik Sırası:**
   - Header/Footer (Her sayfada görünür)
   - Product sayfası (En çok ziyaret edilen)
   - Cart/Checkout (Dönüşüm için kritik)
   - Account sayfaları
   - Diğer sayfalar

2. **Test Stratejisi:**
   - Her component'i ayrı test et
   - Dil değiştirme fonksiyonunu test et
   - Fallback mekanizmasını test et
   - Missing translation'ları logla

3. **Performance Optimizasyonu:**
   - Translation'ları client-side cache'le
   - Lazy loading için namespace'leri böl
   - Default language için optimize et

## Helper Functions

### formatTranslation
Değişken içeren çeviriler için:
```tsx
// Translation: "Free shipping on orders over {amount}"
t('free_shipping_message', 'checkout').replace('{amount}', '$50')
```

### pluralize
Çoğul formlar için:
```tsx
// 1 item vs 3 items
const itemText = itemCount === 1 ? t('cart_item', 'cart') : t('cart_items', 'cart');
```

## Migration Checklist

- [ ] useTranslation hook'unu import et
- [ ] Component'te hook'u initialize et
- [ ] Tüm statik metinleri bul
- [ ] Translation key'lerini belirle
- [ ] Metinleri t() fonksiyonu ile değiştir
- [ ] Settings fallback'lerini ekle
- [ ] Component'i test et
- [ ] Missing translation'ları dokümante et

## Notlar

1. **Progressive Enhancement**: Önce İngilizce metinlerle başla, sonra diğer dilleri ekle
2. **SEO**: Meta tag'ler ve URL'ler için ayrı strateji gerekli
3. **Dynamic Content**: CMS'den gelen içerikler için ayrı çözüm
4. **Date/Time**: Tarih ve saat formatları için locale-specific formatting
5. **Currency**: Para birimi formatları için locale-aware formatting