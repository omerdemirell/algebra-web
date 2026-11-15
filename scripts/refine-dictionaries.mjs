import { readFile, writeFile } from 'node:fs/promises';

// Reviewed short UI copy and phrases that lose their intended meaning when
// translated in isolation. These overrides also protect company identity.
const copy = {
  en: [
    'Let’s talk',
    'about the future.',
    'Request a Quote',
    'Partnership',
    '{count} services',
    'Leave your mark on tomorrow.',
    'Get a Quote',
    'slideshow',
  ],
  ar: [
    'لنتحدث',
    'عن المستقبل.',
    'طلب عرض سعر',
    'الشراكة',
    '{count} خدمة',
    'اترك بصمتك في المستقبل.',
    'اطلب عرض سعر',
    'عرض شرائح',
  ],
  de: [
    'Sprechen wir',
    'über die Zukunft.',
    'Angebot anfordern',
    'Partnerschaft',
    '{count} Dienstleistungen',
    'Gestalte die Zukunft mit.',
    'Angebot anfordern',
    'Diashow',
  ],
  fr: [
    'Parlons',
    'de l’avenir.',
    'Demander un devis',
    'Partenariat',
    '{count} services',
    'Laissez votre empreinte sur l’avenir.',
    'Demander un devis',
    'diaporama',
  ],
  'zh-CN': [
    '让我们畅谈',
    '未来。',
    '获取报价',
    '合作洽谈',
    '{count} 项服务',
    '在未来留下你的印记。',
    '获取报价',
    '幻灯片',
  ],
  ja: [
    '未来について',
    '話しましょう。',
    '見積もりを依頼',
    'パートナーシップ',
    '{count} 件のサービス',
    '未来にあなたの足跡を残そう。',
    '見積もりを依頼',
    'スライドショー',
  ],
  ru: [
    'Поговорим',
    'о будущем.',
    'Запросить предложение',
    'Партнёрство',
    '{count} услуг',
    'Оставьте свой след в будущем.',
    'Запросить предложение',
    'слайд-шоу',
  ],
  it: [
    'Parliamo',
    'del futuro.',
    'Richiedi un preventivo',
    'Collaborazione',
    '{count} servizi',
    'Lascia il tuo segno nel futuro.',
    'Richiedi un preventivo',
    'presentazione',
  ],
  es: [
    'Hablemos',
    'del futuro.',
    'Solicitar presupuesto',
    'Colaboración',
    '{count} servicios',
    'Deja tu huella en el futuro.',
    'Solicitar presupuesto',
    'presentación de diapositivas',
  ],
};
const keys = [
  'Geleceği',
  'konuşalım.',
  'Teklif Talebi',
  'İş Birliği',
  '{count} hizmet',
  'Gelecekte senin de izin olsun.',
  'Teklif Al',
  'slayt gösterisi',
];
const heroKeys = [
  'Geleceğin teknolojisini',
  'bugünden inşa ediyoruz.',
  'Dijital dönüşümünüzün',
  'bir sonraki adımı.',
  'Güçlü altyapılar.',
  'Kesintisiz bir gelecek.',
  'Enerjimiz geleceğe,',
  'odağımız sürdürülebilirliğe.',
  'Farklı disiplinler.',
  'Tek bir güçlü vizyon.',
];
const hero = {
  de: [
    'Wir entwickeln die Technologie',
    'von morgen – schon heute.',
    'Ihr nächster Schritt',
    'in der digitalen Transformation.',
    'Starke Infrastrukturen.',
    'Eine widerstandsfähige Zukunft.',
    'Energie für die Zukunft.',
    'Mit Fokus auf Nachhaltigkeit.',
    'Verschiedene Disziplinen.',
    'Eine gemeinsame Vision.',
  ],
  fr: [
    'La technologie de demain,',
    'nous la construisons aujourd’hui.',
    'Votre prochaine étape',
    'dans la transformation numérique.',
    'Des infrastructures solides.',
    'Un avenir résilient.',
    'L’énergie de demain.',
    'Pensée pour durer.',
    'Des disciplines différentes.',
    'Une vision commune.',
  ],
  ja: [
    '明日のテクノロジーを',
    '今日からつくる。',
    'デジタル変革の',
    '次の一歩へ。',
    '強固なインフラ。',
    '持続する未来。',
    '未来を支えるエネルギー。',
    '持続可能性を中心に。',
    '多様な専門分野。',
    'ひとつの確かなビジョン。',
  ],
  ru: [
    'Создаём технологии будущего',
    'уже сегодня.',
    'Ваш следующий шаг',
    'в цифровой трансформации.',
    'Надёжная инфраструктура.',
    'Устойчивое будущее.',
    'Энергия для будущего.',
    'С заботой об устойчивом развитии.',
    'Разные направления.',
    'Единое видение.',
  ],
  it: [
    'Costruiamo oggi',
    'la tecnologia di domani.',
    'Il tuo prossimo passo',
    'nella trasformazione digitale.',
    'Infrastrutture solide.',
    'Un futuro resiliente.',
    'Energia per il futuro.',
    'Pensata per la sostenibilità.',
    'Discipline diverse.',
    'Un’unica visione.',
  ],
  es: [
    'Construimos hoy',
    'la tecnología del mañana.',
    'Tu próximo paso',
    'en la transformación digital.',
    'Infraestructuras sólidas.',
    'Un futuro resiliente.',
    'Energía para el futuro.',
    'Diseñada para ser sostenible.',
    'Distintas disciplinas.',
    'Una visión compartida.',
  ],
};
const editorial = {
  en: [
    'Cookie Policy',
    'Privacy',
    'Open Positions',
    'Tell us about your needs and goals. Let’s plan the next step together.',
  ],
  ar: [
    'سياسة ملفات تعريف الارتباط',
    'الخصوصية',
    'الوظائف الشاغرة',
    'أخبرنا باحتياجاتك وأهدافك. لنخطط معًا للخطوة التالية.',
  ],
  de: [
    'Cookie-Richtlinie',
    'Datenschutz',
    'Offene Stellen',
    'Erzählen Sie uns von Ihren Anforderungen und Zielen. Gemeinsam planen wir den nächsten Schritt.',
  ],
  fr: [
    'Politique de cookies',
    'Confidentialité',
    'Offres d’emploi',
    'Parlez-nous de vos besoins et de vos objectifs. Construisons ensemble la prochaine étape.',
  ],
  'zh-CN': [
    'Cookie 政策',
    '隐私政策',
    '招聘职位',
    '告诉我们您的需求与目标，让我们共同规划下一步。',
  ],
  ja: [
    'Cookieポリシー',
    'プライバシー',
    '募集職種',
    'ご要望や目標をお聞かせください。次の一歩を一緒に考えましょう。',
  ],
  ru: [
    'Политика cookie',
    'Конфиденциальность',
    'Открытые вакансии',
    'Расскажите о ваших потребностях и целях. Вместе спланируем следующий шаг.',
  ],
  it: [
    'Informativa sui cookie',
    'Privacy',
    'Posizioni aperte',
    'Raccontaci le tue esigenze e i tuoi obiettivi. Progettiamo insieme il prossimo passo.',
  ],
  es: [
    'Política de cookies',
    'Privacidad',
    'Vacantes',
    'Cuéntanos tus necesidades y objetivos. Diseñemos juntos el próximo paso.',
  ],
};
for (const [locale, values] of Object.entries(copy)) {
  const path = `src/i18n/messages/${locale}.json`;
  const dictionary = JSON.parse(await readFile(path, 'utf8'));
  for (const [key, value] of Object.entries(dictionary)) {
    dictionary[key] = value.replace(
      /ZXMARQUEZX|ZXMARCAZX|ZX品牌ZX|中新品牌ZX|ZXBRANDZX/gi,
      'Algebra Teknoloji',
    );
    if (['algebra', 'algebra teknoloji'].includes(key.toLocaleLowerCase('tr')))
      dictionary[key] = key;
    if (/###|ZX[A-Z]+ZX|QX92741/.test(dictionary[key]))
      throw new Error(`Unresolved translation marker: ${locale} ${key}`);
  }
  keys.forEach((key, i) => (dictionary[key] = values[i]));
  if (hero[locale]) heroKeys.forEach((key, i) => (dictionary[key] = hero[locale][i]));
  [
    'Çerez Politikası',
    'Gizlilik ve KVKK',
    'Açık Pozisyonlar',
    'İhtiyacınızı ve hedeflerinizi dinleyelim. Bir sonraki adımı birlikte tasarlayalım.',
  ].forEach((key, i) => (dictionary[key] = editorial[locale][i]));
  // Copyright lines use the registered name verbatim in every language.
  dictionary['© 2026 Algebra Teknoloji'] = '© 2026 Algebra Teknoloji';
  await writeFile(path, JSON.stringify(dictionary, null, 2) + '\n');
}
console.log(
  'Reviewed UI phrases, count placeholders and company name applied in all nine dictionaries.',
);
