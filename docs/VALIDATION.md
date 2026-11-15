# Doğrulama sonuçları

14 Kasım 2026, Windows, yerel Google Chrome. Güncel çeviri ve etkileşim kontrolleri background geliştirme sunucusu localhost:4321 üzerinde çalıştırıldı. Lighthouse 13.6.0 tablosu ilk sürümün üretim çıktısına aittir; on dil güncellemesinde yeniden ölçülmedi.

## Build ve içerik

- `npm run check`: 0 hata, 0 uyarı, 0 ipucu. Son çıktı: `reports/typecheck.log`.
- `npm run build`: başarılı, 981 HTML sayfası. Son çıktı: `reports/build.log`.
- `npm run test:content`: 65927 yerel bağlantı ve 22385 varlık / responsive srcset referansı; 0 hata.
- H1 tekilliği, başlıkların tekilliği, açıklamalar, canonical, sosyal metadata, JSON-LD, DOM id'leri, dosya ve fragment hedefleri denetlendi.
- 1.130 UI metni; anahtar ve dizi boyutu eşitliği, boş / kopyalanmış Türkçe UI çevirisi, çeviri işaretleri ve sayı yer tutucuları kontrol edildi. On dilin yayın ve RTL kayıtları doğrulandı.
- 98 sayfanın her dilde bulunduğu, her Türkçe metnin dokuz karşılığının olduğu, çevirisiz Türkçe metin kalmadığı ve iç bağlantıların seçili dilde kaldığı doğrulandı. Her sayfada on hreflang ve x-default; her sitemap'te 98 sayfa kontrol edildi. Projeler rotası bulunmadığı doğrulandı.
- Orijinal JPEG ve şeffaf PNG logolarının SHA-256 değerleri kaynak dosyalarla eşleşti. Kayıpsız WebP kopyaları ayrıca piksel / alfa eşitliğiyle doğrulandı.

## Playwright

41 başarılı, 0 başarısız, 1 atlanan test. Genel regresyon ve düzeltme sonrası odaklı çalıştırmalarda her testin en son sonucu kullanılır. Atlanan test, masaüstü grubunda zaten çalışan viewport matrisinin mobil projedeki tekrarıdır. Birleştirilmiş sonuç: `reports/browser-validation-summary.json`.

- On dilin ana sayfaları, aynı detay sayfasını koruyan dil geçişleri, yerel SVG bayrakları, seçili dil adı ve Arapça RTL.
- On dilde katalog araması ve form durum mesajları; açık dil dropdown'unda bayrakların yüklenmesi ve axe erişilebilirliği.
- Slider ileri / geri, klavye, kullanıcı etkileşiminde otomatik geçişin durması.
- İlk ekran öncesinde 3D texture yüklenmemesi; görünürlükle gerçek Canvas sahnesi; manuel duraklatma ve reduced-motion.
- WebGL kapalıyken coğrafi SVG fallback.
- Mobil menü, hizmet araması, detay rotası ve FAQ.
- Form doğrulaması, mesajın gönderilmediğinin açık bildirimi, POST ve tarayıcı depolaması olmaması.
- JavaScript kapalıyken formun veri gönderememesi.
- Geçersiz URL ve desteklenmeyen dil rotalarında HTTP 404.
- Ana sayfa, Arapça, Çince, hizmet, çözüm ve iletişim şablonlarında axe WCAG 2 A/AA ve 2.1 A/AA taraması.
- 360, 768, 1024 ve 1920 px genişliklerde sekiz temsilî sayfanın yatay taşma kontrolü.
- İletişim sayfasında 360×640, 844×390, 1024×768 ve 1920×1080 boyutlarında on dil: 40 yerleşimde taşma, menü / footer çakışması ve açık dil dropdown'unun ekran sınırları kontrol edildi. JSON: `reports/language-layout.json`.

## Lighthouse

| Profil | Performans | Erişilebilirlik | İyi uygulamalar | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobil | 93 | 100 | 100 | 100 | 3.11 s | 105 ms | 0.000 |
| Masaüstü | 100 | 100 | 100 | 100 | 0.66 s | 0 ms | 0.000 |

Mobil ilk ölçüm 75 performans, 5.29 s LCP idi. Görünmeyen içerik çizimi, görsel boyutları, responsive seçim, font öncelikleri ve kayıpsız marka dosyaları optimize edildi. Sonuçlar son iki HTML / JSON raporunda tutulur:

- `reports/lighthouse-mobile.report.html`, `reports/lighthouse-mobile.report.json`
- `reports/lighthouse-desktop.report.html`, `reports/lighthouse-desktop.report.json`

## Sınırlar

Lighthouse sonuçları tek bir yerel laboratuvar ölçümüdür; üretim garantisi veya gerçek kullanıcı INP ölçümü değildir. INP ölçülmedi. LCP hedefi 2.5 s, CLS hedefi 0.1'dir; tabloda gerçek sonuçlar verilmiştir. Headless Chrome WebGL doğrulaması fiziksel telefon ve GPU testi yerine geçmez. Otomatik erişilebilirlik taraması manuel ekran okuyucu denetiminin tamamını kapsamaz. Harici web sitelerinin her bağlantısı ve tüm fiziksel cihazlar test edilmedi.

Form backend'i, gerçek e-posta teslimi, CV yüklemesi, üretim hosting'i, alan adı ve canlı harita henüz yapılandırılmadığından bunlar uçtan uca test edilmedi. Eksik şirket içerikleri [RELEASE.md](RELEASE.md) dosyasında listelenir.
