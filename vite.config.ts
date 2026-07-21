import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/s-alloys/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/icon-64.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/frames/*.png',
        'data/cases.json',
      ],
      manifest: {
        name: 'Alloys',
        short_name: 'Alloys',
        description: 'Alloys player guide and test checklist for Minecraft 26.2.',
        theme_color: '#0d0d0d',
        background_color: '#0d0d0d',
        display: 'standalone',
        start_url: '/s-alloys/checklist',
        icons: [
          { src: 'icons/icon-64.png', sizes: '64x64', type: 'image/png' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,gif,json,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
});
