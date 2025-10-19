// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // <-- Importante: importa el módulo 'path' de Node.js

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Aquí está la magia: le decimos a Vite que '@' es un alias para la carpeta '/src'
      '@': path.resolve(__dirname, 'src'),
    }
  }
})