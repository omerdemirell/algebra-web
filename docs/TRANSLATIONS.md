# On dilde içerik

Desteklenen diller: Türkçe, İngilizce, Arapça, Almanca, Fransızca, Basitleştirilmiş Çince, Japonca, Rusça, İtalyanca ve İspanyolca. Her dil 98 içerik sayfasını kapsar: ana sayfa, kataloglar, hizmet / çözüm / sektör / kurumsal detayları, kariyer, bilgi merkezi, iletişim ve yasal metinler. 404 ortak hata sayfasıdır.

`src/i18n/locales.ts` tek dil kaydıdır. Türkçe kök URL kullanır; diğer diller önek kullanır. İçerik eşleştirmesini kararlı tutmak için detay slug'ları bütün dillerde aynıdır. Örneğin `/hizmetler/veri-yedekleme/` ile `/de/hizmetler/veri-yedekleme/` aynı sayfanın iki dilidir. Dil değiştirmek açık sayfayı korur. Her seçenekte yerel SVG bayrak bulunur; on dilin adı seçili arayüz dilinde gösterilir. `languageName` yardımcısı adları `Intl.DisplayNames` ile sunucuda üretir. Arama hem görünen çeviriyi hem dilin kendi adını ve kodunu kabul eder. Ekran okuyucular bağlantı metnini arayüzün dilinde okur.

## Çeviri kaynakları

- `src/i18n/ui.ts`: tür güvenli ana sayfa / ortak UI yapısı ve mevcut editoryal TR, EN, AR, zh-CN metinleri.
- `src/i18n/messages/*.json`: dokuz yabancı dilin yerel içerik sözlükleri.
- `scripts/refine-dictionaries.mjs`: bağlama göre düzenlenen sloganlar, iletişim başlıkları, marka adı ve sayı yer tutucuları.
- `src/i18n/html.ts`, `src/middleware.ts`: statik HTML üretiminde metin, metadata ve erişilebilirlik etiketlerinin çevirisi; yerel bağlantıların dil önekiyle üretilmesi.

İçerik sözlüklerinin ilk taslağı otomatik çeviriyle hazırlandı. Ana sayfa sloganları, iletişim başlıkları, marka koruması ve dinamik sayı metinleri ayrıca düzenlendi. Kapsamın tam olması tüm metinlerin bağımsız bir dil uzmanı tarafından incelendiği anlamına gelmez.

## Metin güncellerken

1. Türkçe kaydı / bileşeni değiştirin ve `npm run build` çalıştırın.
2. Yeni kaynak metnin dokuz karşılığını sözlüklere ekleyin. İsteğe bağlı editoryal hazırlama aracı `node scripts/translate-site.mjs` ağ erişimi gerektirir; normal build ve site ağ üzerinden çeviri yapmaz. Metinler herkese açık çeviri servisine gönderilir, servis anahtarı veya ücretli API kullanılmaz. Araç eksik girdileri doldurur ve mevcut çevirileri korur.
3. `npm run build`, `npm run test:content`, `npm run check` çalıştırın. İçerik kontrolü yeni metinlerin çevirisiz kalmasını, diğer dile çıkan iç bağlantıları, eksik sayfaları ve bozuk yer tutucuları reddeder.
4. `tests/languages.spec.ts` dil değiştirme, bayraklar, katalog araması, form mesajları ve iletişim yerleşimini denetler.

Şirket adı, gerçek adres, telefon, e-posta, teknik kısaltmalar ve dil adları çeviri sırasında korunur. Form gönderiminin henüz etkin olmadığını belirten metinler de çevrilmiştir; çeviri işlemi form backend'i eklemez.
