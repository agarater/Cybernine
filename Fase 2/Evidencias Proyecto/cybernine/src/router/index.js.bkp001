// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue'; // Importa tu vista de Login
import InventarioView from '../views/InventarioView.vue'; // <-- 1. Importa la nueva vista

// Aquí defines todas las rutas de tu aplicación
const routes = [
  // --- AÑADE ESTE BLOQUE ---
  {
    path: '/', // Esta es la ruta raíz o de inicio
    name: 'Home',
    redirect: '/login' // Redirige automáticamente a /login
  },
  // -----------------------
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  { // <-- 2. Agrega este nuevo objeto para la ruta de inventario
    path: '/inventario',
    name: 'Inventario',
    component: InventarioView // Ejemplo de otra ruta
  }
];

// Crea la instancia del router
const router = createRouter({
  history: createWebHistory(),
  routes, // es lo mismo que routes: routes
});

export default router;