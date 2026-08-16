import path from 'node:path'
import { fileURLToPath } from 'node:url'
import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './app'),
    },
  },
  ssr: {
    external: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
  },
  plugins: [
    honox({
      devServer: { adapter },
      client: { input: ['/app/client.ts', '/app/style.css'] },
    }),
    tailwindcss(),
    build(),
  ],
})
