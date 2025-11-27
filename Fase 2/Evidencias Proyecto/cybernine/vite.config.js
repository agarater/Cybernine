// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// --- 1. IMPORTAR EL PLUGIN PWA ---
import { VitePWA } from 'vite-plugin-pwa'

// Referencia de uso: Configuración principal de Vite.js. https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // --- 2. CONFIGURACIÓN DEL PLUGIN PWA ---
    VitePWA({
      // 'autoUpdate' hace que la app busque nuevas versiones automáticamente
      // y se actualice en segundo plano. Es lo más sencillo para empezar.
      registerType: 'autoUpdate',

      // Archivos estáticos adicionales que quieres que se guarden en caché
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],

      // EL MANIFIESTO: Es el DNI de tu aplicación.
      // Define cómo se llama, cómo se ve y qué iconos usa.
      manifest: {
        name: 'Cybernine Inventario', // Nombre completo de la app
        short_name: 'Cybernine', // Nombre corto (aparece bajo el icono en el celular)
        description: 'Gestión de inventario inteligente y eficiente.',
        theme_color: '#3f51b5', // Color de la barra de estado del celular (tu color primario)
        background_color: '#1a1a2e', // Color de fondo de la pantalla de carga (tu fondo oscuro)
        display: 'standalone', // MODO APP NATIVA: Oculta la barra del navegador
        orientation: 'portrait', // Opcional: sugiere mantener la app en modo vertical

        // DEFINICIÓN DE ICONOS (Deben coincidir con los archivos que pusiste en /public)
        icons: [
          {
            src: '/img/PWA/C9_192x192.png', // Ruta relativa desde la carpeta 'public'
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/img/PWA/C9_512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          // Icono "maskable": Permite a Android recortar el icono (círculo, cuadrado redondeado)
          // para que coincida con el tema del teléfono del usuario.
          {
            src: '/img/PWA/C9_512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },

      // Configuración de Workbox (el motor de caché offline)
      workbox: {
        // Tipos de archivos a guardar en caché
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        // Aumentamos el límite de tamaño de archivo para caché a 5MB para evitar advertencias
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },

      // Opciones para desarrollo: Permite probar la PWA en localhost
      devOptions: {
        enabled: true,
        // A veces es necesario para que el service worker cargue bien en dev
        type: 'module',
      }
    })
    // ---------------------------------------
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
  }
})