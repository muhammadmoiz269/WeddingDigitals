import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — Premium Wedding Cards in Karachi`,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFFDF7',
    theme_color: '#FFFDF7',
    orientation: 'portrait',
    lang: 'en-PK',
    dir: 'ltr',
    categories: ['shopping', 'lifestyle'],
    icons: [
      // Standard sizes iOS and Android expect for home-screen installation.
      // Using the same source image for both; swap for true 192/512 PNGs later
      // if the logo crops oddly (non-square source → blurry icon, not broken push).
      { src: '/images/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/images/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/images/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
