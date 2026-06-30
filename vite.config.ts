import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/** GitHub Pages base path — override with VITE_BASE_PATH env var */
const base = process.env.VITE_BASE_PATH ?? '/guardia-nocturna-uci/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png', 'assets/tablero.png'],
      manifest: {
        name: 'Guardia Nocturna en UCI',
        short_name: 'Guardia UCI',
        description: 'Juego de mesa digital de Medicina Crítica — hot-seat 2–4 jugadores',
        theme_color: '#070d18',
        background_color: '#070d18',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
