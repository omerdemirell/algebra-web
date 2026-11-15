# Algebra Teknoloji

Astro, TypeScript strict, Tailwind CSS 4 ve görünürlükle yüklenen React / Three.js adasıyla hazırlanmış kurumsal web platformu. Yazılım, bilişim, enerji ve mühendislik alanları için çok sayfalı statik mimari.

## Çalıştırma

Node.js `>=22.23.4` gereklidir. Windows PowerShell çalıştırma politikası `npm.ps1` dosyasını engelliyorsa `npm.cmd` kullanın.

```powershell
npm.cmd ci
npm.cmd run dev -- --background
```

Yerel adres: http://localhost:4321

```powershell
npm.cmd exec astro dev -- status
npm.cmd exec astro dev -- logs
npm.cmd exec astro dev -- stop
```

Geliştirme sunucusu AGENTS.md doğrultusunda background modunda yönetilir. Yeni bir sunucu açmadan önce durumunu kontrol edin.

## Build ve kontroller

```powershell
npm.cmd run check
npm.cmd run build
npm.cmd run test:content
npm.cmd test
```

- `check`: Astro ve TypeScript strict kontrolü.
- `build`: statik HTML, dil rotaları, metadata ve responsive WebP görseller.
- `test:content`: tüm üretilen sayfalarda H1, metadata, JSON-LD, bağlantı, görsel, çeviri yayın sınırları ve RTL kontrolü. Önce build gerekir.
- `test`: çalışan localhost:4321 üzerinde masaüstü ve mobil Playwright. Yerel Google Chrome kullanır. Google Chrome yoksa Playwright config içindeki kanal ayarlanmalıdır.
- `node scripts/browser-audit.mjs`: ek masaüstü/mobil sayfa ve WebGL ekran görüntüleri.
- `node scripts/check-translations.mjs`: 1.130 UI metni, eksik anahtar, çeviri işaretleri, sayı yer tutucuları, on dil kaydı ve RTL denetimi.
- `node scripts/prepare-brand.mjs`: orijinalleri koruyan, görünür piksel eşitliği doğrulanmış kayıpsız WebP marka kopyaları.

Test raporları ve ekran görüntüleri `reports/` altında tutulur; Git'e dahil edilmez. Bu komutlar commit veya push yapmaz.

## Sayfa kapsamı

- Ana sayfa: beş slayt, dört uzmanlık alanı, kurumsal yaklaşım, gerçek zamanlı dünya, çözümler, sektörler, kariyer, bilgi merkezi ve iletişim çağrısı.
- Kurumsal: ana sayfa ve 8 detay.
- Hizmetler: filtrelenebilir katalog ve 43 teknik detay.
- Çözümler: ana sayfa ve 12 problem odaklı detay.
- Sektörler: ana sayfa ve 10 detay.
- İnsan Kaynakları: ana sayfa, kariyer, kültür, açık pozisyonlar, genel başvuru ve staj.
- Bilgi Merkezi: ana sayfa, blog, teknik makaleler, 3 makale, haberler, duyurular ve SSS.
- İletişim: sağlanan bina görseliyle tek ekran kompozisyon; iletişim alanları, ayrı teklif ve iş birliği sayfalarına bağlantılar.
- Gizlilik, çerez politikası ve 404.
- Projeler sayfası yoktur.

Tam URL listesi: [docs/PAGES.md](docs/PAGES.md).

## Diller

| Dil                              | Gerçek içerik kapsamı                   |
| -------------------------------- | --------------------------------------- |
| Türkçe                           | Tüm sayfalar                            |
| İngilizce `/en/`                 | Tüm sayfalar                            |
| Arapça `/ar/`                    | Tüm sayfalar, RTL                        |
| Almanca `/de/`                   | Tüm sayfalar                            |
| Fransızca `/fr/`                 | Tüm sayfalar                            |
| Basitleştirilmiş Çince `/zh-CN/` | Tüm sayfalar                            |
| Japonca `/ja/`                   | Tüm sayfalar                            |
| Rusça `/ru/`                     | Tüm sayfalar                            |
| İtalyanca `/it/`                 | Tüm sayfalar                            |
| İspanyolca `/es/`                | Tüm sayfalar                            |

98 içerik sayfasının tamamı on dilde üretilir. Menü ve detay bağlantıları seçili dilde kalır; dil seçici açık sayfanın çevirisini açar. Her seçenek yerel SVG bayrak ve seçili arayüz dilindeki adını gösterir. Örneğin Türkçede “İngilizce”, Arapçada “الإنجليزية”, İspanyolcada “inglés” görünür. Dil listesinde bekleyen veya devre dışı seçenek yoktur. Her sayfada canonical, on hreflang ve x-default; her dilde 98 URL içeren sitemap üretilir. [Çeviri bakımı](docs/TRANSLATIONS.md).

## İçerik ve bileşenler

```text
src/components/     Layout, navigasyon, slider, 3D, kartlar, formlar, bölümler
src/layouts/        SEO ve ortak sayfa iskeleti
src/data/           Tür güvenli hizmet, çözüm ve kurumsal içerikler
src/i18n/           Locale registry, tür güvenli UI çevirileri, URL ve Intl yardımcıları
src/pages/          Statik rotalar, dil ana sayfaları, sitemap ve robots endpointleri
src/styles/         Merkezi marka tokenları ve responsive tasarım
src/assets/         Yerel kaynak fotoğraflar
public/brand/       Değiştirilmemiş kullanıcı logoları
public/data/        Dünya texture'ı ve coğrafi fallback
scripts/            İçerik doğrulama ve varlık hazırlama
tests/              Playwright etkileşim testleri
```

İçerik değiştirmek için `src/data` kayıtlarını, kısa UI çevirileri için `src/i18n/ui.ts` ve `src/i18n/messages/*.json` dosyalarını düzenleyin. Yeni Türkçe metnin dokuz çevirisi tamamlanmadan içerik kontrolü geçmez. `src/data` ileride bir CMS adaptörüyle değiştirilebilir; bu sürüm CMS sunucusu gerektirmez.

## Bağımlılıklar ve davranış

Mevcut Astro / Tailwind altyapısı korunmuştur. Eklenen çalışma zamanı paketleri: `@astrojs/react`, `react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`. React bütün siteyi hydrate etmez. GSAP yalnızca slider geçişinde dinamik yüklenir. Three.js yalnızca görünür 3D adada yüklenir; native scrolling korunur.

Geliştirme araçları: Astro check, TypeScript, React / Three türleri, Playwright, axe, Lighthouse ve Prettier. Paket sürümleri ve bağımlılık ağacı `package-lock.json` içindedir.

## Yayın öncesi eksikler

Formlar henüz veri göndermez; yalnızca doğrular. İletişim görseli, adres, telefon ve e-posta kullanıcı tarafından sağlandı ve siteye eklendi. Kurumsal geçmiş, yönetim bilgileri ve resmî KVKK metni beklenmektedir. Şirket iddiaları ve açık pozisyonlar uydurulmamıştır. Mevcut içeriklerin on dildeki çevirileri tamamlanmıştır.

Kaynak commit, push veya üretim yayını yapılmamıştır.

- [Teknoloji araştırması ve seçim gerekçeleri](docs/TECHNOLOGY.md)
- [Varlıklar ve lisans kaynakları](docs/ASSETS.md)
- [Yayın ve form backend hazırlığı](docs/RELEASE.md)
- [Test sonuçları](docs/VALIDATION.md)
