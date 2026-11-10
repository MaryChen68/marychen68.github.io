import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // three.js + three-vrm are large but loaded lazily, only on the home page
  build: { chunkSizeWarningLimit: 900 },
})
