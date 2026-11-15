# Ana sayfa küresi

Three.js / React Three Fiber sahnesi daha derinlikli bir yüzey, coğrafi nokta matrisi, ince meridyenler, atmosfer kenar ışığı ve hareketli kırmızı ışık izleriyle yenilendi. Türkiye gerçek Natural Earth poligonuyla, kurumsal `#D00024` renginde dünya ile birlikte döner. Orijinal isteğe uygun olarak arka yüze geçtiğinde de kırmızı vurgusu görünür kalır.

## Hareket ve görünüm

- Dünya saniyede 0.025 radyan döner: tam tur yaklaşık 4 dakika 11 saniye.
- Kırmızı ışıkların tur süreleri 32, 44 ve 56 saniyedir. Işık izleri kendi yörüngelerinde ilerler; yörünge düzlemleri ayrıca çok yavaş döner.
- Yüzey, atmosfer ve ışık izleri `globe-shaders.ts` içindeki özgün GLSL shader'larla çizilir. Işık başlarının yumuşak parıltısı küçük, kodla üretilen bir texture kullanır. Yeni kütüphane veya bloom render pass'i eklenmedi.
- `world-texture.webp` artık düz renkli harita yerine coğrafi veri maskesidir; aydınlatma ve nokta dokusu gerçek zamanlı hesaplanır. Maske ve statik fallback `node scripts/prepare-globe.mjs --globe-only` ile üretilir.
- Kamera kadrajı canvas'ın en / boy oranına göre hesaplanır. Mobilde iki ışık yörüngesi, düşük poligon ve DPR 1 kullanılır. Masaüstünde DPR en fazla 1.5'tir.
- `client:visible` korunur. Ekran dışında, gizli sekmede, kullanıcı duraklattığında veya reduced-motion açıkken sürekli render ve animasyon durur. Yalnızca aktif geçen süre sayıldığından geri dönüldüğünde hareket atlamaz.
- WebGL olmadan coğrafi SVG görüntüsü sunulur. Görseller, texture ve geometri yereldir; ziyaret sırasında harici istek yapılmaz.

## Kaynaklar

[Three.js Earth örneği](https://threejs.org/examples/webgpu_tsl_earth.html), [ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial), [R3F useFrame](https://r3f.docs.pmnd.rs/api/hooks#useframe) ve [three-globe API'si](https://github.com/vasturiano/three-globe#api) incelendi. Atmosfer ve hareketli iz yaklaşımı mevcut WebGL sahnesine özgün olarak uyarlandı; WebGPU zorunluluğu veya yeni bir globe bağımlılığı eklenmedi.

## Doğrulama

`node scripts/qa-globe.mjs` yerel Chrome'da 1440×1000 ve 390×844 profillerinde gerçek canvas karelerini karşılaştırır:

- Merkez bölgedeki değişim kürenin döndüğünü; dış halkadaki değişim ışıkların ilerlediğini doğrular.
- Duraklatma ve reduced-motion sonrasında değişen piksel sayısı sıfır olmalıdır.
- JavaScript ve WebGL shader hataları toplanır.
- Sonuçlar `reports/globe-qa.json`, görünüm görüntüleri `reports/globe-desktop-modern.png` ve `reports/globe-mobile-modern.png` dosyalarına yazılır.

Bu kontrol yazılımsal GPU kullanan headless Chrome doğrulamasıdır; fiziksel telefon GPU testi veya FPS garantisi değildir. Mevcut Playwright globe testleri lazy loading, WebGL fallback, manuel duraklatma ve reduced-motion davranışlarını ayrıca denetler.
