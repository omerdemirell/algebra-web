export type ContentSection = { title: string; body: string; items?: string[] };
export type DetailPage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  kind: 'service' | 'solution' | 'corporate' | 'sector' | 'article' | 'career' | 'legal';
  sections: ContentSection[];
  faq?: { q: string; a: string }[];
  category?: string;
  related?: string[];
  form?: 'quote' | 'career' | 'partner';
  review?: string[];
};
export const serviceGroups = [
  {
    id: 'yazilim',
    title: 'Yazılım ve Dijital Teknolojiler',
    image: 'software',
    intro:
      'İş süreçlerinizi anlayan, verinizi anlamlandıran ve büyümenize uyum sağlayan dijital sistemler.',
    tech: ['TypeScript ve API mimarileri', 'Otomatik test ve CI/CD', 'Kimlik ve erişim yönetimi'],
    process:
      'İhtiyaç haritası ve kullanıcı akışları çıkarılır. Mimari kararlar, veri modeli ve kabul kriterleri birlikte belirlenir. Küçük sürümlerle geliştirme, güvenlik kontrolleri ve kullanıcı kabul testleri yürütülür. Yayına geçiş sonrasında izleme ve bakım planı devreye alınır.',
  },
  {
    id: 'bilisim',
    title: 'Bilişim ve Veri Merkezi',
    image: 'datacenter',
    intro: 'Süreklilik, güvenlik ve kapasiteyi birlikte ele alan fiziksel ve dijital altyapılar.',
    tech: [
      'Kapasite ve bağımlılık analizi',
      'Ağ segmentasyonu ve erişim kontrolü',
      'İzlenebilirlik ve kurtarma testleri',
    ],
    process:
      'Mevcut envanter, kritik uygulamalar ve bağımlılıklar incelenir. Kapasite, erişilebilirlik ve kurtarma hedefleri tanımlanır. Uygulama, kontrollü değişiklik pencereleri ve geri dönüş planıyla gerçekleştirilir. Kabul testleri ve işletim dokümantasyonu ile teslim tamamlanır.',
  },
  {
    id: 'enerji',
    title: 'Enerji ve Yenilenebilir Enerji',
    image: 'solar',
    intro:
      'Üretimden tüketime, enerji kullanımını verimlilik ve sürdürülebilirlik odağında yeniden düşünün.',
    tech: [
      'Yük profili ve saha değerlendirmesi',
      'Koruma koordinasyonu ve ölçüm',
      'İzleme ve performans analizi',
    ],
    process:
      'Tüketim verileri, saha koşulları ve bağlantı gereksinimleri değerlendirilir. Teknik fizibilite ve alternatif senaryolar hazırlanır. Uygulanabilirlik ve gerekli izinler netleştirildikten sonra mühendislik ve kurulum aşamasına geçilir. Ölçümler, devreye alma kontrolleri ve bakım planı birlikte teslim edilir.',
  },
  {
    id: 'kurumsal',
    title: 'Kurumsal Teknoloji Hizmetleri',
    image: 'engineering',
    intro:
      'Teknoloji kararlarını iş hedefleri, operasyonel gereksinimler ve uygulanabilir bir yol haritasıyla birleştirin.',
    tech: [
      'Mevcut durum ve risk analizi',
      'Mimari ve entegrasyon dokümantasyonu',
      'Kabul kriterleri ve yönetişim',
    ],
    process:
      'Paydaşlarla hedefler, kısıtlar ve mevcut durum değerlendirilir. Alternatifler teknik uygulanabilirlik ve toplam sahip olma maliyeti açısından karşılaştırılır. Önceliklendirilmiş yol haritası hazırlanır. Uygulama aşamaları, sorumluluklar ve ölçüm kriterleri açıkça tanımlanır.',
  },
] as const;
// Editorial records: title | slug | core challenge | scope | use case | acceptance criterion.
const records: Record<(typeof serviceGroups)[number]['id'], string[]> = {
  yazilim: [
    'Özel Yazılım Geliştirme|ozel-yazilim-gelistirme|Standart ürünlerin karşılamadığı iş kurallarını, kurumunuza özel bir uygulama mimarisine dönüştürün.|Alan modelleme;Rol bazlı erişim;İş akışı tasarımı;Otomatik test|Özel operasyon ve onay süreçleri|Kritik iş akışları için tanımlı kabul senaryolarının geçilmesi',
    'Kurumsal Web Uygulamaları|kurumsal-web-uygulamalari|Çalışanları, müşterileri ve operasyonları erişilebilir bir web deneyiminde buluşturun.|Müşteri ve bayi portalları;Yetkilendirme;Responsive arayüz;Performans bütçesi|Bayi, tedarikçi ve çalışan portalları|Kullanıcı akışlarının erişilebilirlik ve performans kriterleriyle doğrulanması',
    'Mobil Uygulama Geliştirme|mobil-uygulama-gelistirme|Saha ve müşteri deneyimlerini mobil cihazların olanaklarıyla destekleyin.|Çevrimdışı senaryolar;Güvenli oturum;Bildirim akışları;Cihaz testleri|Saha ekipleri ve mobil müşteri deneyimleri|Hedef cihazlarda çevrimdışı senkronizasyon ve oturum testlerinin geçilmesi',
    'ERP ve CRM|erp-ve-crm|Dağınık müşteri ve operasyon verilerini tutarlı kurumsal süreçlere dönüştürün.|Süreç eşleştirme;Veri temizleme;Modül uyarlama;Geçiş planı|Satış, stok ve müşteri ilişkileri yönetimi|Veri mutabakatı ve uçtan uca süreç kabul testlerinin tamamlanması',
    'API ve Sistem Entegrasyonları|api-ve-sistem-entegrasyonlari|Uygulamalar arasında kontrollü ve izlenebilir veri akışları kurun.|API sözleşmeleri;Kimlik doğrulama;Kuyruk ve tekrar deneme;Versiyonlama|ERP, e-ticaret ve üçüncü taraf servis bağlantıları|Sözleşme testleri, hata kurtarma ve izleme akışlarının doğrulanması',
    'Yapay Zekâ ve Makine Öğrenmesi|yapay-zeka-ve-makine-ogrenmesi|Veriye dayalı tahmin ve yardımcı karar mekanizmalarını, ölçülebilir kullanım senaryolarıyla değerlendirin.|Veri kalitesi;Model değerlendirme;İnsan denetimi;Model izleme|Talep tahmini, belge sınıflandırma ve bilgi erişimi|Ayrılmış test verisinde hata oranı ve kullanım sınırlarının raporlanması',
    'İş Süreçleri Otomasyonu|is-surecleri-otomasyonu|Tekrarlayan işleri, izlenebilir ve denetlenebilir iş akışlarına taşıyın.|Süreç keşfi;İstisna yönetimi;Onay zincirleri;Olay kayıtları|Belge onayları ve operasyonel veri aktarımı|Normal akışlar kadar istisna ve geri alma senaryolarının test edilmesi',
    'Veri Analitiği ve İş Zekâsı|veri-analitigi-ve-is-zekasi|Farklı kaynaklardaki verileri ortak tanımlar ve güvenilir göstergelerle anlamlandırın.|Veri modelleme;ETL akışları;Gösterge tanımları;Dashboard tasarımı|Operasyon ve yönetim raporlaması|Kaynak veri ile raporların mutabakatı ve güncellik eşiklerinin doğrulanması',
    'Bulut Tabanlı Yazılım|bulut-tabanli-yazilim|Değişken iş yüklerine uyum sağlayan, gözlemlenebilir uygulamalar tasarlayın.|Servis mimarisi;Otomatik dağıtım;Ölçeklendirme;Maliyet görünürlüğü|Talebi değişken web servisleri ve SaaS platformları|Yük testleri, dağıtım geri alma ve maliyet sınırlarının doğrulanması',
    'Yazılım Modernizasyonu|yazilim-modernizasyonu|Kritik iş mantığını koruyarak eski uygulamaların teknik sınırlarını aşın.|Bağımlılık analizi;Aşamalı dönüşüm;Veri geçişi;Regresyon testleri|Bakımı zorlaşan monolit ve eski uygulamalar|Eski ve yeni sistem çıktılarının karşılaştırılması ve geçişin geri alınabilirliği',
    'Yazılım Bakım ve Destek|yazilim-bakim-ve-destek|Uygulamaların yaşam döngüsünü güvenlik, hata yönetimi ve kontrollü sürümlerle yönetin.|Hata önceliklendirme;Güvenlik güncellemeleri;Sürüm yönetimi;İzleme|Üretimde çalışan kurumsal uygulamalar|Öncelik seviyeleri ve müdahale kapsamının sözleşmede açıkça tanımlanması',
  ],
  bilisim: [
    'Veri Merkezi Tasarımı|veri-merkezi-tasarimi|BT kapasitesi ile fiziksel altyapıyı aynı ihtiyaç haritasında buluşturun.|Yerleşim planı;Kapasite modeli;Yedeklilik senaryoları;Fiziksel güvenlik|Yeni tesis ve kapasite genişletme planları|Tasarımın yük, süreklilik ve büyüme senaryolarıyla karşılaştırılması',
    'Veri Merkezi Kurulumu|veri-merkezi-kurulumu|Tasarlanmış altyapıyı belgelenebilir ve test edilebilir bir devreye alma süreciyle hayata geçirin.|Rack yerleşimi;Yapısal kablolama;Sistem entegrasyonu;Entegre testler|Yeni veri odaları ve kurumsal BT tesisleri|Kablolama, güç ve bağlantı testlerinin kayıt altına alınması',
    'Veri Merkezi Modernizasyonu|veri-merkezi-modernizasyonu|Mevcut tesislerdeki kapasite ve süreklilik sınırlarını kontrollü değişikliklerle iyileştirin.|Envanter analizi;Geçiş sıralaması;Kapasite yenileme;Geri dönüş planı|Yaşlanan veri merkezi altyapıları|Geçiş öncesi ve sonrası kapasite ve hizmet etkisinin ölçülmesi',
    'Sunucu ve Depolama Sistemleri|sunucu-ve-depolama-sistemleri|İş yükünüzün işlem gücü, gecikme ve veri büyümesi gereksinimlerini dengeleyin.|İş yükü analizi;Depolama katmanları;Yedeklilik;Kapasite takibi|Veritabanları, sanallaştırma ve dosya servisleri|Temsilî iş yüklerinde IOPS, gecikme ve arıza senaryolarının test edilmesi',
    'Network ve Ağ Altyapısı|network-ve-ag-altyapisi|Kullanıcıları ve sistemleri güvenli, yönetilebilir bağlantılar üzerinden birleştirin.|LAN ve WAN;VLAN segmentasyonu;Kablosuz kapsama;Ağ izleme|Kampüsler, şubeler ve dağıtık ofisler|Kapsama, bant genişliği ve yedek bağlantı geçişlerinin doğrulanması',
    'Bulut ve Hibrit Bulut|bulut-ve-hibrit-bulut|İş yüklerini veri konumu, güvenlik ve işletim gereksinimlerine uygun ortamlara yerleştirin.|İş yükü sınıflandırma;Güvenli bağlantı;Kimlik federasyonu;Maliyet yönetimi|Yerel sistemlerle bulut servislerinin birlikte kullanımı|Bağlantı, erişim ve veri konumu gereksinimlerinin doğrulanması',
    'Sanallaştırma|sanallastirma|Fiziksel kaynakları yönetilebilir ve kontrollü sanal iş yüklerine dönüştürün.|Küme tasarımı;Kaynak planlama;Canlı taşıma;İmaj yönetimi|Sunucu konsolidasyonu ve test ortamları|Kaynak yoğunluğu ve düğüm kaybı senaryolarının test edilmesi',
    'Siber Güvenlik|siber-guvenlik|Kurumun saldırı yüzeyini, önceliklendirilmiş koruma ve görünürlük katmanlarıyla yönetin.|Varlık ve risk analizi;Erişim kontrolü;Ağ güvenliği;Olay hazırlığı|Kritik sistemler ve dağıtık çalışma ortamları|Yetkili kapsamda kontrollerin ve olay müdahale akışının doğrulanması',
    'Veri Yedekleme|veri-yedekleme|Verinin kopyalanması kadar geri döndürülebilmesini de merkeze alın.|Yedek politikası;Değiştirilemez kopyalar;Saklama süreleri;Geri yükleme testleri|Kurumsal dosyalar, veritabanları ve sanal makineler|Örnek verilerin hedeflenen sürede tutarlı biçimde geri yüklenmesi',
    'Felaket Kurtarma|felaket-kurtarma|Kritik hizmetlerin bir kesinti sonrasında hangi sırayla ve nasıl geri döneceğini tanımlayın.|İş etki analizi;RTO ve RPO;Kurtarma ortamı;Tatbikat|Lokasyon kaybı ve büyük sistem kesintileri|Tatbikatta ölçülen kurtarma süresi ve veri kaybının hedeflerle karşılaştırılması',
    'Sistem İzleme|sistem-izleme|Sistem davranışını metrik, log ve anlamlı alarmlarla görünür kılın.|Metrik toplama;Log merkezileştirme;Alarm eşikleri;Gösterge panoları|Sunucular, ağlar ve uygulama servisleri|Alarm gürültüsü ve gerçek olay yakalama senaryolarının değerlendirilmesi',
    'Yönetilen BT Hizmetleri|yonetilen-bt-hizmetleri|Günlük BT operasyonunu sorumlulukları ve hizmet sınırları belirlenmiş bir modele taşıyın.|Envanter yönetimi;Değişiklik kontrolü;Yama planlama;Operasyon raporları|İç BT ekibini destekleyen işletim modelleri|Hizmet kapsamı, destek saatleri ve eskalasyonların sözleşmede belirlenmesi',
    'Veri Merkezi Enerji Altyapısı|veri-merkezi-enerji-altyapisi|Kritik BT yüklerini besleyen güç zincirini kapasite ve süreklilik odağında tasarlayın.|UPS ve dağıtım;Yük hesabı;Yedek besleme;Enerji izleme|Veri odaları ve kritik sistem tesisleri|Güç kesintisi ve bakım bypass senaryolarının yetkili ekiplerle test edilmesi',
    'Veri Merkezi Soğutma Altyapısı|veri-merkezi-sogutma-altyapisi|Isıl yükleri, hava akışını ve büyüme gereksinimlerini aynı tasarımda dengeleyin.|Isıl yük analizi;Sıcak ve soğuk koridor;Sensör yerleşimi;Kapasite planı|Yoğun rack yerleşimleri ve veri merkezi yenilemeleri|Temsilî yüklerde sıcaklık ve nem dağılımının ölçülmesi',
  ],
  enerji: [
    'Güneş Enerjisi Sistemleri|gunes-enerjisi-sistemleri|Güneşten elektrik üretimini saha, tüketim ve bağlantı gereksinimleriyle birlikte değerlendirin.|Üretim simülasyonu;Panel ve inverter seçimi;Bağlantı değerlendirmesi;Performans izleme|Ticari tesisler ve öz tüketim uygulamaları|Üretim tahmininin kayıp varsayımlarıyla birlikte belgelenmesi',
    'Çatı Tipi GES|cati-tipi-ges|Kullanılabilir çatı alanını, statik uygunluk ve tüketim profiliyle birlikte ele alın.|Çatı keşfi;Statik değerlendirme;Yerleşim tasarımı;Kablo güzergâhları|Fabrikalar, depolar ve ticari çatılar|Taşıyıcı uygunluğu ve gölgelenme etkilerinin uzmanlarca değerlendirilmesi',
    'Arazi Tipi GES|arazi-tipi-ges|Arazi özelliklerini ve şebeke koşullarını üretim mimarisinin temel girdileri yapın.|Topoğrafya;Zemin değerlendirmesi;Saha yerleşimi;Şebeke bağlantısı|Uygun arazilerde güneş enerjisi yatırımları|Arazi, izin ve bağlantı kısıtlarının fizibiliteye yansıtılması',
    'GES Mühendislik ve Projelendirme|ges-muhendislik-ve-projelendirme|Yatırım kararlarını uygulanabilir ve izlenebilir mühendislik dokümanlarıyla destekleyin.|Tek hat şemaları;Dizi tasarımı;Kablo hesapları;Koruma koordinasyonu|Yeni GES ve kapasite geliştirme çalışmaları|Hesapların saha verileri ve ilgili teknik gereksinimlerle kontrol edilmesi',
    'GES Kurulumu|ges-kurulumu|Mühendislik tasarımını saha kalitesi ve iş güvenliği odağında uygulayın.|Montaj planı;DC ve AC kablolama;Topraklama;Kalite kontrol|Çatı ve arazi tipi güneş santralleri|Montaj ve elektriksel kontrollerin test kayıtlarıyla belgelenmesi',
    'GES Devreye Alma|ges-devreye-alma|Kurulan sistemin elektriksel bütünlüğünü ve izleme zincirini doğrulayın.|Görsel muayene;İzolasyon ölçümleri;İnverter ayarları;İzleme kontrolü|Kurulumu tamamlanan güneş enerji tesisleri|Yetkili kabul sürecinden önce ölçüm ve uygunsuzluk kayıtlarının tamamlanması',
    'GES Bakım ve İşletme|ges-bakim-ve-isletme|Üretim kayıplarını görünür kılan ve arıza riskini azaltmayı hedefleyen işletim planları oluşturun.|Periyodik kontrol;Termal inceleme;Üretim analizi;Arıza yönetimi|İşletmedeki çatı ve arazi tipi santraller|Beklenen ve gerçekleşen üretim farklarının koşullarla birlikte analiz edilmesi',
    'Enerji Depolama Sistemleri|enerji-depolama-sistemleri|Depolama kapasitesini güç, çevrim ve işletim senaryosuna göre boyutlandırın.|Yük analizi;Batarya boyutlandırma;Güvenlik mimarisi;Enerji yönetimi|Pik yük azaltma ve üretim-tüketim dengeleme|Degradasyon, sıcaklık ve çevrim varsayımlarının modele dahil edilmesi',
    'Enerji Verimliliği|enerji-verimliligi|Tüketimi ölçülebilir bir tabana oturtarak iyileştirme fırsatlarını önceliklendirin.|Tüketim envanteri;Alt ölçüm;Verimlilik senaryoları;Doğrulama planı|Sanayi tesisleri ve ticari binalar|Tasarrufun üretim ve hava koşullarıyla normalize edilerek değerlendirilmesi',
    'Elektrik Altyapısı|elektrik-altyapisi|Elektrik dağıtımını yük gereksinimleri ve güvenli işletim koşulları etrafında planlayın.|Yük hesabı;Pano mimarisi;Kablo boyutlandırma;Topraklama|Ticari binalar ve endüstriyel tesisler|Ölçümlerin ve koruma ayarlarının yetkili teknik ekip tarafından doğrulanması',
    'Elektrik Taahhüt|elektrik-taahhut|Elektrik uygulamalarını iş programı, saha koordinasyonu ve kabul kriterleriyle yönetin.|Saha koordinasyonu;Malzeme planlama;Montaj denetimi;As-built dokümanlar|Yeni tesis ve kapsamlı renovasyon çalışmaları|Uygulama dosyasının ölçüm raporları ve güncel çizimlerle tamamlanması',
    'Elektrikli Araç Şarj Altyapısı|elektrikli-arac-sarj-altyapisi|Şarj gereksinimlerini mevcut elektrik kapasitesi ve kullanıcı senaryolarıyla birleştirin.|Güç kapasitesi;AC ve DC senaryoları;Yük paylaşımı;İşletim bağlantıları|Filo, iş yeri ve ticari otoparklar|Eşzamanlı şarj ve kapasite sınırlama senaryolarının doğrulanması',
    'Enerji Danışmanlığı|enerji-danismanligi|Enerji kararlarını teknik varsayımları açık, karşılaştırılabilir senaryolarla değerlendirin.|Tüketim analizi;Yatırım alternatifleri;Yaşam döngüsü maliyeti;Duyarlılık analizi|Yeni yatırım ve enerji dönüşüm planları|Fiyat ve üretim varsayımlarına göre sonuçların duyarlılığının raporlanması',
  ],
  kurumsal: [
    'Dijital Dönüşüm Danışmanlığı|dijital-donusum-danismanligi|Teknoloji yatırımını süreç olgunluğu ve ölçülebilir iş hedefleriyle eşleştirin.|Olgunluk analizi;Süreç haritası;Önceliklendirme;Dönüşüm yol haritası|Dijitalleşme programına başlayan kurumlar|Her girişimin sahibi, veri ihtiyacı ve başarı ölçütünün tanımlanması',
    'Sistem Entegrasyonu|sistem-entegrasyonu|Farklı teknoloji katmanlarını birlikte yönetilebilir bir işletim mimarisinde buluşturun.|Bağımlılık haritası;Arayüz tasarımı;Uçtan uca test;İşletim devri|Birden fazla sistem ve tedarikçinin bulunduğu kurumlar|Sistemler arası hata, zaman aşımı ve erişim senaryolarının test edilmesi',
    'Teknoloji Altyapı Projelendirme|teknoloji-altyapi-projelendirme|BT, enerji ve fiziksel altyapı gereksinimlerini ortak bir mühendislik planına taşıyın.|Gereksinim matrisi;Teknik şartname;Kapasite planı;Disiplin koordinasyonu|Yeni kampüs, tesis ve ofis altyapıları|Disiplinler arası bağımlılıkların ve kabul kriterlerinin izlenebilirliği',
    'Teknik Bakım ve Destek|teknik-bakim-ve-destek|Altyapı varlıklarının bakımını risk, önem ve yaşam döngüsüne göre planlayın.|Varlık envanteri;Önleyici bakım;Arıza sınıflandırma;Yedek parça planı|Teknoloji ve enerji altyapıları|Bakım kapsamı, müdahale koşulları ve kayıtların açıkça belirlenmesi',
    'Kurumsal Teknoloji Danışmanlığı|kurumsal-teknoloji-danismanligi|Teknoloji seçeneklerini iş hedefleri ve işletim kapasitesi açısından karşılaştırın.|Teknoloji değerlendirme;Toplam sahip olma maliyeti;Risk matrisi;Tedarik stratejisi|Yatırım planlayan ve mimarisini yenileyen kurumlar|Önerilerin varsayımlar, alternatifler ve teknik gerekçelerle sunulması',
  ],
};
export const services: DetailPage[] = serviceGroups.flatMap((group) =>
  records[group.id].map((record) => {
    const [title, slug, description, scope, use, acceptance] = record.split('|') as [
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const items = scope.split(';');
    return {
      slug: `hizmetler/${slug}`,
      title,
      description,
      eyebrow: group.title,
      image: group.image,
      kind: 'service',
      category: group.id,
      sections: [
        {
          title: 'İhtiyaçtan doğru mimariye',
          body: `${description} ${group.intro} Kapsam; mevcut sistemler, iş öncelikleri ve operasyonel kısıtlar değerlendirilerek belirlenir. Ürün seçimi ve uygulama detayları bu değerlendirmeye göre netleştirilir.`,
        },
        {
          title: 'Hizmet kapsamı',
          body: `${title} çalışmasında aşağıdaki başlıklar değerlendirilir. Nihai teslimatlar, keşif ve analiz sonrasında teklif kapsamına alınır.`,
          items,
        },
        {
          title: 'Teknik yaklaşım',
          body: `${items[0]} başlangıç girdisini oluşturur. ${items[1]} ve ${items[2]} birlikte değerlendirilir; ${items[3]?.toLocaleLowerCase('tr')} ile uygulamanın işletilebilirliği desteklenir.`,
          items: [...group.tech],
        },
        { title: 'Uygulama süreci', body: group.process },
        {
          title: 'Kullanım alanları',
          body: `${use} için değerlendirilebilir. Mevcut mimari, veri hassasiyeti, fiziksel koşullar ve kurumun işletim kaynakları uygulamanın sınırlarını belirler.`,
        },
        {
          title: 'Beklenen faydalar ve doğrulama',
          body: `Hedef; ${items[0]?.toLocaleLowerCase('tr')} ile kararları netleştirmek, ${items[2]?.toLocaleLowerCase('tr')} üzerinden operasyonel kontrolü güçlendirmektir. Kabul ölçütü: ${acceptance.toLocaleLowerCase('tr')}. Fayda ve süreler keşif yapılmadan garanti edilmez.`,
        },
      ],
      faq: [
        {
          q: `${title} çalışmasına başlamak için ne gerekir?`,
          a: `Mevcut durum, ${use.toLocaleLowerCase('tr')} gereksinimleri ve hedeflenen sonuç paylaşılmalıdır. İlk değerlendirmede ${items[0]?.toLocaleLowerCase('tr')} için gerekli veri ve sorumluluklar belirlenir.`,
        },
        {
          q: 'Kapsam ve teslim kriterleri nasıl belirlenir?',
          a: `${acceptance}. Kapsam, bağımlılıklar, hariç tutulan işler ve destek koşulları teklif ve uygulama planında yazılı olarak netleştirilir.`,
        },
      ],
    };
  }),
);
