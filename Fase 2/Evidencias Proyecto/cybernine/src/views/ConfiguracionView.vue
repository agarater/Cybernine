<template>
  <div class="inventario-container configuracion-view">
    
    <h2 class="page-title">Configuración</h2>

    <div class="settings-card">
      
      <div 
        v-for="(item, index) in menuItems" 
        :key="index" 
        class="settings-item"
        @click="handleItemClick(item)"
      >
        <div class="item-left">
          <span class="item-icon">{{ item.icon }}</span>
          <span class="item-title">{{ item.title }}</span>
        </div>
        <span class="item-chevron">›</span>
      </div>

    </div>

    <div class="logout-section">
      <button class="logout-button" @click="handleLogout" :disabled="isLoggingOut">
        {{ isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión' }}
      </button>
    </div>

    <nav class="bottom-nav">
      <router-link to="/app/inventario" class="nav-item">
        <img src="/icons/catalog-icon.png" alt="Catálogo" /> <span>Catálogo</span>
      </router-link>
      <router-link to="/app/movimientos" class="nav-item">
        <img src="/icons/movements-icon.png" alt="Movimientos" />
        <span>Movimientos</span>
      </router-link>
      <router-link to="/app/sramaria" class="nav-item">
        <img src="/icons/ai-icon.png" alt="Sra. MarIA" />
        <span>Sra. MarIA</span>
      </router-link>
      <router-link to="/app/configuracion" class="nav-item router-link-active">
        <img src="/icons/config-icon.png" alt="Configuración" />
        <span>Configuración</span>
      </router-link>
    </nav>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';

const router = useRouter();
const isLoggingOut = ref(false);

// Definición de las opciones del menú.
// Puedes agregar rutas reales en 'route' cuando las crees.
const menuItems = ref([
  { title: 'Editar Perfil', icon: '👤', route: '/app/perfil-placeholder' },
  { title: 'Notificaciones', icon: '🔔', route: '/app/notificaciones-placeholder' },
  { title: 'Seguridad', icon: '🔒', route: '/app/seguridad-placeholder' },
  { title: 'Apariencia', icon: '🎨', route: '/app/apariencia-placeholder' },
  { title: 'Ayuda y Soporte', icon: '❓', route: '/app/ayuda-placeholder' },
  { title: 'Acerca de', icon: 'ℹ️', route: '/app/about-placeholder' },
]);

// Manejador de clics en los elementos del menú
const handleItemClick = (item) => {
  if (item.route) {
    // Por ahora mostramos una alerta, luego descomenta la línea siguiente:
    alert(`Navegando a: ${item.title}\n(Ruta pendiente: ${item.route})`);
    // router.push(item.route);
  }
};

// Lógica de cierre de sesión
const handleLogout = async () => {
  isLoggingOut.value = true;
  try {
    await signOut(auth);
    // Redirigir al login después de cerrar sesión correctamente
    router.push('/login');
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    alert("Hubo un problema al cerrar la sesión.");
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<style scoped>
/* Hereda los estilos base de .inventario-container (fondo oscuro) */

.configuracion-view {
  padding-top: 2rem;
  /* Centramos el contenido horizontalmente */
  display: flex;
  flex-direction: column;
  align-items: center; 
}

.page-title {
  color: #ffffff;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  margin-top: 0;
}

/* --- Tarjeta del Menú --- */
.settings-card {
  background-color: #ffffff; /* Fondo blanco como las tarjetas de producto */
  border-radius: 12px;
  overflow: hidden; /* Para que los hijos respeten el borde redondeado */
  width: 90%;
  max-width: 600px; /* Un ancho máximo razonable para tablets/PC */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* --- Elemento individual del menú --- */
.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.2rem;
  background-color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0; /* Separador sutil */
  color: var(--text-dark);
}

/* Efecto hover para desktop y feedback táctil en móvil */
.settings-item:hover, .settings-item:active {
  background-color: #f9f9f9;
}

/* Quitamos el borde inferior del último elemento */
.settings-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-icon {
  font-size: 1.4rem;
  /* Si usas imágenes PNG en vez de emojis, ajusta aquí:
     width: 24px; height: 24px; object-fit: contain;
  */
  display: flex;
  align-items: center;
}

.item-title {
  font-size: 1rem;
  font-weight: 500;
}

.item-chevron {
  font-size: 1.5rem;
  color: #ccc; /* Color gris claro para el chevron */
  font-weight: 300;
  line-height: 1;
}

/* --- Sección de Cerrar Sesión --- */
.logout-section {
  margin-top: 2rem;
  width: 90%;
  max-width: 600px;
}

.logout-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: bold;
  /* Usamos el color de error (rojo) para acciones destructivas */
  background-color: var(--error-color); 
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(244, 67, 54, 0.2);
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.logout-button:hover:not(:disabled) {
  background-color: #d32f2f; /* Un rojo un poco más oscuro al pasar el mouse */
}

.logout-button:active:not(:disabled) {
  transform: scale(0.98); /* Pequeño efecto de presión */
}

.logout-button:disabled {
  background-color: #e57373; /* Rojo claro deshabilitado */
  cursor: not-allowed;
}

/* --- BARRA INFERIOR (Reutilizada) --- */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 65px;
  background-color: #ffffff !important; 
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}
.nav-item { display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #757575; font-size: 0.7rem; font-weight: 500; transition: color 0.3s ease; padding: 0.25rem; flex: 1; text-align: center; }
.nav-item img { width: 1.5rem; height: 1.5rem; margin-bottom: 0.25rem; filter: grayscale(100%); transition: filter 0.3s ease; }
.nav-item.router-link-active, .nav-item:hover { color: var(--primary-color); }
.nav-item.router-link-active img, .nav-item:hover img { filter: none; }

@media (min-width: 768px) {
    .nav-item { font-size: 0.85rem; }
    .nav-item img { width: 1.8rem; height: 1.8rem; }
}
</style>