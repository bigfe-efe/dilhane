import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Capacitor ve file:// açılışı için göreli yollar şart
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Dilhane — 日本語',
        short_name: 'Dilhane',
        description: 'Kişisel Japonca çalışma uygulaması',
        theme_color: '#0a0b0e',
        background_color: '#0a0b0e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        // Ses dosyaları büyük olabilir; hepsini önbelleğe al ki offline çalışsın
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3,json}'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
      },
    }),
  ],
})
