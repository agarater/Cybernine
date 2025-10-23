// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';

// --- CAMBIO (Code Splitting) ---
// Ya no importamos las vistas aquí arriba.
// Al eliminarlas, evitamos que se agrupen en un solo archivo gigante.
//
// import LoginView from '../views/LoginView.vue'; // Importa tu vista de Login (Eliminada para carga diferida)
// import InventarioView from '../views/InventarioView.vue'; // <-- 1. Importa la nueva vista (Eliminada para carga diferida)
// ---------------------------------


// Aquí defines todas las rutas de tu aplicación
const routes = [
  // --- AÑADE ESTE BLOQUE --- (Este comentario se queda como estaba)
  {
    path: '/', // Esta es la ruta raíz o de inicio
    name: 'Home',
    redirect: '/login' // Redirige automáticamente a /login
  },
  // -----------------------
  {
    path: '/login',
    name: 'Login',
    
    // --- CAMBIO (Code Splitting) ---
    // En lugar de: component: LoginView
    // Usamos esta función (importación dinámica).
    // Esto le dice a Vite que cree un "chunk" separado para el Login.
    component: () => import('../views/LoginView.vue')
  },
  { // <-- 2. Agrega este nuevo objeto para la ruta de inventario (Este comentario se queda)
    path: '/inventario',
    name: 'Inventario',
    
    // --- CAMBIO (Code Splitting) ---
    // En lugar de: component: InventarioView
    // Hacemos lo mismo para la vista de inventario.
    // Esto resuelve la advertencia del "chunk" de 500kb,
    // ya que el código de Inventario solo se descargará
    // cuando el usuario realmente lo necesite (después de iniciar sesión).
    component: () => import('../views/InventarioView.vue')
  }
];

// Crea la instancia del router
const router = createRouter({
  history: createWebHistory(),
  routes, // es lo mismo que routes: routes
});

export default router;