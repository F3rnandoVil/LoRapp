import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  // This server config enables HTTPS, which is required for Web Bluetooth.
  server: {
    https: true
  },
  plugins: [
    react(),
    mkcert()
  ],
})
