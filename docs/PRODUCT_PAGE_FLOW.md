# Ürün Sayfası Akışı ve Default Yapısı

## Tema Aktif Edildiğinde Ürün Sayfası

Bir kullanıcı mağazasında temayı aktif ettiğinde, Theme Studio'da aşağıdaki ürün sayfası yapısını görecek:

### 1. Default Template Yapısı

Commerce teması için default ürün template'i (`/themes/commerce/templates/product.json`):

```json
{
  "name": "Product",
  "sections": [
    {
      "type": "product-detail",
      "settings": {
        "showBreadcrumbs": true,
        "imageLayout": "gallery",
        "showZoom": true,
        "showThumbnails": true,
        "showSocialShare": true,
        "showQuantitySelector": true,
        "showStockStatus": true,
        "showProductTabs": true
      }
    },
    {
      "type": "related-products",
      "settings": {
        "title": "You May Also Like",
        "productsToShow": 4,
        "productsPerRow": "4"
      }
    },
    {
      "type": "recently-viewed",
      "settings": {
        "title": "Recently Viewed",
        "productsToShow": 4,
        "productsPerRow": "4"
      }
    }
  ]
}
```

### 2. Product Detail Section'ın Default Ayarları

`product-detail` section'ı için zengin bir ayar şeması var (`/lib/section-schemas/product-detail.ts`):

#### Layout Ayarları:
- **layout**: `modern-two-column` (default)
  - Modern Two Column
  - Wide Gallery
  - Minimal Center
  - Split Screen
  - Stacked Mobile
  - **Flexible** (yeni container-based yapı)

- **columnRatio**: `50-50` (gallery ve info kolonları için)
- **containerWidth**: `default` (1200px)
- **paddingTop/Bottom**: `medium`
- **backgroundColor**: `transparent`
- **stickyInfo**: `true` (info kolonu sabit kalır)
- **mobileLayout**: `stacked`

#### Görsel Galeri Ayarları:
- **showBreadcrumbs**: `true`
- **imageLayout**: `gallery`
- **showZoom**: `true`
- **showThumbnails**: `true`
- **thumbnailPosition**: `bottom`

#### Ürün Bilgi Ayarları:
- **showVendor**: `false`
- **showSku**: `false`
- **showTags**: `true`
- **showRating**: `true`
- **showComparePrice**: `true`
- **showSavings**: `true`
- **showStockStatus**: `true`
- **showQuantitySelector**: `true`
- **addToCartText**: "Add to Cart"
- **showBuyNow**: `true`
- **showSocialShare**: `true`
- **showWishlist**: `true`

#### Tab Ayarları:
- **showProductTabs**: `true`
- **tabsLayout**: `horizontal`
- **showDescription**: `true`
- **showShipping**: `true`
- **shippingContent**: "Free shipping on orders over $100. 30-day return policy."

### 3. Flexible Layout ile Container Yapısı

Eğer layout `flexible` seçilirse, kullanıcı container ve block'lar ile özel düzen oluşturabilir:

```
Product Detail Section
├── Container (horizontal, 50-50)
│   ├── Product Gallery Block
│   └── Container (vertical)
│       ├── Product Title
│       ├── Product Price
│       ├── Product Variants
│       └── Product Form (Add to Cart)
└── Container (vertical)
    ├── Text Block (Description başlığı)
    └── Product Description Block
```

### 4. Mevcut Block'lar

Product detail section içinde kullanılabilecek block'lar:
- `breadcrumbs` - Sayfa yolu
- `product-gallery` - Ürün görselleri
- `product-title` - Ürün başlığı
- `product-price` - Fiyat bilgisi
- `product-vendor` - Marka/satıcı
- `product-rating` - Ürün puanı
- `product-variants` - Renk/beden seçenekleri
- `product-form` - Sepete ekle formu
- `product-availability` - Stok durumu
- `product-sku` - Ürün kodu
- `product-tags` - Ürün etiketleri
- `social-share` - Sosyal paylaşım
- `container` - Layout container'ı
- `text` - Metin block'u
- `icon-group` - İkon grupları

### 5. Theme Studio'da Görünüm

Theme Studio'da kullanıcı:
1. Sol tarafta section listesinde "Product Detail" section'ını görecek
2. Section'a tıkladığında sağ tarafta yukarıdaki tüm ayarları görecek
3. Eğer layout "flexible" ise, "Add Block" butonu ile yeni block'lar ekleyebilecek
4. Container'lar içinde iç içe yapılar oluşturabilecek
5. Drag & drop ile block'ları yeniden düzenleyebilecek

### 6. Önemli Notlar

- Eski `product-gallery`, `product-info`, `product-description`, `product-reviews` section'ları kaldırıldı
- Tüm ürün sayfası tek bir `product-detail` section'ı ile yönetiliyor
- Container-based yapı sayesinde çok daha esnek düzenler mümkün
- Mobile responsive ayarlar otomatik olarak uygulanıyor
- Tüm block'lar container içinde kullanılabilir (allowedInContainers: true)