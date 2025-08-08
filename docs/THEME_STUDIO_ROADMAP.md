# Theme Studio Geliştirme Yol Haritası

Bu belge, "Theme Studio" özelliğini mevcut durumundan daha profesyonel, esnek ve güçlü bir tema yönetim sistemine dönüştürmek için gereken geliştirme adımlarını ve yeni özellikleri detaylandırmaktadır.

## 1. Mevcut Özelliklerin Geliştirilmesi

### 1.1. Global Tasarım Ayarları (Theme Settings)

Mevcut "Theme" sekmesi, marka kimliğini tam olarak yansıtmak için yetersizdir. Bu bölüm, tüm siteyi etkileyen global stil ayarlarını içerecek şekilde genişletilmelidir.

-   **[ ] Kapsamlı Tipografi Kontrolleri:**
    -   [ ] Farklı HTML başlıkları (H1, H2, H3, H4) için ayrı font ailesi, boyutu, kalınlığı ve satır yüksekliği ayarları.
    -   [ ] Paragraf metinleri için ayrı tipografi ayarları.
    -   [ ] Link (bağlantı) stilleri için renk ve alt çizgi gibi ayarlar.

-   **[ ] Detaylı Renk Paleti Yönetimi:**
    -   [ ] Mevcut "Primary" ve "Secondary" renklere ek olarak aşağıdaki renkleri tanımlama imkanı:
        -   `accent_color`: Vurgu ve dikkat çekici elementler için.
        -   `text_color`: Genel metin rengi.
        -   `background_color`: Site genel arka planı.
        -   `border_color`: Kenarlıklar ve ayırıcılar için varsayılan renk.
    -   [ ] Bu renklerin CSS değişkenleri (`--nuvi-primary`, `--nuvi-text`, vb.) olarak tema önizlemesine anında yansıması.

-   **[ ] Global Buton Stilleri:**
    -   [ ] Varsayılan butonlar için kenar yuvarlaklığı (`border-radius`).
    -   [ ] Buton dolgu (`padding`) değerleri (dikey ve yatay).
    -   [ ] Butonlar için varsayılan gölge efekti.
    -   [ ] Üzerine gelince (hover) ve aktif durumlar için stil ayarları.

-   **[ ] Genel Yerleşim (Layout) Ayarları:**
    -   [ ] Sitenin maksimum içerik genişliğini (`max-width`) belirleme seçeneği.
    -   [ ] Bölümler (sections) arasındaki dikey boşluğu ayarlama imkanı.

### 1.2. Gelişmiş Bölüm (Section) Editörü

"Inline" editör, karmaşık bölümlerin tüm potansiyelini kullanmak için yetersiz kalmaktadır.

-   **[ ] Detaylı Bölüm Ayarları Arayüzü:**
    -   [ ] "Advanced settings →" linkini işlevsel hale getirmek.
    -   [ ] Tıklandığında, seçili bölüme ait **tüm ayarları** içeren bir modal veya kenar çubuğu paneli açmak.
    -   [ ] Bu panelde ayarların mantıksal gruplar halinde (örneğin, "İçerik", "Tasarım", "Arka Plan") sunulması.

### 1.3. Tam İşlevsel Geri Al/İleri Al (Undo/Redo)

Bu özellik, kullanıcı deneyimi için kritik öneme sahiptir ancak şu an işlevsel değildir.

-   **[ ] Durum Yönetimi (State Management) Entegrasyonu:**
    -   [ ] Yapılan her değişikliği (bölüm ekleme/silme/taşıma, ayar değiştirme) bir "geçmiş" (history) dizisine kaydeden bir sistem kurmak.
    -   [ ] `Undo` butonuna basıldığında bir önceki duruma, `Redo` ile bir sonraki duruma geçilmesini sağlamak.
    -   [ ] Klavye kısayolları (`Cmd+Z` / `Cmd+Shift+Z`) atamak.

### 1.4. Gerçekten "Akıllı" AI Özellikleri

AI sekmesi şu an statik öneriler sunmaktadır. Bu bölümü dinamik ve işlevsel hale getirmek gerekir.

-   **[ ] Dinamik Renk Paleti Üretici:**
    -   [ ] Kullanıcının girdiği bir ana renge veya yüklediği bir logoya göre uyumlu renk paletleri (tamamlayıcı, analog vb.) üreten bir API entegrasyonu.
    -   [ ] Üretilen paleti tek tıkla Global Renk Ayarlarına uygulama seçeneği.

-   **[ ] Bağlama Duyarlı İçerik Önerileri:**
    -   [ ] Mağazanın mevcut içeriğini (ürün sayısı, sayfa varlığı vb.) analiz edip buna göre öneriler sunan bir mantık geliştirmek. Örnek: "Mağazanızda 10'dan fazla ürün var, bir 'En Çok Satanlar' bölümü ekleyerek satışları artırabilirsiniz."

---

## 2. Yeni Özellikler

### 2.1. Duyarlı Tasarım (Responsive) Kontrolleri

Bu, modern web tasarımının temelidir ve Theme Studio'ya en yüksek önceliklerden biri olarak eklenmelidir.

-   **[ ] Cihaza Özel Ayarlar:**
    -   [ ] Font boyutu, boşluklar (`padding`/`margin`), sütun sayısı gibi birçok ayarın yanına **Masaüstü, Tablet, Mobil ikonları** eklemek.
    -   [ ] Kullanıcının bir ikona tıklayarak sadece o cihaz görünümü için geçerli olacak bir değer girmesini sağlamak.
    -   [ ] Bir değer girilmediğinde, varsayılan olarak daha büyük ekranın değerini miras almasını sağlamak (Desktop → Tablet → Mobile).

### 2.2. Taslak (Draft) ve Yayınlama (Publish) Sistemi

"Auto-saving" özelliği, canlı siteyi bozma riski taşıdığı için profesyonel kullanımda risklidir.

-   **[ ] Taslak Modu:**
    -   [ ] Tüm değişikliklerin varsayılan olarak canlıya yansımayan bir "taslak" (draft) sürümüne kaydedilmesi.
    -   [ ] Arayüzde "Değişiklikler kaydedildi (taslak)" gibi bir bildirim göstermek.

-   **[ ] Yayınlama Akışı:**
    -   [ ] Kullanıcı hazır olduğunda değişiklikleri canlıya almak için bir **"Yayınla" (Publish)** butonu eklemek.
    -   [ ] Yayınlama öncesinde yapılan değişikliklerin bir özetini gösteren bir onay penceresi sunmak.

### 2.3. Sürüm Geçmişi ve Geri Yükleme (Version History)

Kullanıcılara hatalı değişikliklerden kolayca geri dönme güvencesi verir.

-   **[ ] Sürüm Anlık Görüntüleri (Snapshots):**
    -   [ ] Her "Yayınlama" işleminden sonra tüm tema ayarlarının ve bölüm yapısının bir anlık görüntüsünü veritabanına kaydetmek.
    -   [ ] Bu anlık görüntülere tarih ve saat bilgisi eklemek.

-   **[ ] Geri Yükleme Arayüzü:**
    -   [ ] Kullanıcının geçmiş sürümleri listeleyebileceği bir arayüz oluşturmak.
    -   [ ] Herhangi bir geçmiş sürümü önizleme ve tek tıkla o sürüme geri yükleme imkanı sunmak.

### 2.4. Gelişmiş Tema Yönetimi

Kullanıcılara temaları üzerinde daha fazla kontrol ve esneklik sağlar.

-   **[ ] Temayı Çoğalt (Duplicate Theme):**
    -   [ ] Tema kütüphanesinde, aktif temanın tüm ayarlarıyla birlikte bir kopyasını oluşturan bir "Çoğalt" butonu eklemek.

-   **[ ] Ayarları Dışa/İçe Aktar (Export/Import Settings):**
    -   [ ] Tema ayarlarını bir JSON dosyası olarak indirme ("Dışa Aktar") seçeneği.
    -   [ ] Bir JSON dosyasından ayarları yükleyerek temayı yapılandırma ("İçe Aktar") seçeneği. Bu, tema geçişlerini ve yedeklemeyi kolaylaştırır.
