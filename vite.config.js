import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración dinámica: funciona en local y en producción
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
    }
  }
})
