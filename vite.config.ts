import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), crx(manifest)],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
})
