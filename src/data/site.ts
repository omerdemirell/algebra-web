import { services, serviceGroups, type DetailPage } from './services';
import { publishedLocales, localePath } from '../i18n/locales';
import { solutions } from './solutions';
import { corporate, sectors, careers, articles, legal, misc } from './pages';
export { services, serviceGroups, solutions, corporate, sectors, careers, articles, legal };
export type { DetailPage };
export const detailPages = [
  ...services,
  ...solutions,
  ...corporate,
  ...sectors,
  ...careers,
  ...articles,
  ...legal,
  ...misc,
];
export const hubPages = [
  {
    slug: 'kurumsal',
    title: 'Teknolojiye bütüncül bir bakış.',
    eyebrow: 'Kurumsal',
    description: 'Düşünme biçimimiz, değerlerimiz ve geleceğe yaklaşımımız.',
    type: 'corporate',
  },
  {
    slug: 'hizmetler',
    title: 'Uzmanlığımız, sizin olanaklarınız.',
    eyebrow: 'Hizmetler',
    description:
      'Yazılım, bilişim, enerji ve mühendislik. İhtiyacınız olan yetkinlikler, ortak bir bakışta.',
    type: 'services',
  },
  {
    slug: 'cozumler',
    title: 'İhtiyacınızdan çözüme.',
    eyebrow: 'Çözümler',
    description: 'İş problemlerini bütünleşik teknoloji mimarilerine dönüştüren yaklaşımlar.',
    type: 'solutions',
  },
  {
    slug: 'sektorler',
    title: 'Her sektörün ihtiyacını anlıyoruz.',
    eyebrow: 'Sektörler',
    description:
      'Farklı iş modelleri, farklı gereksinimler. Her sektöre kendi dinamiklerinden bakıyoruz.',
    type: 'sectors',
  },
  {
    slug: 'insan-kaynaklari',
    title: 'Gelecekte senin de izin olsun.',
    eyebrow: 'İnsan Kaynakları',
    description: 'Merak eden, birlikte öğrenen ve teknolojiyle değer üreten bir yaklaşımı keşfet.',
    type: 'careers',
  },
  {
    slug: 'bilgi-merkezi',
    title: 'Bilgiyle bir adım öne.',
    eyebrow: 'Bilgi Merkezi',
    description: 'Yazılım, altyapı ve enerji üzerine teknik bakışlar ve düşünceler.',
    type: 'insights',
  },
  {
    slug: 'bilgi-merkezi/blog',
    title: 'Düşünceler, yaklaşımlar, yeni sorular.',
    eyebrow: 'Blog',
    description: 'Teknoloji kararlarını daha iyi anlamak için bir başlangıç.',
    type: 'insights',
  },
  {
    slug: 'bilgi-merkezi/teknik-makaleler',
    title: 'Teknolojinin arkasındaki düşünce.',
    eyebrow: 'Teknik Makaleler',
    description: 'Mimarileri, gereksinimleri ve teknik kararları birlikte değerlendirin.',
    type: 'insights',
  },
  {
    slug: 'bilgi-merkezi/sik-sorulan-sorular',
    title: 'Sorularınıza açık yanıtlar.',
    eyebrow: 'Sık Sorulan Sorular',
    description: 'Hizmet yaklaşımı, kapsam ve iletişim süreçleri hakkında.',
    type: 'faq',
  },
  {
    slug: 'iletisim',
    title: 'Geleceği birlikte şekillendirelim.',
    eyebrow: 'İletişim',
    description: 'İhtiyaçlarınızı ve hedeflerinizi konuşmak için ilk adım.',
    type: 'contact',
  },
] as const;
export const basePaths = [
  '/',
  ...hubPages.map((p) => `/${p.slug}/`),
  ...detailPages.map((p) => `/${p.slug}/`),
];
export const publishedPaths = publishedLocales.flatMap((locale) =>
  basePaths.map((path) => localePath(locale, path)),
);
