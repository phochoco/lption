import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LPtion - 빛공해 측정 플랫폼',
    short_name: 'LPtion',
    description: '스마트폰으로 빛공해를 측정·기록·비교·리포트하는 플랫폼',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#ffffff',
    orientation: 'portrait',
    categories: ['utilities', 'environment'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
