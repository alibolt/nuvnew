# Online Store / Themes Bölümü - Yapılacaklar Listesi

## Güncelleme: Theme Store yerine Sektöre Özel Ücretsiz Temalar

Kullanıcılar theme store'dan tema satın almak yerine, sektörlerine özel hazırlanmış profesyonel temalardan ücretsiz olarak seçim yapabilecekler.

## 1. Theme Yönetimi Altyapısı
- [ ] Theme veri modelini tasarla (Prisma schema)
  - Theme bilgileri (isim, açıklama, versiyon, yazar)
  - Theme ayarları (renk şemaları, tipografi, layout)
  - Theme varlıkları (CSS, JS, resimler)
  - Theme kategorileri ve etiketleri
- [ ] Theme API endpoints oluştur
  - GET /api/stores/:storeId/themes (tüm temalar)
  - GET /api/stores/:storeId/themes/:themeId (tek tema)
  - POST /api/stores/:storeId/themes (tema yükle)
  - PUT /api/stores/:storeId/themes/:themeId (tema güncelle)
  - DELETE /api/stores/:storeId/themes/:themeId (tema sil)
  - POST /api/stores/:storeId/themes/:themeId/activate (tema aktif et)

## 2. Theme Kütüphanesi / Marketplace
- [ ] Theme listeleme sayfası
  - Grid görünümde tema kartları
  - Tema önizleme resimleri
  - Tema detayları (özellikler, sektör, stil)
  - Filtreleme (sektör, stil, ücretsiz/ücretli)
  - Arama fonksiyonu
- [ ] Tema kategorileri
  - Sektöre göre (Moda, Elektronik, Gıda, vb.)
  - Stile göre (Minimal, Modern, Klasik, vb.)
  - Özelliklere göre (Blog destekli, Çok dilli, vb.)
- [ ] Tema detay sayfası
  - Büyük önizleme görselleri
  - Özellik listesi
  - Demo linki
  - Kurulum butonu
  - Tema değerlendirmeleri

## 3. Theme Editörü / Customizer
- [ ] Canlı önizleme paneli
  - Responsive önizleme (Desktop, Tablet, Mobil)
  - Farklı sayfa önizlemeleri (Ana sayfa, Ürün, Koleksiyon, vb.)
  - Gerçek mağaza verileriyle önizleme
- [ ] Tema ayarları paneli
  - Renk şeması editörü
    - Ana renkler
    - Arka plan renkleri
    - Metin renkleri
    - Buton renkleri
  - Tipografi ayarları
    - Font ailesi seçimi
    - Font boyutları
    - Satır yükseklikleri
  - Layout ayarları
    - Header stilleri
    - Footer yapısı
    - Sidebar pozisyonları
  - Ana sayfa bölümleri
    - Hero/Banner ayarları
    - Ürün vitrinleri
    - Koleksiyon gösterimi
    - Müşteri yorumları
  - Ürün sayfası ayarları
    - Galeri stili
    - Bilgi düzeni
    - İlgili ürünler
- [ ] Kod editörü (ileri seviye kullanıcılar için)
  - HTML/Liquid template düzenleme
  - CSS düzenleme
  - JavaScript düzenleme
  - Syntax highlighting
  - Otomatik tamamlama

## 4. Theme Özellikleri
- [ ] Tema versiyonlama
  - Otomatik yedekleme
  - Versiyon geçmişi
  - Geri alma/ileri alma
- [ ] Tema dışa/içe aktarma
  - Tema ZIP olarak indirme
  - Tema yükleme
  - Tema paylaşma
- [ ] Çoklu tema desteği
  - Farklı temalar arasında geçiş
  - A/B test için farklı temalar
  - Sezonluk tema değişiklikleri

## 5. Hazır Tema Şablonları
- [ ] Temel temalar (5-10 adet)
  - Dawn (minimal, hızlı)
  - Craft (el yapımı ürünler)
  - Sense (moda odaklı)
  - Studio (sanat/tasarım)
  - Taste (yiyecek/içecek)
- [ ] Her tema için:
  - Responsive tasarım
  - SEO optimizasyonu
  - Hız optimizasyonu
  - Erişilebilirlik standartları
  - Çoklu dil desteği

## 6. Theme API ve Liquid Desteği
- [ ] Liquid template engine entegrasyonu
- [ ] Theme API dokümantasyonu
  - Kullanılabilir değişkenler
  - Filtreler ve fonksiyonlar
  - Özel bölümler oluşturma
- [ ] Developer araçları
  - Theme Kit CLI
  - Local development desteği
  - Hot reload

## 7. Performance ve Optimizasyon
- [ ] Tema performans analizi
  - Sayfa yükleme hızı
  - Core Web Vitals skorları
  - Mobil performans
- [ ] Otomatik optimizasyonlar
  - Resim optimizasyonu
  - CSS/JS minification
  - Lazy loading
  - CDN entegrasyonu

## 8. Entegrasyonlar
- [ ] Google Fonts entegrasyonu
- [ ] Unsplash/Pexels stok fotoğraf entegrasyonu
- [ ] Icon kütüphaneleri (Font Awesome, Feather, vb.)
- [ ] Sosyal medya widget'ları

## 9. Güvenlik ve İzinler
- [ ] Tema kodu güvenlik taraması
- [ ] Kötü amaçlı kod kontrolü
- [ ] API erişim kısıtlamaları
- [ ] Tema düzenleme yetkileri

## 10. Dokümantasyon ve Destek
- [ ] Tema geliştirme kılavuzu
- [ ] Video eğitimler
- [ ] Örnek kod parçacıkları
- [ ] Sık sorulan sorular
- [ ] Topluluk forumu

## Teknik Gereksinimler
- Next.js 14+ App Router
- Liquid template engine veya benzeri
- Monaco Editor (kod düzenleme için)
- Tailwind CSS
- Framer Motion (animasyonlar)
- React Color (renk seçici)
- React DnD (sürükle-bırak)

## Öncelik Sıralaması
1. Temel tema yönetimi ve listeleme
2. Tema customizer (renk, tipografi, logo)
3. Hazır tema şablonları
4. Canlı önizleme
5. Gelişmiş özelleştirmeler
6. Kod editörü
7. Theme marketplace
8. Developer araçları

## Tahmini Süre
- Faz 1 (Temel özellikler): 2-3 hafta
- Faz 2 (Customizer): 2-3 hafta  
- Faz 3 (Marketplace): 1-2 hafta
- Faz 4 (Developer araçları): 1-2 hafta

Toplam: 6-10 hafta