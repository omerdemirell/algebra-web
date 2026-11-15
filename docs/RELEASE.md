# Yayın hazırlığı ve doğrulama sınırları

Bu sürüm statik Astro çıktısıdır. İlk production ZIP'i mail uç noktasını içermez; yayın, kullanıcının cPanel'e yüklemesinden sonra gerçekleşir. Canonical ve sitemap alan adı `https://algebrateknoloji.com` olarak ayarlanmıştır.

## Kurumsal içerik durumu

| Bilgi                                           | Mevcut durum                                                                         | Yönetildiği yer                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Bina görseli                                    | Kullanıcının sağladığı referans temizlenerek tek ekran iletişim sayfasına eklendi    | `ContactScene.astro`, `src/assets/contact-building.png` |
| Adres, telefon, e-posta, harita bağlantısı      | Kullanıcının sağladığı bilgiler iletişim, footer ve yapılandırılmış verilere eklendi | `src/data/contact.ts`                                   |
| Kuruluş yılı ve tarihçe                         | Onay bekleniyor; tarih uydurulmadı                                                   | `src/data/pages.ts`                                     |
| Yönetim kadrosu                                 | Onay bekleniyor; isim veya biyografi uydurulmadı                                     | `src/data/pages.ts`                                     |
| Resmî misyon, vizyon, kalite ve değer metinleri | Editoryal taslak; şirket onayı gerekli                                               | Kayıtlardaki `review` alanı                             |
| Partnerler ve sertifikalar                      | Sağlanmadı; logo veya yetki iddiası yok                                              | Kurumsal içerik                                         |
| Açık pozisyon ve staj koşulları                 | Doğrulanmış ilan yok; işe alım taahhüdü yok                                          | Kariyer sayfaları                                       |
| Sayfa çevirileri                               | 98 sayfanın on dildeki sürümleri tamamlandı                                          | `src/i18n/messages`, locale registry                    |
| Resmî KVKK aydınlatma metni                     | Şirket / hukuk onayı gerekli                                                         | `gizlilik` içeriği                                      |

## Form gönderimini etkinleştirmek

İlk production build'inde gönder düğmesi devre dışıdır ve ziyaretçiye e-posta adresi gösterilir; POST veya e-posta gönderimi yapılmaz. Kaynak kodundaki PHP entegrasyonu ayrı bir sonraki yayın için saklanır. JavaScript olmadığında da gönder düğmesi devre dışıdır.

Gerçek gönderimi açmadan önce aşağıdaki kontroller tamamlanmalıdır:

1. Onaylanmış aydınlatma metni, veri sorumlusu bilgisi, amaçlar ve saklama politikası hazırlanır.
2. Hazır PHP endpoint'i ve web kökü dışındaki yapılandırma birlikte doğrulanır; PHP testleri çalıştırılır.
3. Origin kontrolü, oran sınırlama ve honeypot canlıya alınmadan önce gözden geçirilir. Gizli SMTP yapılandırması web kökü dışında tutulur.
4. Mesajların yetkili alıcısı, saklama / silme süresi ve log redaksiyonu belirlenir. CV dosyaları eklenecekse tür/boyut sınırlama, zararlı dosya tarama ve özel erişim ayrıca gerekir.
5. Hata, zaman aşımı, tekrar gönderim ve gerçek teslim durumları ayrı onayla test edilir. Ancak bundan sonra production gönderimi etkinleştirilir.

## Hosting

`npm run build` çıktısı `dist` klasörüdür. Directory index ve 404.html desteklenmelidir. Olmayan URL'ler `200` ile ana sayfaya rewrite edilmemeli; gerçek `404` dönmelidir. `_headers` Cloudflare Pages / Netlify biçimindedir; Nginx veya diğer sunucularda eşdeğer başlıklar ayrıca yapılandırılmalıdır. Asset hash'li `/_astro` dosyaları uzun süre önbelleklenebilir; HTML güncellemelerde yeniden doğrulanmalıdır.

Üretimde ilk yayından sonra on dilin ana ve detay rotaları, her sitemap, canonical alan adı, sosyal paylaşım görseli ve 404 durumu yeniden doğrulanmalıdır. Desteklenen diller TR, EN, AR, DE, FR, zh-CN, JA, RU, IT ve ES ile sınırlıdır.

## Performans sınırları

LCP ≤2.5 s, INP ≤200 ms ve CLS ≤0.1 hedef değerlerdir. Yerel Lighthouse laboratuvar sonucu gerçek kullanıcı ölçümü veya INP garantisi değildir. INP için üretimde gerçek kullanıcı etkileşimleri ölçülmelidir. Mobil emülasyon fiziksel cihaz ve GPU çeşitliliğini bütünüyle kapsamaz.

3D modülü normal kurumsal alt sayfalara yüklenmez. Three.js kaynaklı büyük chunk ilk ekrandan ayrılmıştır; boyut uyarısı gizlenmemiştir. Düşük güçlü cihazlarda WebGL yerine fallback gösterilebilir. Üretim ağı, hosting cache ve saha koşulları ayrıca ölçülmelidir.
