export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shahibulawa.com').replace(/\/+$/, '');

export const BRAND = {
  name: 'Shahi Bulawa',
  legalName: 'Shahi Bulawa Wedding Cards',
  description:
    'Premium wedding cards crafted in Karachi. Nikkah, Valima, Mehndi & Baraat invitations with transparent pricing from PKR 120/card.',
  foundingYear: 2026,
} as const;

export const NAP = {
  street: 'Abid Town, Gulshan-e-Iqbal',
  city: 'Karachi',
  region: 'Sindh',
  country: 'PK',
  postalCode: '',   // fill in after GBP verification (Phase 19)
  geo: { lat: 0, lng: 0 }, // fill in after GBP verification (Phase 19)
  phone: '+923078656300',
  phoneDisplay: '+92 307 8656300',
  hoursOpen: '10:00',
  hoursClose: '22:00',
} as const;

export const SOCIAL = {
  instagram: 'https://www.instagram.com/shahi_bulawa',
  facebook: 'https://www.facebook.com/share/1DA3WXbR65/',
} as const;

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? '';
export const BING_VERIFICATION = process.env.NEXT_PUBLIC_BING_VERIFICATION ?? '';

/** Resolve a path to an absolute URL using SITE_URL. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}/${path.replace(/^\//, '')}`;
}
