export const companyContact = {
  address: 'Oğuzlar, 1364. Sk. No: 4/5, 06520 Çankaya/Ankara',
  streetAddress: 'Oğuzlar, 1364. Sk. No: 4/5',
  district: 'Çankaya',
  city: 'Ankara',
  postalCode: '06520',
  country: 'TR',
  phone: '(0312) 280 61 61',
  telephone: '+903122806161',
  email: 'info@algebrateknoloji.com',
  mapUrl:
    'https://www.google.com/maps/place//data=!4m2!3m1!1s0x14d34ffdd470f7e7:0x3d101071d01bb834',
} as const;

export const contactContent = {
  eyebrow: 'BİRLİKTE, DAHA İLERİYE',
  title: ['Geleceği', 'konuşalım.'],
  description: 'İhtiyacınızı ve hedeflerinizi dinleyelim. Bir sonraki adımı birlikte tasarlayalım.',
  channels: [
    {
      icon: 'pin',
      label: 'Adres',
      value: companyContact.address,
      pending: 'Adres bilgisi henüz paylaşılmadı.',
      href: companyContact.mapUrl,
    },
    {
      icon: 'phone',
      label: 'Telefon',
      value: companyContact.phone,
      pending: 'Telefon bilgisi henüz paylaşılmadı.',
      href: `tel:${companyContact.telephone}`,
    },
    {
      icon: 'mail',
      label: 'E-posta',
      value: companyContact.email,
      pending: 'E-posta bilgisi henüz paylaşılmadı.',
      href: `mailto:${companyContact.email}`,
    },
  ] as {
    icon: string;
    label: string;
    value: string | null;
    pending: string;
    href: string | null;
  }[],
  actions: [
    { label: 'Teklif Talebi', href: '/iletisim/teklif-talebi/', primary: true },
    { label: 'İş Birliği', href: '/iletisim/is-birligi/', primary: false },
  ],
};
