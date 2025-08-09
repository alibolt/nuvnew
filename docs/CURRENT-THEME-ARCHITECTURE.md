# Mevcut Tema Mimarisi Analizi

## 🔴 Mevcut Durum - Sorunlar

### 1. Sabit Tema Referansları
Kodda sabit tema isimleri ve import'lar var:
- `@/themes/base`
- `@/themes/skateshop` 
- `themeCode === 'commerce'` gibi kontroller

### 2. Tema Eklemek/Kaldırmak Zor
- Yeni tema eklemek kod değişikliği gerektiriyor
- Tema kaldırıldığında import hataları oluşabiliyor
- Build time'da tüm temalar bilinmeli

### 3. Temalar Arası Bağımlılık
- Bir temadan section silince diğeri etkilenebiliyor
- Ortak kod paylaşımı karmaşık

## ✅ Olması Gereken: Plugin Sistemi

### Ideal Tema Yapısı
```
themes/
├── registry.json              # Kurulu temaların listesi
├── base/
│   ├── manifest.json          # Tema tanımı
│   ├── package.json           # Bağımlılıklar
│   └── ...
└── skateshop/
    ├── manifest.json
    └── ...
```

### Tema Yükleme Akışı
1. **Discovery**: `themes/` klasörü taranır
2. **Registration**: Temalar registry'ye kaydedilir  
3. **Loading**: İhtiyaç halinde dinamik olarak yüklenir
4. **Unloading**: Kullanılmayan temalar bellekten çıkarılır

## 🛠️ Önerilen Çözüm

### 1. Theme Registry Service
```typescript
class ThemeRegistry {
  discover()    // Temaları otomatik bul
  register()    // Tema kaydet
  unregister()  // Tema kaldır
  getTheme()    // Tema bilgisi al
  listThemes()  // Tüm temaları listele
}
```

### 2. Dynamic Theme Loader
```typescript
class DynamicThemeLoader {
  async loadSection(themeId, sectionName)
  async loadBlock(themeId, blockName)
  async loadStyles(themeId)
  async loadConfig(themeId)
}
```

### 3. Tema API Endpoints
- `GET /api/themes` - Kurulu temaları listele
- `POST /api/themes/install` - Tema kur
- `DELETE /api/themes/uninstall` - Tema kaldır
- `GET /api/themes/[id]/sections` - Tema section'larını getir

## 📋 Yapılması Gerekenler

### Kısa Vadeli (Quick Fix)
1. ✅ `commerce` -> `base` mapping'lerini kaldır
2. Store'da hangi tema aktifse onu kullan
3. Tema olmayan durumlarda fallback tema belirle

### Orta Vadeli
1. Theme Registry sistemi kur
2. Dinamik import mekanizması oluştur
3. Tema kurulum/kaldırma API'leri ekle

### Uzun Vadeli  
1. Theme marketplace altyapısı
2. Tema versiyon yönetimi
3. Tema bağımlılık yönetimi
4. Hot-reload tema geliştirme

## 💡 Cevap

**Evet, yapınız plugin sistemi gibi olmalı!**

Şu anda:
- ❌ Temalar kodda hardcoded
- ❌ Dinamik ekleme/çıkarma yok
- ❌ Temalar arası bağımlılık var

Olması gereken:
- ✅ Temalar bağımsız paketler
- ✅ Runtime'da yüklenebilir/kaldırılabilir
- ✅ Kodda tema ismi referansı yok
- ✅ Tema silinince sistem çalışmaya devam eder

**Önerim**: Önce mevcut 2 temayı düzgün çalıştırın, sonra plugin sistemine geçiş yapın.