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
      { src: '/images/logo.png', sizes: '1200x1200', type: 'image/png', purpose: 'any' },
      { src: '/images/logo.png', sizes: '1200x1200', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
