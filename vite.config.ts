/// <reference types="vitest/config" />
import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

// Home gradient top colour: splash and theme colour match the Home header.
const THEME = '#feffd6'

export default defineConfig(({ mode }) => {
  // GitHub Pages serves the app under /<repo>/: the workflow sets BASE_PATH. Local builds use '/'.
  const base = process.env.BASE_PATH ?? '/'
  const plugins: PluginOption[] = [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // no update prompt during the demo; new SW applies on next launch
      injectRegister: 'auto',
      includeAssets: ['apple-touch-icon.png', 'icon.svg'],
      manifest: {
        name: 'Mo-Simba',
        short_name: 'Mo-Simba',
        description: 'Mo-Simba Bank payments demo',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        background_color: THEME,
        theme_color: THEME,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,wasm}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ]
  if (mode === 'https') plugins.push(basicSsl())

  return {
    base,
    plugins,
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
    },
    build: {
      rolldownOptions: {
        output: {
          // React + motion + router in their own chunk keeps the app chunk small and cacheable.
          codeSplitting: { groups: [{ name: 'vendor', test: /node_modules[\\/](react|react-dom|scheduler|motion|motion-dom|motion-utils|framer-motion|react-router|zustand)[\\/]/ }] },
        },
      },
    },
    test: {
      include: ['tests/unit/**/*.test.ts'],
      environment: 'node',
    },
  }
})
