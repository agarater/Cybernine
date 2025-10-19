// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue'; // Importa tu vista de Login

// Aquí defines todas las rutas de tu aplicación
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  // Agregaremos más rutas aquí después, como la del inventario
  // {
  //   path: '/inventario',
  //   name: 'Inventario',
  //   component: () => import('../views/InventarioView.vue') // Ejemplo de otra ruta
  // }
];

// Crea la instancia del router
const router = createRouter({
  history: createWebHistory(),
  routes, // es lo mismo que routes: routes
});

export default router;