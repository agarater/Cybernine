// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // <-- Importante: importa el módulo 'path' de Node.js

// Referencia de uso: Configuración principal de Vite.js. Para más detalles, consultar la documentación oficial de Vite: https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Referencia de uso: Configuración de alias de rutas. El alias '@' se resuelve a la carpeta '/src', facilitando las importaciones de módulos y componentes de forma absoluta, mejorando la legibilidad y el mantenimiento del código.
      // Ejemplo de uso: import MiComponente from '@/components/MiComponente.vue' en lugar de import MiComponente from '../../components/MiComponente.vue'.
      '@': path.resolve(__dirname, 'src'),
    }
  }
})
/*
Sugerencia de Uso (Consideración Adicional):
Para proyectos de producción, se recomienda evaluar la configuración de 'build' en 'vite.config.js'.
Esto puede incluir:
- 'outDir': Especificar la carpeta de salida para los archivos compilados (por defecto 'dist').
- 'assetsDir': Subdirectorio para los activos generados (imágenes, fuentes, etc.).
- 'sourcemap': Generar sourcemaps para facilitar la depuración en producción (con precaución para no exponer código).
- 'minify': Activar la minificación para reducir el tamaño de los bundles.

Ejemplo de configuración 'build':
export default defineConfig({
  plugins: [vue()],
  resolve: { /* ... * / },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Cambiar a 'true' para depuración si es necesario
    minify: 'terser', // 'esbuild' o 'terser'
  }
});

Esta optimización es clave para mejorar los tiempos de carga y el rendimiento general de la PWA en un entorno de producción.
*/