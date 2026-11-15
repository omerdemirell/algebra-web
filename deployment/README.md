# TürkTicaret.NET Web Eko form dağıtımı

Bu değişiklik **henüz canlıya yüklenmedi**. İlk statik yayında mail entegrasyonu kapalıdır: `deployment-output/algebra-teknoloji-production.zip` içinde `api/contact.php` ve hiçbir SMTP/PHP yapılandırma dosyası bulunmaz. Formların gönder düğmeleri bu production build'de devre dışı kalır ve ziyaretçiye e-posta adresi gösterilir. Mevcut PHP 8.1, PHPMailer 6.10.0 ve `smtp-config.php` kurulumları daha sonraki ayrı mail yayını için korunur.

İlk yayın ZIP'ini cPanel'de `/home/sar367nsaacomtr/algebrateknoloji.com/` belge köküne açın; ZIP'in içinde `dist` üst klasörü yoktur. Mevcut canlı dosyaları temizleme veya üzerine yazma kararı, yüklemeden önce cPanel yedeği ve yayın planıyla alınmalıdır. `api/contact.php` dosyasını bu ilk yayınla yüklemeyin.

## Sonraki aşama: form entegrasyonu

| Yerel dosya | Canlı sunucudaki hedef |
| --- | --- |
| `dist/` içindeki statik site dosyaları | `/home/sar367nsaacomtr/algebrateknoloji.com/` |
| `dist/api/contact.php` (kaynak: `public/api/contact.php`) | `/home/sar367nsaacomtr/algebrateknoloji.com/api/contact.php` |
| `deployment/php/contact-core.php` | `/home/sar367nsaacomtr/algebra-mail-config/contact-core.php` |
| Mevcut `smtp-config.php` ve `phpmailer/src/*` | `/home/sar367nsaacomtr/algebra-mail-config/` içinde olduğu yerde kalır |

`npm run build` komutu PHP uç noktasını `public/` klasöründen `dist/api/` içine kopyalar; ilk yayın ZIP'i bu dosyayı ayrıca dışarıda bırakır. Formlar yalnız mail entegrasyonu etkinleştirilecek sonraki build'de `/api/contact.php` adresine JSON POST yapacaktır. PHP dosyası dışarıdaki `contact-core.php` dosyasını çağırır; o da mevcut `smtp-config.php` ve PHPMailer kaynaklarını kullanır. SMTP parolası statik çıktıya veya tarayıcıya girmez.

## Yapılandırma sözleşmesi

Mevcut `smtp-config.php` dosyası değiştirilmez. Kod, `host`, `port`, `encryption`, `username`, `password`, `from_email`, `to_email` anahtarlarını bekler. Dosya bu alanları bir dizi olarak döndürebilir; `$config`, `$smtpConfig` veya `$smtp_config` dizisi tanımlayabilir; ya da aynı isimli yerel değişkenleri tanımlayabilir. Gerçek yapı bunlardan farklıysa, canlıya geçmeden önce **gizli değerleri paylaşmadan** anahtar adlarını doğrulayıp yalnız adaptörü güncelleyin. Port 465 ve SSL/TLS (implicit TLS) beklenir.

Sunucudaki gerçek `smtp-config.php` bu yerel çalışmada görülmedi. Alan adlarının mevcut olduğu bilgisi dosyanın hangi PHP biçiminde tanımlandığını kanıtlamaz. Yayından önce aşağıdaki `CONFIG_OK` kontrolü sunucuda yapılmalıdır; komut gizli değerleri yazdırmaz. `tls` (STARTTLS) değeri 465 üzerindeki implicit TLS sözleşmesiyle eşleşmez; `ssl`, `ssl/tls` veya `smtps` kabul edilir.

## Dosya izinleri ve doğrulama

- Web kökü ve `api/` dizini PHP kullanıcısı tarafından okunabilir olmalı (`0755` dizin, `0644` PHP dosyası tipik ayardır).
- `algebra-mail-config/` web kökünün dışında kalmalı. PHP kullanıcısının bu dizine yazma izni olmalı; `contact-rate.json` ilk istekte oluşturulur ve `0600` iznine çekilir. Dış dizin için `0700`, gizli `smtp-config.php` için `0600` uygundur; mevcut cPanel kullanıcı izinleriyle kontrol edin.
- PHP çalışma ortamında `openssl`, `json` ve `filter` uzantıları etkin olmalı. PHPMailer dosyaları belirtilen yolda okunabilmeli.
- Yayından önce `https://algebrateknoloji.com/api/contact.php` adresine **GET** isteği yalnız `405` ve JSON dönmeli. Ham PHP kodu görünürse endpoint'i kullanmayın; PHP handler yapılandırmasını düzeltin.
- Kaynakta veya `dist/` içinde SMTP parolası, `smtp-config.php`, PHPMailer kaynakları ve `contact-rate.json` bulunmamalı.

`dist/api/contact.php` bir PHP betiğidir; Astro önizleme sunucusu veya sıradan statik dosya sunucusu bu betiği çalıştırmaz. Yalnız PHP handler etkin bir cPanel alan adına kopyalayın. Yayına almadan önce ayrı bir hazırlık alanında aşağıdaki kontrol sırasını izleyin:

1. Yerelde `npm run build`, `npm run check`, `npm run test:content` ve ilgili Playwright testlerini çalıştırın. `dist/api/contact.php` dosyasının bulunduğunu; `dist/` içinde `smtp-config.php`, `contact-core.php`, `phpmailer/` ve `contact-rate.json` bulunmadığını doğrulayın.
2. cPanel'de PHP 8.1, HTTPS sertifikası, `openssl`/`json`/`filter` uzantıları, ayrı web kökü ve web kökü dışındaki `algebra-mail-config/` izinlerini kontrol edin. Hazırlık alanı canlı alan adının belge kökü olmamalıdır.
3. PHP CLI ile sözdizimini ve sahte gönderici kullanan birim testini çalıştırın. Test dosyaları web kökünün dışında aynı depo yapısıyla bulunmalıdır:

   ```sh
   php -v
   php -l /home/sar367nsaacomtr/algebra-mail-config/contact-core.php
   php -l /home/sar367nsaacomtr/STAGING_ROOT/api/contact.php
   php /home/sar367nsaacomtr/STAGING_REPO/tests/php/contact-core-test.php
   php -r 'require "/home/sar367nsaacomtr/algebra-mail-config/contact-core.php"; algebra_load_config("/home/sar367nsaacomtr/algebra-mail-config/smtp-config.php"); echo "CONFIG_OK\n";'
   ```

4. Hazırlık alanında PHP'nin kaynak olarak sunulmadığını **gerçek HTTP yanıtıyla** doğrulayın. `STAGING_HOST` yerine kendi hazırlık alan adınızı yazın:

   ```sh
   curl -sS -i https://STAGING_HOST/api/contact.php
   curl -sS -i -X POST https://STAGING_HOST/api/contact.php -H 'Content-Type: application/json' -H 'Origin: https://attacker.example' --data '{}'
   curl -sS -i https://STAGING_HOST/algebra-mail-config/smtp-config.php
   ```

   İlk yanıt `405` ve `Content-Type: application/json`, ikincisi `403` JSON, sonuncusu `404` olmalıdır. Hiçbir yanıtta `<?php`, yapılandırma içeriği, parola veya PHP hata izi görünmemelidir. Aksi halde PHP handler ya da belge kökü düzeltilmeden yayın yapılmamalıdır. Bu istekler e-posta göndermez.
5. Tarayıcıda dört formun ve on dildeki form metinlerinin görünümünü, konsol hatalarını ve erişilebilirlik etiketlerini kontrol edin. SMTP bağlantı testi daha önce yapıldı; yeni gerçek e-posta testi ayrıca onaylandıktan ve yayın planı netleştikten sonra yapılmalıdır.

## Güvenlik ve işletim

Uç nokta yalnız JSON POST ve HTTPS kabul eder; `Origin` alanını `https://algebrateknoloji.com` veya `https://www.algebrateknoloji.com` ile sınırlar. Alanlar sunucuda doğrulanır. Bal küpü alanı, IP başına 15 dakikada 5 istek ve tüm site için 15 dakikada 100 istek sınırı vardır. Sayımlar web kökü dışındaki kilitli dosyada tutulur. Hata günlükleri yalnız olay türü ve rastgele istek kimliği içerir. Gönderen e-postası `Reply-To` alanına konur; `From` mevcut doğrulanmış kurumsal adrestir. HTML ileti içindeki kullanıcı verileri kaçışlanır; düz metin alternatifi de gönderilir.

`tests/php/contact-core-test.php` gerçek SMTP'ye bağlanmadan başarı, hata, eksik alan, HTTPS/origin ve hız sınırı senaryolarını test eder: `php tests/php/contact-core-test.php`. Gerçek SMTP denemesi otomatik testlere dahil değildir; ayrıca onay gerektirir.

## Canlıya geçmeden önce

1. Mevcut canlı siteyi yedekleyin; bu paket için ayrıca yayın onayı alın. Bu çalışma canlı siteyi değiştirmez.
2. Alan adının DNS A/AAAA kayıtlarını, `www` yönlendirmesini ve IP `31.186.11.110` hedefini planlanan yayınla karşılaştırın. DNS değişimi gerekiyorsa ayrı bir değişiklik olarak ele alın.
3. Ana alan adı ve `www` için geçerli HTTPS sertifikasını ve HTTP→HTTPS yönlendirmesini doğrulayın.
4. TürkTicaret.NET SMTP saatlik/günlük gönderim sınırını öğrenin; form hız sınırını buna göre ayarlayın.
5. `algebrateknoloji.com` için SPF, DKIM ve DMARC kayıtlarını TürkTicaret.NET posta yapılandırmasıyla doğrulayın.
6. Canlı dosyalar yüklendikten sonra PHP lint, GET/POST hata yanıtları ve gerçek posta teslimi ayrı ayrı test edilmeli. Gerçek e-posta gönderimi için önceden onay alınmalı.
