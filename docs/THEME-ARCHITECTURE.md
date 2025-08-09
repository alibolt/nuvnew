# Theme Architecture Documentation

## 🎨 Tema Yapısı

### Tema Dizin Yapısı
```
themes/
├── base/                    # Base tema
│   ├── index.ts            # Tema ana dosyası
│   ├── theme-settings.json # Tema ayarları
│   ├── theme.json          # Tema manifest
│   ├── sections/           # Section componentleri
│   ├── blocks/             # Block componentleri
│   ├── styles/             # Tema stilleri
│   ├── schemas/            # Schema tanımları
│   └── available-sections.ts # Theme Studio section listesi
│
└── skateshop/              # Skateshop teması
    └── [aynı yapı]
```

## 📄 Sayfa Sistemi

### Dinamik Sayfalar (Temadan Yüklenen)
Bu sayfalar Theme Studio'da düzenlenebilir ve tema tarafından kontrol edilir:

1. **Homepage** (`/`)
   - Ana sayfa
   - Theme Studio'da özelleştirilebilir
   - Sections: Hero, Categories, Product Grid, Features, etc.

2. **Collection Pages** (`/collections/[handle]`)
   - Kategori/koleksiyon sayfaları
   - Dinamik filtreleme ve sıralama
   - Sections: Collection Banner, Product Grid, Filters

3. **Product Pages** (`/products/[handle]`)
   - Ürün detay sayfaları
   - Product Gallery, Info, Related Products
   - Add to Cart, Reviews sections

4. **Search Page** (`/search`)
   - Arama sonuçları sayfası
   - Search Bar, Results Grid, Filters

5. **Cart Page** (`/cart`)
   - Sepet sayfası
   - Cart Items, Summary, Recommendations

### Statik Sayfalar (Temadan Bağımsız)
Bu sayfalar sistem tarafından yönetilir ve tema değişikliğinden etkilenmez:

1. **Checkout** (`/checkout`)
   - ✅ Temadan bağımsız
   - Güvenlik için statik
   - Standart checkout flow
   - Payment processing

2. **Account Pages** (`/account/*`)
   - Login/Register
   - Account Dashboard
   - Order History
   - Address Book
   - Temadan bağımsız, güvenlik odaklı

3. **Admin/Dashboard** (`/dashboard/*`)
   - Store yönetimi
   - Tamamen temadan bağımsız
   - Admin paneli

4. **Legal Pages**
   - Terms of Service (`/terms`)
   - Privacy Policy (`/privacy`)
   - Return Policy (`/returns`)
   - Genelde statik içerik

## 🔧 Theme Studio ile İlişki

### Düzenlenebilir Sayfalar
Theme Studio'da şu sayfalar düzenlenebilir:
- Homepage
- Collection Template
- Product Template
- Search Template
- Cart Template

### Section Türleri
1. **Global Sections**
   - Header
   - Footer
   - Announcement Bar

2. **Page Sections**
   - Hero
   - Product Grid
   - Categories
   - Features
   - Testimonials
   - Newsletter

3. **Product Sections**
   - Product Gallery
   - Product Info
   - Add to Cart
   - Related Products
   - Reviews

## 🎯 MVP Theme Settings

Her tema şu temel ayarlara sahip:

### 1. Colors (Renkler)
- Primary Color
- Secondary Color
- Background Color
- Text Color
- Border Color
- Error/Success Colors

### 2. Typography (Tipografi)
- Heading Font
- Body Font
- Font Size
- Line Height
- Heading Scale

### 3. Layout (Yerleşim)
- Container Width
- Section Spacing
- Border Radius
- Sidebar Position

### 4. Header Settings
- Header Style
- Sticky Header
- Search Display
- Cart Count

### 5. Product Settings
- Card Style
- Image Aspect Ratio
- Quick Add
- Vendor Display

## 🚀 Tema Geçiş Süreci

1. **Tema Aktivasyonu**
   - Themes sayfasından tema seçilir
   - Store'un `themeCode` güncellenir
   - Theme Studio yeni tema ile yüklenir

2. **Tema Özelleştirme**
   - Theme Studio'da sections eklenir/düzenlenir
   - Theme Settings'den görünüm ayarlanır
   - Değişiklikler draft olarak kaydedilir

3. **Yayınlama**
   - Publish butonu ile değişiklikler yayınlanır
   - Store'un theme bilgisi database'e kaydedilir
   - Frontend yeni tema ile render edilir

## 🔐 Güvenlik ve İzolasyon

### Temadan Bağımsız Alanlar
- **Checkout**: Ödeme güvenliği için izole
- **Account**: Kullanıcı bilgileri korumalı
- **Admin**: Yönetim paneli ayrı

### Tema Sandbox
- Temalar birbirinden izole
- Her tema kendi asset'lerini yükler
- Cross-theme contamination yok

## 📦 Asset Yönetimi

### Tema Asset'leri
```
themes/[theme-name]/
├── styles/
│   ├── theme-styles.js    # Tema CSS'leri
│   └── variables.css       # CSS değişkenleri
├── assets/
│   ├── fonts/             # Tema fontları
│   └── images/            # Tema görselleri
```

### Global Asset'ler
```
public/
├── images/                # Ürün görselleri
├── uploads/              # Kullanıcı yüklemeleri
└── static/               # Sistem asset'leri
```

## 🔄 Tema Yaşam Döngüsü

1. **Development**
   - Yeni tema `themes/` klasörüne eklenir
   - Sections ve blocks geliştirilir
   - Theme settings tanımlanır

2. **Testing**
   - Theme Studio'da test edilir
   - Preview mode ile kontrol
   - Cross-browser test

3. **Production**
   - Tema aktif edilir
   - Settings optimize edilir
   - Performance monitoring

## 📊 Performans Optimizasyonu

### Lazy Loading
- Sections lazy load edilir
- Görünür olmayan içerik yüklenmez
- Dynamic imports kullanılır

### Caching
- Theme settings cache'lenir
- Static sections önbellekte
- API responses cache

### Bundle Optimization
- Tema başına ayrı bundle
- Tree shaking
- Code splitting

## 🛠️ Geliştirici Notları

### Yeni Tema Ekleme
1. `themes/` altında yeni klasör
2. `index.ts` ile tema export
3. `theme-settings.json` tanımla
4. Sections ve blocks ekle
5. `available-sections.ts` oluştur

### Section Geliştirme
- Her section kendi klasöründe
- Props: `settings`, `store`
- Schema export zorunlu
- Responsive tasarım

### Block Geliştirme
- Reusable componentler
- Props standardı
- Schema tanımı
- Nested blocks desteği