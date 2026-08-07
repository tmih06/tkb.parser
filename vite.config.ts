

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/tkb.parser/',
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: 'Tạo thời khoá biểu DUT',
        short_name: 'tkb.parser',
        description: 'Tạo thời khoá biểu',
        theme_color: '#ffffff',
        display: "standalone",
        icons: [
          { src: "android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  build: {
    minify: false,  // Disabled for debugging
    sourcemap: true, // Enable source maps for better debugging
    rollupOptions: {
      output: {
        manualChunks: undefined // Disable chunk splitting for simpler debugging
      }
    }
  }
})
