import type { DetailPage } from './services';
import { sectorImageKeys } from '../lib/images';
const corporateRecords = [
  [
    'hakkimizda',
    'Hakkımızda',
    'Teknolojiyi bir bütün olarak düşünüyoruz.',
    'Algebra Teknoloji; yazılım, bilişim altyapıları, enerji ve mühendislik alanlarını ortak bir bakışta buluşturan bir teknoloji markasıdır. Kurumların ihtiyaçlarına tek bir ürünün sınırlarından değil, sistemin bütünü üzerinden yaklaşmayı hedefler.',
    'Birlikte düşünmek',
    'İyi bir çözüm, doğru sorularla başlar. İş süreçleri, mevcut yatırımlar ve gelecekteki gereksinimler birlikte değerlendirilir. Bu yaklaşım, teknik kararların kurumun gerçek öncelikleriyle bağ kurmasını sağlar.',
  ],
  [
    'misyon-ve-vizyon',
    'Misyon ve Vizyon',
    'Bugünü anlamak. Yarını tasarlamak.',
    'Misyonumuz; teknoloji kararlarını anlaşılır, uygulanabilir ve sürdürülebilir çözümlere dönüştürmektir. Yazılım, altyapı ve enerji disiplinleri arasındaki ilişkileri görünür kılarak kurumların dönüşümüne katkıda bulunmayı hedefleriz.',
    'Vizyonumuz',
    'Teknolojinin bağımsız ürünlerden oluşmadığı; insan, süreç, veri ve kaynakların birlikte çalıştığı bir geleceğe inanıyoruz. Vizyonumuz, bu bütünlüğü koruyan mühendislik yaklaşımını her çalışmanın merkezine taşımaktır.',
  ],
  [
    'degerlerimiz',
    'Değerlerimiz',
    'Nasıl düşündüğümüz, ne ürettiğimiz kadar önemli.',
    'Açıklık, sorumluluk ve sürekli öğrenme; teknolojiye yaklaşımımızın temelini oluşturur. Gereksinimleri, varsayımları ve teknik sınırları açıkça konuşmayı değerli buluruz.',
    'Ortak ilkelerimiz',
    'İhtiyacı anlamadan çözüm önermemek. Teknik kararların gerekçesini paylaşmak. Farklı disiplinlerin bilgisini birleştirmek. Kaynakları verimli kullanmak. Teslim edilen sistemin işletilebilirliğini tasarım aşamasından itibaren düşünmek.',
  ],
  [
    'kalite-politikamiz',
    'Kalite Politikamız',
    'Kaliteyi son kontrolde değil, her kararda düşünmek.',
    'Gereksinimlerin anlaşılır olması, değişikliklerin izlenebilirliği ve kabul kriterlerinin baştan belirlenmesi; kalite yaklaşımımızın temelidir. Teknik doğrulama ile kullanılabilirliği birlikte ele alırız.',
    'Sürekli iyileştirme',
    'Keşiften işletim devrine kadar kararları belgelemeyi, riskleri görünür kılmayı ve öğrenilenleri sonraki çalışmalara aktarmayı amaçlarız. Resmî kalite politikası ve sertifika beyanları şirket onayı sonrasında ayrıca yayımlanacaktır.',
  ],
  [
    'yonetim',
    'Yönetim',
    'Açık sorumluluklar. Ortak bir yön.',
    'Teknoloji çalışmalarında karar yetkisi, teknik sorumluluk ve paydaş iletişiminin açıkça tanımlanmasını önemsiyoruz. Disiplinler arası koordinasyon, tutarlı kararlar için temel oluşturur.',
    'Kurumsal yönetim bilgileri',
    'Yönetim kadrosu, görev dağılımı ve biyografiler şirket tarafından doğrulandıktan sonra bu alanda paylaşılacaktır. Bu sayfada örnek kişi veya temsilî yönetici bilgisi kullanılmamıştır.',
  ],
  [
    'surdurulebilirlik',
    'Sürdürülebilirlik',
    'Bugünün ihtiyacını, yarının kaynaklarını düşünerek karşılamak.',
    'Sürdürülebilirlik yaklaşımımız; enerji tüketimi, sistem ömrü, bakım yapılabilirlik ve kaynak verimliliğini birlikte değerlendirir. Her teknoloji kararının işletim dönemi boyunca oluşturacağı etkiyi anlamaya çalışırız.',
    'Teknoloji ve kaynak dengesi',
    'Yenilenebilir enerji, doğru boyutlandırılmış altyapılar ve uzun ömürlü yazılım mimarileri birbirini tamamlar. Somut çevresel performans verileri, ölçüm ve doğrulama olmadan bir başarı iddiasına dönüştürülmez.',
  ],
];
export const corporate: DetailPage[] = corporateRecords.map(
  ([slug, title, description, body, second, secondBody], i) => ({
    slug: `kurumsal/${slug}`,
    title: title!,
    description: description!,
    eyebrow: 'Algebra Teknoloji',
    kind: 'corporate',
    image: i === 6 ? 'solar' : 'engineering',
    sections: [
      { title: 'Bakış açımız', body: body! },
      { title: second!, body: secondBody! },
      {
        title: 'Birlikte değer üretmek',
        body: 'Yazılım, bilişim altyapıları, enerji ve mühendisliği bir bütün olarak ele alıyoruz. Bir sonraki adımda ihtiyaçlarınızı, mevcut sistemlerinizi ve hedeflerinizi birlikte değerlendirebiliriz.',
      },
    ],
    review: ['Şirket tarafından kurumsal metin onayı gereklidir.'],
  }),
);
const sectorRecords = [
  [
    'kamu',
    'Kamu',
    'Vatandaş odaklı, erişilebilir ve izlenebilir dijital süreçler.',
    'Vatandaş portalları;Veri sınıflandırma;Kurumlar arası entegrasyon;İş sürekliliği',
    'Hizmetlerin erişilebilirliği, yetki sınırları ve işlem kayıtları kamu kurumlarında birlikte değerlendirilmelidir. Veri konumu ve kurumun teknik şartları mimarinin girdisidir.',
  ],
  [
    'saglik',
    'Sağlık',
    'Bilginin doğru kişiye, doğru zamanda ulaşması.',
    'Sistem entegrasyonu;Erişim kontrolü;Yedekleme;Kesintisiz altyapı',
    'Sağlık verilerinin hassasiyeti, klinik süreç bağımlılıkları ve hizmet sürekliliği teknoloji planlamasının merkezindedir. Entegrasyonlar hasta ve işlem eşleştirmesi açısından doğrulanmalıdır.',
  ],
  [
    'egitim',
    'Eğitim',
    'Öğrenmeyi destekleyen, yönetilebilir teknoloji.',
    'Dijital kampüs;Kimlik yönetimi;Kablosuz ağ;Bulut kapasitesi',
    'Dönemsel yoğunluklar ve farklı kullanıcı rolleri, eğitim kurumlarının altyapı gereksinimlerini şekillendirir. Öğrenci ve personel deneyimleri ortak veri tanımlarıyla bağlanmalıdır.',
  ],
  [
    'sanayi',
    'Sanayi',
    'Üretim verisinden enerji kullanımına bütüncül bakış.',
    'Üretim entegrasyonu;Operasyon analitiği;Enerji izleme;Çatı GES',
    'Üretim sürekliliği, OT ve BT sınırları ile tüketim profilleri birlikte ele alınır. Değişiklikler üretim takvimi, saha güvenliği ve geri dönüş planlarıyla değerlendirilmelidir.',
  ],
  [
    'enerji',
    'Enerji',
    'Üretim, depolama ve veriyi aynı hedefte birleştirmek.',
    'GES altyapısı;Depolama;Performans izleme;Veri analitiği',
    'Enerji tesislerinde saha koşulları, üretim değişkenliği ve işletim gereksinimleri kararların temelini oluşturur. Ölçüm kalitesi ve izleme bütünlüğü performans değerlendirmesini destekler.',
  ],
  [
    'finans',
    'Finans',
    'Kontrollü erişim ve dayanıklı dijital operasyonlar.',
    'Yüksek erişilebilirlik;Olay kayıtları;Kurtarma;API mimarisi',
    'İşlem bütünlüğü, kimlik doğrulama ve hizmet sürekliliği finans alanındaki mimari kararların temel girdileridir. İlgili kurumun kontrol ve denetim beklentileri keşifte netleştirilir.',
  ],
  [
    'lojistik',
    'Lojistik',
    'Saha ve merkez arasında tutarlı bilgi akışı.',
    'Mobil saha;Depo entegrasyonu;Rota verileri;Operasyon panoları',
    'Dağıtık ekipler ve değişken bağlantı koşulları, lojistik sistemlerinde çevrimdışı çalışma ve senkronizasyon tasarımını önemli hale getirir. Olay zamanları ve kayıt tutarlılığı birlikte kontrol edilir.',
  ],
  [
    'perakende',
    'Perakende',
    'Kanallar arasında bağlantılı bir müşteri deneyimi.',
    'Stok entegrasyonu;CRM;E-ticaret API;Talep analitiği',
    'Mağaza ve çevrimiçi kanallar arasında ürün, stok ve sipariş bilgilerinin tutarlılığı operasyonu doğrudan etkiler. Kampanya dönemleri için kapasite ve hata kurtarma planlanmalıdır.',
  ],
  [
    'telekomunikasyon',
    'Telekomünikasyon',
    'Bağlantının arkasında güvenilir bir altyapı.',
    'Ağ izleme;Kapasite analizi;Veri merkezi;Enerji sürekliliği',
    'Bağlantı hizmetlerinde görünürlük ve bağımlılık yönetimi önemlidir. Ağ, uygulama ve fiziksel altyapı olayları ortak bir operasyon perspektifinde ilişkilendirilmelidir.',
  ],
  [
    'insaat-ve-gayrimenkul',
    'İnşaat ve Gayrimenkul',
    'Yapıların teknoloji gereksinimini tasarımdan düşünmek.',
    'Elektrik altyapısı;Yapısal ağ;Şarj altyapısı;Enerji verimliliği',
    'Fiziksel yapılar ile teknoloji sistemleri arasındaki koordinasyon tasarım aşamasında başlamalıdır. Kapasite rezervleri, kablo güzergâhları ve işletim ihtiyaçları birlikte planlanır.',
  ],
];
export const sectors: DetailPage[] = sectorRecords.map(
  ([slug, title, description, parts, body], i) => ({
    slug: `sektorler/${slug}`,
    title: title!,
    description: description!,
    eyebrow: 'Sektörel uzmanlık alanları',
    kind: 'sector',
    image: sectorImageKeys[i]!,
    sections: [
      { title: 'Sektörün ihtiyaçlarını anlamak', body: body! },
      {
        title: 'Birlikte değerlendirilebilecek alanlar',
        body: 'Aşağıdaki başlıklar başlangıç kapsamını oluşturur. Nihai mimari, kurumun iş akışları ve teknik koşulları üzerinden belirlenir.',
        items: parts!.split(';'),
      },
      {
        title: 'İhtiyaçtan yol haritasına',
        body: 'Mevcut sistemler, kullanıcılar ve kritik bağımlılıklar birlikte haritalanır. Risk ve etki analiziyle öncelikler belirlenir. Uygulama aşamaları, kurumun operasyon takvimi ve kabul kriterlerine göre planlanır.',
      },
    ],
  }),
);
export const careers: DetailPage[] = [
  {
    slug: 'kariyer',
    title: 'Kariyer',
    description: 'Geleceğin teknolojisinde senin de izin olsun.',
    sections: [
      {
        title: 'Birlikte öğrenmek, birlikte üretmek',
        body: 'Yazılım, bilişim, enerji ve mühendislik farklı soruları aynı masaya getirir. Merak eden, gerekçelerini paylaşan ve farklı uzmanlıklardan öğrenen bir çalışma yaklaşımını önemsiyoruz.',
      },
    ],
  },
  {
    slug: 'calisma-kulturu',
    title: 'Çalışma Kültürü',
    description: 'Farklı disiplinler. Açık iletişim. Ortak üretim.',
    sections: [
      {
        title: 'Düşünceleri paylaşmak',
        body: 'Teknik tartışmaların açık ve saygılı olduğu, sorumlulukların anlaşılır biçimde tanımlandığı bir yaklaşımı destekliyoruz. Bilginin paylaşılması ve kararların belgelenmesi ortak üretimi güçlendirir.',
      },
      {
        title: 'Öğrenmeye alan açmak',
        body: 'Yeni teknolojileri yalnızca güncel oldukları için değil, gerçek ihtiyaçları karşıladıkları ölçüde değerlendiriyoruz. Denemeler, geri bildirim ve teknik inceleme bu yaklaşımın parçalarıdır.',
      },
    ],
  },
  {
    slug: 'acik-pozisyonlar',
    title: 'Açık Pozisyonlar',
    description: 'Bir sonraki adımı birlikte düşünelim.',
    sections: [
      {
        title: 'Pozisyon duyuruları',
        body: 'Şu anda bu sitede yayımlanmış, şirket tarafından doğrulanmış açık pozisyon bulunmuyor. Bu durum işe alım yapılmadığı anlamına gelmez. Onaylanan ilanlar görev kapsamı, çalışma koşulları ve başvuru kanalıyla birlikte burada paylaşılacaktır.',
      },
    ],
  },
  {
    slug: 'genel-basvuru',
    title: 'Genel Başvuru',
    description: 'Uzmanlığını ve ilgi alanlarını tanıyalım.',
    sections: [
      {
        title: 'Başvuruda hangi bilgiler paylaşılır?',
        body: 'Uzmanlık alanınız, deneyiminizin kısa özeti ve ilgilendiğiniz disiplin başvuru değerlendirmesinin başlangıç bilgilerini oluşturur. Özel nitelikli kişisel veri veya gereksiz belge paylaşılmamalıdır.',
      },
    ],
    form: 'career',
  },
  {
    slug: 'staj-programi',
    title: 'Staj Programı',
    description: 'Merakını uygulamaya dönüştür.',
    sections: [
      {
        title: 'Öğrenme alanları',
        body: 'Yazılım, bilişim altyapıları, enerji ve mühendislik farklı öğrenme alanları sunar. Staj kontenjanı, tarihleri ve koşulları henüz şirket tarafından doğrulanmamıştır. Duyuru yapılmadan bir kabul veya yer garantisi verilmez.',
      },
    ],
    form: 'career',
  },
].map((p) => ({
  ...p,
  slug: `insan-kaynaklari/${p.slug}`,
  eyebrow: 'Algebra’da birlikte üretmek',
  kind: 'career',
  image: 'careers',
})) as DetailPage[];
export const articles: DetailPage[] = [
  {
    slug: 'hibrit-buluta-gecis',
    title: 'Hibrit buluta geçmeden önce sorulması gereken sorular',
    description: 'İş yükünün yeri, teknolojiden önce bir ihtiyaç ve sorumluluk kararıdır.',
    image: 'datacenter',
    sections: [
      {
        title: 'Hangi iş yükü, hangi ortam?',
        body: 'Hibrit bulut planı bir sunucu listesinden fazlasıdır. Her uygulamanın veri hassasiyeti, gecikme beklentisi, bağımlılıkları ve kullanım yoğunluğu farklıdır. Önce bu özellikler sınıflandırılmalı, ardından yerel veya bulut ortamının uygunluğu değerlendirilmelidir.',
      },
      {
        title: 'Kimlik ve bağlantı nasıl işleyecek?',
        body: 'Kullanıcı ve servis kimlikleri farklı ortamlarda tutarlı yönetilmelidir. Ağ erişimi, güven sınırları ve yetki iptali tasarım aşamasında netleşmelidir. Bir bağlantı kesildiğinde hangi işlevlerin çalışmaya devam edeceği açıkça test edilmelidir.',
      },
      {
        title: 'Maliyet ve geri dönüş planı var mı?',
        body: 'Yalnızca işlem ve depolama fiyatlarını karşılaştırmak yetersizdir. Veri transferi, lisanslar, yedek kopyalar, izleme ve ekip yetkinlikleri toplam maliyete dahildir. Taşıma kararı kadar geri dönüş veya sağlayıcı değişikliği senaryosu da belgelenmelidir.',
      },
    ],
  },
  {
    slug: 'gunes-enerjisi-ve-depolama',
    title: 'Güneş enerjisinde üretim ve depolamayı birlikte düşünmek',
    description:
      'Doğru kapasite, üretim grafiği ile gerçek tüketimin aynı tabloda buluşmasıyla belirlenir.',
    image: 'solar',
    sections: [
      {
        title: 'Üretim ile tüketim aynı eğri değildir',
        body: 'Güneş üretimi gün içinde değişir; tüketim ise vardiyalara, ekipmana ve işletme alışkanlıklarına bağlıdır. Yalnızca yıllık toplam değerler, gün içindeki farkı gizleyebilir. Uygun zaman çözünürlüğünde ölçüm, depolama ihtiyacını değerlendirmek için önemlidir.',
      },
      {
        title: 'Batarya yalnızca kapasite değildir',
        body: 'Enerji kapasitesi kadar güç sınırı, çevrim ömrü, sıcaklık koşulları ve güvenli işletim tasarımı önemlidir. Kullanılabilir kapasite zaman içinde değişebilir. Fizibilite bu varsayımları açıkça içermeli ve farklı işletim senaryolarını karşılaştırmalıdır.',
      },
      {
        title: 'Önce senaryo, sonra ekipman',
        body: 'Pik yük azaltma, öz tüketim artırma ve kritik yük desteği farklı kontrol stratejileri gerektirir. Aynı depolama sistemi her hedefi aynı anda en iyi biçimde karşılamayabilir. Öncelik ve kontrol kuralları tasarım aşamasında belirlenmelidir.',
      },
    ],
  },
  {
    slug: 'surec-odakli-dijital-donusum',
    title: 'Dijital dönüşüme teknolojiyle değil, süreçlerle başlamak',
    description: 'Yeni bir uygulama, belirsiz bir süreci tek başına düzeltmez.',
    image: 'software',
    sections: [
      {
        title: 'İlk iş, mevcut akışı görünür kılmak',
        body: 'Bir sürecin sahibi, girdisi, çıktısı ve istisnaları net değilse otomasyon belirsizliği hızlandırabilir. Dönüşüme önce mevcut akışın haritasıyla başlanmalıdır. Bekleme noktaları ve tekrar eden veri girişleri bu haritada görünür hale gelir.',
      },
      {
        title: 'Ortak veri tanımları oluşturmak',
        body: 'Aynı müşterinin veya ürünün farklı sistemlerde farklı tanımlanması, entegrasyonun teknik olarak çalışmasına rağmen iş sonuçlarının tutarsız kalmasına yol açabilir. Ana veri sorumluluğu ve güncelleme kuralları uygulama geliştirilmeden önce belirlenmelidir.',
      },
      {
        title: 'Küçük ve ölçülebilir adımlarla ilerlemek',
        body: 'Sınırlı bir pilot, kurumun gerçek verisi ve kullanıcılarıyla varsayımları sınamaya yardımcı olur. Başlangıç ölçümleri kaydedilmeli, başarı kriterleri önceden açıklanmalıdır. Yaygınlaştırma kararı, kullanıcı geri bildirimi ve ölçümlere dayanmalıdır.',
      },
    ],
  },
].map((p) => ({
  ...p,
  slug: `bilgi-merkezi/${p.slug}`,
  eyebrow: 'Teknik bakış',
  kind: 'article',
})) as DetailPage[];
export const faq = [
  {
    q: 'Hizmetler ve çözümler arasındaki fark nedir?',
    a: 'Hizmetler belirli bir işin teknik kapsamını anlatır. Çözümler ise bir iş problemini ele alır ve birden fazla hizmetin birlikte nasıl değerlendirilebileceğini açıklar.',
  },
  {
    q: 'Teklif için hangi bilgilere ihtiyaç var?',
    a: 'Mevcut durum, hedeflenen sonuç, kritik kısıtlar ve takvim beklentisi başlangıç için yeterlidir. Kesin kapsam ve maliyet, keşif ve teknik değerlendirme sonrasında belirlenir.',
  },
  {
    q: 'Mevcut altyapıyla çalışılabilir mi?',
    a: 'Mevcut yatırımın yeniden kullanımı, teknik uyumluluk ve işletim gereksinimleri incelenerek değerlendirilir. Her durumda tüm sistemin yenilenmesi gerekmez.',
  },
  {
    q: 'Site üzerinden başvuru gönderebilir miyim?',
    a: 'Form gönderim servisi henüz yapılandırılmamıştır. Formlar doğrulama ve önizleme sunar; herhangi bir mesaj, başvuru veya dosya iletmez.',
  },
];
export const legal: DetailPage[] = [
  {
    slug: 'gizlilik',
    title: 'Gizlilik ve KVKK',
    description: 'Veri işleme süreçleri hakkında açık bilgi.',
    sections: [
      {
        title: 'Bu sürümdeki veri akışı',
        body: 'Bu web sitesi statik içerik sunar. Analitik ve pazarlama izleme araçları eklenmemiştir. Form alanlarına girilen bilgiler bu sürümde bir sunucuya iletilmez ve tarayıcı depolamasına kaydedilmez.',
      },
      {
        title: 'Yayımdan önce tamamlanacak bilgiler',
        body: 'Veri sorumlusunun unvanı ve adresi, başvuru kanalı, işleme amaçları, hukuki sebepler, alıcı grupları ve saklama süreleri şirket tarafından doğrulanmalıdır. Bu sayfa, tamamlanmış bir aydınlatma metni yerine geçmez. Form servisi etkinleştirilmeden önce ilgili aydınlatma metni hazırlanmalıdır.',
      },
    ],
  },
  {
    slug: 'cerez-politikasi',
    title: 'Çerez Politikası',
    description: 'Bu sitede kullanılan tarayıcı teknolojileri.',
    sections: [
      {
        title: 'Mevcut kullanım',
        body: 'Bu sürümde analitik, reklam veya pazarlama çerezi ayarlanmaz. Dil seçimi URL üzerinden yönetilir. Form verileri yerel depolamaya yazılmaz. Görseller ve fontlar yerel dosyalardan sunulur.',
      },
      {
        title: 'Gelecekteki değişiklikler',
        body: 'Harita, analitik, başvuru servisi veya üçüncü taraf içerik eklenirse veri akışları yeniden değerlendirilmeli ve bu politika güncellenmelidir. Gerekli izin mekanizmaları ilgili kullanım devreye alınmadan önce kurulmalıdır.',
      },
    ],
  },
].map((p) => ({ ...p, eyebrow: 'Şeffaflık', kind: 'legal', image: 'engineering' })) as DetailPage[];
export const misc: DetailPage[] = [
  {
    slug: 'bilgi-merkezi/haberler',
    title: 'Haberler',
    description: 'Algebra Teknoloji’den doğrulanmış kurumsal gelişmeler.',
    eyebrow: 'Bilgi Merkezi',
    kind: 'corporate',
    image: 'engineering',
    sections: [
      {
        title: 'Kurumsal haber akışı',
        body: 'Henüz yayımlanmış bir kurumsal haber bulunmuyor. Şirket tarafından onaylanan haberler tarih, kaynak ve ilgili içerikleriyle bu alanda paylaşılacaktır.',
      },
    ],
  },
  {
    slug: 'bilgi-merkezi/duyurular',
    title: 'Duyurular',
    description: 'Güncel kurumsal bilgilendirmeler.',
    eyebrow: 'Bilgi Merkezi',
    kind: 'corporate',
    image: 'engineering',
    sections: [
      {
        title: 'Duyuru alanı',
        body: 'Henüz yayımlanmış bir duyuru bulunmuyor. Doğrulanmış duyurular kapsam ve geçerlilik bilgileriyle paylaşılacaktır.',
      },
    ],
  },
  {
    slug: 'iletisim/teklif-talebi',
    title: 'Teklif Talebi',
    description: 'Doğru çözüm, ihtiyacınızı anlamakla başlar.',
    eyebrow: 'Birlikte değerlendirelim',
    kind: 'corporate',
    image: 'datacenter',
    sections: [
      {
        title: 'İlk değerlendirme',
        body: 'İhtiyacınızı, mevcut sisteminizi ve hedeflediğiniz sonucu paylaşmak kapsamı netleştirmenin ilk adımıdır. Teknik değerlendirme tamamlanmadan kesin fiyat veya süre verilmez.',
      },
    ],
    form: 'quote',
  },
  {
    slug: 'iletisim/is-birligi',
    title: 'İş Birliği Başvurusu',
    description: 'Birbirini tamamlayan uzmanlıkları buluşturalım.',
    eyebrow: 'Ortak değer',
    kind: 'corporate',
    image: 'engineering',
    sections: [
      {
        title: 'Birlikte üretmek',
        body: 'Uzmanlık alanınızı ve değerlendirmek istediğiniz iş birliği modelini açıklayın. Teknik uyum, destek sorumlulukları ve ortak hedefler değerlendirme sürecinin temelini oluşturur.',
      },
    ],
    form: 'partner',
  },
];
