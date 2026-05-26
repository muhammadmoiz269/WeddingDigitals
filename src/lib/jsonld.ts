import { BRAND, NAP, SITE_URL, SOCIAL } from '@/lib/site';

export function organizationLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND.name,
    alternateName: BRAND.legalName,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/logo.ico.png`,
      width: 512,
      height: 512,
    },
    foundingDate: String(BRAND.foundingYear),
    sameAs: [SOCIAL.instagram],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: NAP.phone,
      contactType: 'customer service',
      areaServed: 'PK',
      availableLanguage: ['English', 'Urdu'],
    },
  };
}

export function localBusinessLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: BRAND.name,
    image: `${SITE_URL}/images/logo.ico.png`,
    url: SITE_URL,
    telephone: NAP.phone,
    priceRange: 'PKR 120–500',
    address: {
      '@type': 'PostalAddress',
      streetAddress: NAP.street,
      addressLocality: NAP.city,
      addressRegion: NAP.region,
      addressCountry: NAP.country,
      ...(NAP.postalCode ? { postalCode: NAP.postalCode } : {}),
    },
    ...(NAP.geo.lat !== 0
      ? { geo: { '@type': 'GeoCoordinates', latitude: NAP.geo.lat, longitude: NAP.geo.lng } }
      : {}),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday',
          'Friday', 'Saturday', 'Sunday',
        ],
        opens: NAP.hoursOpen,
        closes: NAP.hoursClose,
      },
    ],
    sameAs: [SOCIAL.instagram],
  };
}

export function websiteLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BRAND.name,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageLd(
  faqs: { question: string; answer: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
