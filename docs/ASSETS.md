# Varlık kaynakları

## Marka

Kullanıcının sağladığı `algebra-logo.jpeg`, `algebra-remove.png` ve `favicon.png` dosyaları değiştirilmeden `public/brand` içine kopyalandı. Header, footer ve favicon için kaynaklarından kayıpsız WebP sunum kopyaları oluşturuldu. `scripts/prepare-brand.mjs` her iki sunum kopyasının orijinal boyutları, alfa kanalı ve görünür RGB pikselleriyle birebir eşleştiğini otomatik doğrular. Logo sunum dosyası 163 KB'den 68 KB'ye, favicon 269 KB'den 107 KB'ye indi; orijinal dosyalar da korundu. CSS yalnızca logonun etrafındaki boş alanı görünüm kutusunun dışında tutar; logoyu yeniden çizmez, renklendirmez veya deforme etmez. Kaynak JPEG/PNG dosyalarının SHA-256 değerleri sağlanan dosyalarla aynıdır.

İletişim sayfası, kullanıcının sağladığı `Algebra Teknoloji_ Sürdürülebilir Gelecek.png` referansındaki Algebra tabelalı bina görselini kullanır. Gömülü eski menü, başlık, buton ve hizmet kutuları yerleşik image_gen ile temizlenerek `src/assets/contact-building.png` dosyasına kaydedildi. Bina, cephe tabelası, ışık yörüngeleri ve alttaki kırmızı dalgalar korundu. Orijinal referans ayrıca `src/assets/contact-reference.png` olarak saklandı. Görsel yalnızca iletişim sayfasında kullanılır. Prompt ve uygulama ayrıntıları [CONTACT-DESIGN.md](CONTACT-DESIGN.md) dosyasındadır.

## Fotoğraflar

Fotoğraflar [Unsplash lisansı](https://unsplash.com/license) altında erişilen görsellerdir. Ticari kurumsal kullanım lisans kapsamındadır; görsellerin değiştirilmeden yeniden satılması veya rakip fotoğraf koleksiyonu oluşturulması lisans kapsamında değildir. Dosyalar yerelleştirilmiştir; kullanıcı tarayıcısı Unsplash'a bağlanmaz. Fotoğraflar temsili stok görsellerdir; şirkete ait tesis veya tamamlanmış iş olarak sunulmaz.

| Yerel kaynak                 | İndirilen kaynak                                             |
| ---------------------------- | ------------------------------------------------------------ |
| `src/assets/hero.jpg`        | https://images.unsplash.com/photo-1451187580459-43490279c0fa |
| `src/assets/software.jpg`    | https://images.unsplash.com/photo-1551288049-bebda4e38f71    |
| `src/assets/datacenter.jpg`  | https://images.unsplash.com/photo-1558494949-ef010cbdcc31    |
| `src/assets/solar.jpg`       | https://images.unsplash.com/photo-1509391366360-2e959784a276 |
| `src/assets/engineering.jpg` | https://images.unsplash.com/photo-1486406146926-c627a92ad1ab |

Astro bu kaynaklardan farklı genişliklerde WebP üretir. İlk slider resmi eager/high priority, diğer slaytlar seçim anında yüklenir. Kart ve makale görselleri lazy ve srcset kullanır. `public/og-image.jpg` ilk görselin sosyal paylaşım türevidir; kurumsal logonun yeniden çizimi değildir.

## Coğrafya ve font

- Ülke sınırları: [Natural Earth 1:110m](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson). [Kamu malı kullanım koşulları](https://www.naturalearthdata.com/about/terms-of-use/). İndirilen veri sadece ad ve geometriyle sadeleştirilmiştir. Dünya texture'ı, Türkiye polygonu ve SVG fallback `scripts/prepare-globe.mjs` ile bu kaynaktan üretilir.
- Manrope: yerel variable WOFF2 Latin ve Latin Extended alt kümeleri. [Fontsource](https://fontsource.org/fonts/manrope), [SIL Open Font License kaynağı](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt). `font-display: swap`; Türkçe karakter alt kümesi ayrı yüklenir. Arapça ve Çince için işletim sisteminin Unicode fontları kullanılır.
- Arayüz ikonları: basit, özgün SVG çizgileri; marka logosu yerine geçmez.

Varlıkları tekrar indirmek için `node scripts/fetch-assets.mjs` ağ erişimi ve özgün Windows dosya yolunu gerektirir. Mevcut dosyalar depoda olduğundan normal kurulum ve build sırasında bu komut gerekli değildir.
