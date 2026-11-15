# Teknoloji seçimi ve kaynaklar

14 Kasım 2026 tarihli araştırma ve kurulu paketlerin manifestleri temel alınmıştır. Sürüm numaralarının kaynağı `package-lock.json` dosyasıdır; üretim kurulumu `npm ci` ile yapılır.

## Seçilen mimari

Astro'nun statik çıktısı korunur. Tüm metinler ve bağlantılar sunucuda HTML olarak üretilir. React yalnızca görünürlükle yüklenen dünya bileşeninde kullanılır. Tailwind CSS 4 mevcut Vite entegrasyonuyla korunmuştur; kurumsal kırmızı `src/data/brand.ts` kaynağından CSS, 3D sahne ve üretilen harita varlıklarına aktarılır. Diğer renkler, aralıklar ve tipografi `src/styles/global.css` içindeki tokenlardan yönetilir.

| Teknoloji                    | Karar ve gerekçe                                                                         | Lisans / kaynak                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro                        | Statik sayfalar, yerleşik i18n, responsive görsel üretimi, `client:visible` ada mimarisi | MIT; [Islands](https://docs.astro.build/en/concepts/islands/), [i18n](https://docs.astro.build/en/guides/internationalization/)              |
| React                        | Tüm sayfa yerine tek bir etkileşimli 3D ada                                              | MIT; [Astro entegrasyonu](https://docs.astro.build/en/guides/framework-components/)                                                          |
| Three.js / React Three Fiber | Tek sahne, sınırlı DPR, düşük çözünürlüklü mobil geometri, görünürlük kontrollü render   | MIT; [performans rehberi](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Three.js örnekleri](https://threejs.org/examples/)        |
| Drei                         | Yalnızca `useTexture`; yüzey, atmosfer ve ışık izleri özgün shader'larla çizilir          | MIT; [kaynak](https://github.com/pmndrs/drei)                                                                                                |
| GSAP                         | Slider metinlerinin kısa geçişleri için dinamik import. Reduced motion'da yüklenmez      | GSAP Standard no-charge license; MIT değildir. [Lisans](https://gsap.com/standard-license/), kurulu paketin README ve package.json dosyaları |
| Tailwind CSS 4               | Mevcut entegrasyon korunur; stillerin çoğu bileşen sınıfları ve ortak tokenlarla yazılır | MIT; [Astro stil rehberi](https://docs.astro.build/en/guides/styling/)                                                                       |

## Değerlendirilen, kurulmayan araçlar

- **ThreeUI:** Bu isim tek başına doğrulanmış bir paket kimliği belirtmiyor. Gerçek bir proje olan [three-mesh-ui](https://github.com/felixmariotto/three-mesh-ui), Three.js içinde VR arayüzleri için bir kütüphanedir. Bu kurumsal sitede DOM navigasyonu daha erişilebilir ve hafiftir; bir `ThreeUI` paketi uydurulmadı veya kurulmadı.
- **React Bits:** [React Bits](https://reactbits.dev/) React tabanlı animasyon kaynakları sunar. Tekil bileşenlerde Astro React adasıyla kullanılabilir. Bu sitede aynı davranışların CSS ve küçük native betiklerle sağlanması tercih edildi. Her örneğin güncel kaynak lisansı ayrıca incelenmelidir; Pro ürünleri ücretsiz koleksiyonla karıştırılmamalıdır.
- **Aceternity UI:** [Resmî koleksiyon](https://ui.aceternity.com/) React, Tailwind ve Motion temellidir. Premium şablonları da bulunduğundan bütün koleksiyon için tek bir açık kaynak lisansı varsayılmadı. Hazır bileşen kopyalanmadı; özgün, Astro ile üretilen bileşenler kullanıldı.
- **Motion:** [Motion React](https://motion.dev/docs/react) uygun bir MIT seçenek olsa da ikinci bir animasyon motoruna ihtiyaç yoktu. React bağımlılık alanını büyütmemek için kurulmadı.
- **GSAP ScrollTrigger:** GSAP paketinde bulunur; bu uygulama scroll pinning veya parallax gerektirmediği için import edilmedi.
- **Lenis:** [Kaynak](https://github.com/darkroomengineering/lenis), MIT. Sürekli scroll döngüsü yerine native scrolling, CSS scroll-margin ve reduced-motion uyumu seçildi.
- **Swiper:** [Resmî site](https://swiperjs.com/), MIT çekirdek. Beş slayt için klavye, dokunma ve otomatik geçiş native betikle sağlandı; ek slider bağımlılığı kurulmadı.
- **WebGPU:** Three.js'in [resmî örnekleri](https://threejs.org/examples/) incelendi. Donanım ve tarayıcı kapsamı açısından tek kürelik sahnede WebGL ve statik fallback yeterlidir. WebGPU zorunluluğu eklenmedi.

R3F/Drei ve React ekosistemi güncel dokümantasyona ve sürümlere sahiptir; bu tespit gelecek bakım garantisi değildir. Lisanslar yüklenen paket sürümleriyle yeniden kontrol edilmelidir. Mobil kalite profili ve ekran dışı duraklama uygulanmıştır; gerçek cihaz testi yalnızca tarayıcı emülasyonundan daha geniş doğrulama gerektirir.

## 3D davranışı

`client:visible` ağır modülü ilk yüklemeden ayırır. IntersectionObserver ve Visibility API sahneyi ekran dışında ve sekme gizliyken `frameloop="demand"` moduna alır. Reduced-motion'da sürekli döngü çalışmaz; kullanıcı ayrıca durdurabilir. Mobil DPR 1, masaüstü en fazla 1.5'tir. Geometriler ve texture kaynakları unmount sırasında temizlenir; R3F Canvas kendi renderer yaşam döngüsünü yönetir.

Türkiye Natural Earth sınır verisinden oluşturulan gerçek polygonla vurgulanır. Polygon dünya grubunun parçasıdır; dünya ile birlikte döner. Kırmızı malzeme arka yüzde de görünür kalacak şekilde depth testi kapalı bir vurgu katmanıdır. Küre yaklaşık dört dakikada bir döner. Yüzeyde gölgelendirme, ince nokta matrisi ve coğrafi ızgara; çevresinde Fresnel atmosfer ışığı ve yörüngelerde ilerleyen kırmızı ışık izleri bulunur. Yumuşak parıltı shader ve küçük sprite'larla sağlanır; bloom render pass'i yoktur. Mobilde iki, masaüstünde üç ışık yörüngesi vardır. WebGL yoksa güncellenmiş coğrafi SVG gösterilir. Dünya verisi ülke sınırlarının yaklaşık 1:110m çözünürlüğündeki genelleştirilmiş gösterimidir. [Tasarım ve doğrulama](GLOBE.md).

## İçerik ve dil sınırları

`src/data` tür güvenli içerik katmanıdır. Detay sayfaları tekil kayıtlar ve ortak içerik bölümleriyle üretilir; Directus/Strapi adaptörü ileride bu katmanın önüne eklenebilir. Bu sürüm çalışan bir CMS sunucusu içermez.

Türkçe, İngilizce, Arapça, Almanca, Fransızca, Basitleştirilmiş Çince, Japonca, Rusça, İtalyanca ve İspanyolca için 98 sayfanın tamamı üretilir. Dil seçici aynı sayfanın çevirisini açar; menü, detay ve yasal sayfa bağlantıları seçili dilde kalır. Her sayfada on hreflang ve x-default; her dilde tam sitemap bulunur.

Astro middleware, parse5 ile HTML metin düğümlerini, erişilebilirlik etiketlerini, form geri bildirimlerini ve metadata'yı statik üretim sırasında yerel sözlüklerden çevirir. Script, CSS, SVG geometrisi, kimlikler, marka ve posta bilgileri korunur. Sözlükler tarayıcıya yüklenmez ve ziyaret sırasında çeviri servisi çağrılmaz. Çıktı denetimi her Türkçe metnin dokuz karşılığını, eksik sayfaları, yer tutucuları ve seçili dilden çıkan bağlantıları kontrol eder. Arapça RTL; tarih ve sayılar `Intl` ile yönetilir. [Çeviri süreci](TRANSLATIONS.md).
