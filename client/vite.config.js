import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Custom plugin to duplicate dist to root so Vercel finds it anywhere
function duplicateDistPlugin() {
  return {
    name: 'duplicate-dist',
    closeBundle() {
      try {
        const clientDist = path.resolve(__dirname, 'dist')
        const rootDist = path.resolve(__dirname, '../dist')
        if (fs.existsSync(clientDist)) {
          fs.cpSync(clientDist, rootDist, { recursive: true })
          console.log('✓ Successfully mirrored dist to root ../dist')
        }
      } catch (err) {
        console.error('Failed to mirror dist:', err)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    duplicateDistPlugin(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
