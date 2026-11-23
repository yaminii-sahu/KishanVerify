import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const backendTarget = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/health': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
