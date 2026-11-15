# İletişim sayfası — tek ekran

Kullanıcının paylaştığı bina görseli iletişim sayfasına taşındı. Bu görsel ana sayfada kullanılmaz. Eski hizmet kutuları, slider kontrolleri, uzun sayfa hero'su, bina placeholder'ı, alt form/harita bölümü ve kurumsal footer iletişim ana sayfasından kaldırıldı. Gerçek header, iletişim metinleri ve teklif/iş birliği bağlantıları aynı ekranın içinde yer alır.

Görsel `object-fit: cover` ile üst menünün arkasından sayfanın alt kenarına kadar bütün ekranı kaplar; sağda, solda veya altta çerçeve boşluğu bırakılmaz. Masaüstü, tablet ve telefonda ayrı odak konumları binanın tabelasını kadrajda tutar. Telefonlarda da görsel ayrı bir üst blok yerine tam ekran arka plandır. Responsive kaynak seçimi yalnızca ekran genişliğini değil, görselin `cover` ile kapladığı gerçek genişliği de dikkate alır; portre ekranlarda gereğinden küçük fotoğraf seçilmez.

Okunabilirlik için sol ve alt bölgelerde yumuşak koyu geçiş, daha büyük yazı ve butonlar kullanılır. Kısa telefonlarda daha kompakt, yatay telefonlarda iki sütunlu düzen uygulanır. İçerik tek ekranda kalır; metin ve kontrol alanları kesilmez. Kullanıcının sağladığı adres, telefon ve e-posta `src/data/contact.ts` dosyasındaki ortak kayıttan alınır; adres Google Maps'e, telefon `tel:+903122806161` ve e-posta `mailto:info@algebrateknoloji.com` bağlantılarına gider. Aynı bilgiler footer ve Organization JSON-LD verisinde de kullanılır. Başvuru formları ayrı mevcut teklif ve iş birliği sayfalarında kalır; mevcut gönderim-servisi sınırı değişmez.

Marka vurguları `src/data/brand.ts` kaynağındaki `#D00024` kurumsal kırmızısını kullanır. Açık/pembe kırmızı kaldırılmıştır; buton hover tonu daha koyudur. Aynı kaynak 3D dünya ve üretilen harita varlıklarının rengini de belirler. Küçük metinler kontrast için nötr beyazdır.

## Kaynaklar ve kayıtlı varlıklar

- Kullanıcının sağladığı orijinal: `src/assets/contact-reference.png`.
- Sayfanın kullandığı temizlenmiş görsel: `src/assets/contact-building.png`.
- Bileşen: `src/components/sections/ContactScene.astro`.
- Stiller: `src/styles/contact.css`.
- Araç: yerleşik `image_gen`, düzenleme modu. CLI veya harici API anahtarı kullanılmadı. Temizleme çıktısı yeni bir dosyada saklandı; kaynak değiştirilmedi.

## Doğrulama

`node scripts/qa-contact.mjs` ile 360×640, 360×740, 390×664, 390×844, 768×1024, 820×1180, 844×390, 1024×768, 1280×720, 1440×900, 1536×776, 1920×970, 1920×1080 ve 2560×1080 boyutları denetlenir. Sayfanın tek ekrana sığması, yatay/dikey taşma olmaması, görselin dört kenarda da viewport'u kaplaması ve `cover` davranışı, görselin yüklenmesi, eski alt bölümlerin yokluğu, iletişim menüsünün aktifliği ve teklif bağlantısı kontrol edilir. Mobil ve masaüstünde axe WCAG A/AA taraması uygulanır. Sonuçlar `reports/contact-qa.json` ve ekran görüntüleri `reports/contact-*.png` dosyalarındadır.

İlk iletişim güncellemesinde 14 boyutun tamamı geçti. On dil güncellemesinde `node scripts/qa-languages.mjs` ile dört ekran boyutunda toplam 40 dil / yerleşim kombinasyonu ayrıca kontrol edilir; açık dil dropdown'u da ekran sınırlarında kalmalıdır. Yerel bayraklar ve seçili dil adı bulunur. Verilen iletişim bilgileri ve `#D00024` kurumsal rengi korunur. Güncel build, çeviri, bağlantı, Playwright ve erişilebilirlik sonuçları [VALIDATION.md](VALIDATION.md) dosyasındadır.

## Kullanılan düzenleme promptu (yerleşik araç)

Use case: precise-object-edit. Edit target: the attached existing website screenshot. Asset type: clean background plate for this exact company's contact webpage, landscape 16:9. Keep the existing building, its architecture and exact facade sign 'Algebra Teknoloji', trees, entrance, sunset, dark left area, red glowing light trails around the building, and red particle waves along the bottom EXACTLY as in the input. Do not replace or redesign the building, do not change the colors, framing or style, do not invent architecture or signage. Remove ONLY the overlaid website user interface: entire top navigation bar and its text/logo, the left headline and description, both CTA buttons, the left/right round slider arrows, the slide count and indicators, and the four service cards with their icons and text across the bottom. Fill those removed UI areas seamlessly with the existing sky, trees, dark atmosphere and background. Preserve the building facade's actual red-and-white Algebra Teknoloji sign untouched. Do not add any new text, buttons, forms or UI. Preserve full original scene framing with building entirely visible and the light trails and lower red waves intact; no zoom or crop. The result should be the same image without the overlaid web interface, ready for real HTML contact content.
