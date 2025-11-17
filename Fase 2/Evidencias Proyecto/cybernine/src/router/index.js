// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Importa Firebase Auth

// Definición de las rutas de la aplicación
const routes = [
  {
    path: '/', // Esta es la ruta raíz o de inicio
    name: 'Home',
    redirect: '/login' // Redirige automáticamente a /login
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false } // No requiere autenticación
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: () => import('../views/InventarioView.vue'),
    meta: { requiresAuth: true } // Sí requiere autenticación
  },
  // Agrega aquí más rutas protegidas o no protegidas
  // Ejemplo:
  // {
  //   path: '/perfil',
  //   name: 'Perfil',
  //   component: () => import('../views/ProfileView.vue'),
  //   meta: { requiresAuth: true }
  // },
  {
    path: '/:catchAll(.*)', // Ruta comodín para 404 - siempre al final
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { requiresAuth: false } // Un 404 no requiere autenticación
  }
];

// Crea la instancia del router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- GLOBAL NAVIGATION GUARD ---
// Se ejecuta antes de cada navegación para verificar autenticación

router.beforeEach(async (to, from, next) => {
  const auth = getAuth(); // Obtén la instancia de Firebase Auth

  // Espera a que Firebase Auth se inicialice y determine el estado del usuario
  // Esto es fundamental para evitar redirecciones prematuras
  const isAuthenticated = await new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe(); // Deja de escuchar después de obtener el estado inicial
      resolve(!!user); // Convierte el objeto user (o null) a un booleano (true/false)
    });
  });

  // Lógica de protección de rutas
  if (to.meta.requiresAuth) { // Si la ruta a la que se intenta acceder requiere autenticación
    if (isAuthenticated) {
      next(); // Usuario autenticado, permite el acceso
    } else {
      console.log('Usuario no autenticado. Redirigiendo a la página de login...');
      next({ name: 'Login' }); // Usuario no autenticado, redirige al login
    }
  } else { // Si la ruta NO requiere autenticación (ej. Login, Home, NotFound)
    // Si el usuario ya está autenticado e intenta ir al Login o Home (que redirige a Login)
    if ((to.name === 'Login' || to.name === 'Home') && isAuthenticated) {
      next({ name: 'Inventario' }); // Redirige a Inventario para evitar que vea la página de login de nuevo
    } else {
      next(); // Permite el acceso a la ruta (ya sea Login, Home, NotFound, o cualquier otra pública)
    }
  }
});

// Exporta la instancia del router configurada
export default router;