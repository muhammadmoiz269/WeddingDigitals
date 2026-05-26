import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.legalName,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFDF7',
    theme_color: '#FFFDF7',
    orientation: 'portrait',
    lang: 'en-PK',
    dir: 'ltr',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/images/logo.jpeg', sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
      { src: '/images/logo.jpeg', sizes: '512x512', type: 'image/jpeg', purpose: 'maskable' },
      { src: '/images/logo.jpeg', sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
    ],
  };
}
