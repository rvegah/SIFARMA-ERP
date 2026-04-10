import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: mode === 'production' ? '/sifarma-erp/' : '/',
    server: {
      port: 3000,
      host: true
    },
    preview: {
      port: 4173
    },

    // 🔥 AGREGA ESTO
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            charts: ['recharts'],
            utils: ['html2canvas']
          }
        }
      }
    }
  }
})