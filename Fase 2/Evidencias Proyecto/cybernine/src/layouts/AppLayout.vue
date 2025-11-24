<template>
  <div class="app-layout-container">
    <TopNavBar /> 
    <main class="app-main-content">
      <router-view />
    </main>

    <nav class="bottom-nav">
      <router-link to="/app/inventario" class="nav-item">
        <img src="/icons/catalog-icon.png" alt="Inventario" /> 
        <span>Inventario</span>
      </router-link>

      <router-link to="/app/movimientos" class="nav-item">
        <img src="/icons/movements-icon.png" alt="Movimientos" />
        <span>Movimientos</span>
      </router-link>

      <router-link to="/app/sramaria" class="nav-item">
        <img src="/icons/ai-icon.png" alt="Sra. MarIA" />
        <span>Sra. MarIA</span>
      </router-link>
      
      <router-link to="/app/configuracion" class="nav-item">
        <img src="/icons/config-icon.png" alt="Configuración" />
        <span>Configuración</span>
      </router-link>

    </nav>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import TopNavBar from '@/components/TopNavBar.vue';

// --- Lógica para agregar/quitar la clase del body ---
onMounted(() => {
  document.body.classList.add('body-no-flex');
});

onUnmounted(() => {
  document.body.classList.remove('body-no-flex');
});
</script>

<style scoped>
.app-layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Asegura que el layout ocupe toda la altura */
  box-sizing: border-box;
  /* El fondo de este contenedor lo manejarán las vistas hijas o el app-main-content si quieres un fondo genérico */
}

/* ESTILO CLAVE: Contenido principal con padding para ambas barras */
.app-main-content {
  flex-grow: 1; /* Permite que el contenido ocupe el espacio disponible */
  padding-top: 55px; /* Espacio para la TopNavBar (ajusta si cambias la altura) */
  padding-bottom: 65px; /* Espacio para la BottomNavBar (ajusta si cambias la altura) */
  box-sizing: border-box;
  width: 100%;
  /* Aquí puedes poner un background-color general para tus vistas, si no lo tienen individualmente */
  /* background-color: var(--background-app-light); */
}

/* --- ESTILOS DEL MENÚ DE NAVEGACIÓN INFERIOR (BOTTOM-NAV) --- */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed; /* Esto la mantiene fija en la parte inferior */
  bottom: 0;
  left: 0;
  width: 100%;
  height: 65px; /* Altura fija de la barra */
  background-color: var(--card-bg-light, #ffffff) !important; /* Fondo blanco */
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Asegura que esté encima del contenido pero debajo de la TopNavBar */
  padding-bottom: env(safe-area-inset-bottom); /* Para iOS notches */
  box-sizing: border-box;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #757575; /* Color gris para los ítem no activos */
  font-size: 0.7rem; 
  font-weight: 500;
  transition: color 0.3s ease;
  padding: 0.25rem;
  flex: 1; 
  text-align: center;
}

.nav-item img {
  width: 1.5rem; 
  height: 1.5rem;
  margin-bottom: 0.25rem;
  filter: grayscale(100%); /* Íconos en gris por defecto */
  transition: filter 0.3s ease;
}

/* Estilos para el link activo y al pasar el mouse */
.nav-item.router-link-active, 
.nav-item:hover {
  color: var(--primary-color, #3f51b5); /* Color primario cuando está activo o hover */
}

.nav-item.router-link-active img,
.nav-item:hover img {
  filter: none; /* Elimina el gris para el ícono activo o en hover */
}

/* Media Queries para pantallas más grandes (Tabletas y Desktop) */
@media (min-width: 768px) {
  .nav-item {
    font-size: 0.85rem; 
  }
  .nav-item img {
    width: 1.8rem;
    height: 1.8rem;
  }
}
</style>