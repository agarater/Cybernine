// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';

// Importa tu nuevo componente de layout
import AppLayout from '../layouts/AppLayout.vue'; 
// Las vistas hijas no necesitan importarse aquí si se cargan de forma perezosa.

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
    path: '/app', // Ruta base para todo lo que usará el AppLayout
    component: AppLayout, // Carga el componente de layout
    meta: { requiresAuth: true }, // Todas las rutas dentro de este grupo requieren autenticación
    children: [ // Rutas hijas que se renderizarán dentro del <router-view /> de AppLayout
      {
        path: 'inventario', // La URL completa será /app/inventario
        name: 'Inventario',
        component: () => import('../views/InventarioView.vue'), // Carga perezosa
      },
      {
        path: 'sramaria', // La URL completa será /app/sramaria
        name: 'SraMaria', // Cambiado a 'SraMaria' (PascalCase por convención para nombres de rutas con Layout)
        component: () => import('../views/SraMariaView.vue'), // Carga perezosa
      },
      {
        path: 'movimientos', // La URL completa será /app/movimientos
        name: 'Movimientos',
        component: () => import('../views/MovimientosView.vue'), // Carga perezosa
      },
      {
        path: 'informe', // La URL completa será /app/informe
        name: 'Informe',
        component: () => import('../views/InformeView.vue'), // Carga perezosa
      },
      {
        path: 'configuracion', // La URL completa será /app/configuracion
        name: 'Configuracion',
        component: () => import('../views/ConfiguracionView.vue'), // Carga perezosa
      },
      // Puedes añadir más rutas aquí que compartan el mismo layout
    ]
  },
  {
    path: '/:catchAll(.*)', // Ruta comodín para 404 - siempre al final y fuera del grupo /app
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { requiresAuth: false } // Un 404 no requiere autenticación
  }
];

// Crea la instancia del router
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// --- GLOBAL NAVIGATION GUARD ---
// Se ejecuta antes de cada navegación para verificar autenticación

router.beforeEach(async (to, from, next) => {

  // Espera a que Firebase Auth se inicialice...
  const isAuthenticated = await new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe(); // Deja de escuchar después de obtener el estado inicial
      resolve(!!user); // Convierte el objeto user (o null) a un booleano (true/false)
    });
  });

  // Lógica de protección de rutas
  if (to.meta.requiresAuth) { // Si la ruta a la que se intenta acceder requiere autenticación (es decir, '/app' y sus hijos)
    if (isAuthenticated) {
      next(); // Usuario autenticado, permite el acceso
    } else {
      console.log('Usuario no autenticado. Redirigiendo a la página de login...');
      next({ name: 'Login' }); // Usuario no autenticado, redirige al login
    }
  } else { // Si la ruta NO requiere autenticación (ej. Login, Home, NotFound)
    // Si el usuario ya está autenticado e intenta ir al Login o Home (que redirige a Login)
    if ((to.name === 'Login' || to.name === 'Home') && isAuthenticated) {
      // Redirige al inventario bajo el nuevo path '/app/inventario'
      next({ path: '/app/inventario' }); 
    } else {
      next(); // Permite el acceso a la ruta (ya sea Login, Home, NotFound, o cualquier otra pública)
    }
  }
});

// Exporta la instancia del router configurada
export default router;