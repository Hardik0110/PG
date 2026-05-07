import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        // Override via VITE_API_PROXY env var to point at a local backend, e.g.:
        //   VITE_API_PROXY=http://localhost:8000 npm run dev
        // Defaults to the deployed Render instance.
        target: process.env.VITE_API_PROXY || 'https://pg-maintenance.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: true,
  },
})
