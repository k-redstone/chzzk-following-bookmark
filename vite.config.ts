import { crx } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import zip from 'vite-plugin-zip-pack'

import manifest from './public/manifest.config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx(manifest),
    zip({ outDir: 'release', outFileName: 'release.zip' }),
  ],

  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: '@content', replacement: '/src/content' },
      { find: '@utils', replacement: '/src/utils' },
      { find: '@constants', replacement: '/src/constants' },
    ],
  },
  server: {
    cors: {
      origin: '*',
    },
  },
})
