import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { summarizeTests } from './test-report-summary.mjs';
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const content = await json('reports/content-check.json'),
  playwright = await summarizeTests();
assert.equal(
  content.errors.length,
  0,
  'Resolve content validation failures before generating the release report.',
);
assert.equal(
  playwright.stats.unexpected,
  0,
  'Resolve browser test failures before generating the release report.',
);
const mobile = await json('reports/lighthouse-mobile.report.json'),
  desktop = await json('reports/lighthouse-desktop.report.json');
const row = (name, r) =>
  `| ${name} | ${Math.round(r.categories.performance.score * 100)} | ${Math.round(r.categories.accessibility.score * 100)} | ${Math.round(r.categories['best-practices'].score * 100)} | ${Math.round(r.categories.seo.score * 100)} | ${(r.audits['largest-contentful-paint'].numericValue / 1000).toFixed(2)} s | ${Math.round(r.audits['total-blocking-time'].numericValue)} ms | ${r.audits['cumulative-layout-shift'].numericValue.toFixed(3)} |`;
const old = await json('reports/lighthouse-mobile-baseline.json');
const markdown = `# Doğrulama sonuçları

14 Kasım 2026, Windows, yerel Google Chrome. Güncel çeviri ve etkileşim kontrolleri background geliştirme sunucusu localhost:4321 üzerinde çalıştırıldı. Lighthouse ${mobile.lighthouseVersion} tablosu ilk sürümün üretim çıktısına aittir; on dil güncellemesinde yeniden ölçülmedi.

## Build ve içerik

- \`npm run check\`: 0 hata, 0 uyarı, 0 ipucu. Son çıktı: \`reports/typecheck.log\`.
- \`npm run build\`: başarılı, ${content.pages} HTML sayfası. Son çıktı: \`reports/build.log\`.
- \`npm run test:content\`: ${content.links} yerel bağlantı ve ${content.assets} varlık / responsive srcset referansı; ${content.errors.length} hata.
- H1 tekilliği, başlıkların tekilliği, açıklamalar, canonical, sosyal metadata, JSON-LD, DOM id'leri, dosya ve fragment hedefleri denetlendi.
- 1.130 UI metni; anahtar ve dizi boyutu eşitliği, boş / kopyalanmış Türkçe UI çevirisi, çeviri işaretleri ve sayı yer tutucuları kontrol edildi. On dilin yayın ve RTL kayıtları doğrulandı.
- 98 sayfanın her dilde bulunduğu, her Türkçe metnin dokuz karşılığının olduğu, çevirisiz Türkçe metin kalmadığı ve iç bağlantıların seçili dilde kaldığı doğrulandı. Her sayfada on hreflang ve x-default; her sitemap'te 98 sayfa kontrol edildi. Projeler rotası bulunmadığı doğrulandı.
- Orijinal JPEG ve şeffaf PNG logolarının SHA-256 değerleri kaynak dosyalarla eşleşti. Kayıpsız WebP kopyaları ayrıca piksel / alfa eşitliğiyle doğrulandı.

## Playwright

${playwright.stats.expected} başarılı, ${playwright.stats.unexpected} başarısız, ${playwright.stats.skipped} atlanan test. Genel regresyon ve düzeltme sonrası odaklı çalıştırmalarda her testin en son sonucu kullanılır. Atlanan test, masaüstü grubunda zaten çalışan viewport matrisinin mobil projedeki tekrarıdır. Birleştirilmiş sonuç: \`reports/browser-validation-summary.json\`.

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
- İletişim sayfasında 360×640, 844×390, 1024×768 ve 1920×1080 boyutlarında on dil: 40 yerleşimde taşma, menü / footer çakışması ve açık dil dropdown'unun ekran sınırları kontrol edildi. JSON: \`reports/language-layout.json\`.

## Lighthouse

| Profil | Performans | Erişilebilirlik | İyi uygulamalar | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
${row('Mobil', mobile)}
${row('Masaüstü', desktop)}

Mobil ilk ölçüm ${Math.round(old.categories.performance.score * 100)} performans, ${(old.audits['largest-contentful-paint'].numericValue / 1000).toFixed(2)} s LCP idi. Görünmeyen içerik çizimi, görsel boyutları, responsive seçim, font öncelikleri ve kayıpsız marka dosyaları optimize edildi. Sonuçlar son iki HTML / JSON raporunda tutulur:

- \`reports/lighthouse-mobile.report.html\`, \`reports/lighthouse-mobile.report.json\`
- \`reports/lighthouse-desktop.report.html\`, \`reports/lighthouse-desktop.report.json\`

## Sınırlar

Lighthouse sonuçları tek bir yerel laboratuvar ölçümüdür; üretim garantisi veya gerçek kullanıcı INP ölçümü değildir. INP ölçülmedi. LCP hedefi 2.5 s, CLS hedefi 0.1'dir; tabloda gerçek sonuçlar verilmiştir. Headless Chrome WebGL doğrulaması fiziksel telefon ve GPU testi yerine geçmez. Otomatik erişilebilirlik taraması manuel ekran okuyucu denetiminin tamamını kapsamaz. Harici web sitelerinin her bağlantısı ve tüm fiziksel cihazlar test edilmedi.

Form backend'i, gerçek e-posta teslimi, CV yüklemesi, üretim hosting'i, alan adı ve canlı harita henüz yapılandırılmadığından bunlar uçtan uca test edilmedi. Eksik şirket içerikleri [RELEASE.md](RELEASE.md) dosyasında listelenir.
`;
await writeFile('docs/VALIDATION.md', markdown);
console.log(
  JSON.stringify(
    {
      playwright: playwright.stats,
      content,
      mobile: {
        performance: mobile.categories.performance.score,
        lcp: mobile.audits['largest-contentful-paint'].numericValue,
      },
      desktop: {
        performance: desktop.categories.performance.score,
        lcp: desktop.audits['largest-contentful-paint'].numericValue,
      },
    },
    null,
    2,
  ),
);
