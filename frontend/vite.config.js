import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'The Roomies',
        short_name: 'The Roomies',
        description: 'The Roomies | Room Expenses Management',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  server: {
    open: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: true,
    },
  },
  clearScreen: false,
})
