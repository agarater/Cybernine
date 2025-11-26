<template>
  <div class="inventario-container configuracion-view">
    
    <h2 class="page-title">Configuración</h2>

    <div class="settings-card">
      
      <template v-for="(item, index) in menuItems" :key="index">
        
        <div 
          class="settings-item"
          :class="{ 'is-open': item.isOpen }"
          @click="handleItemClick(item)"
        >
          <transition name="fade">
            <div v-if="item.showToast" class="toast-message">
              Disponible próximamente
            </div>
          </transition>

          <div class="item-left">
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-title">{{ item.title }}</span>
          </div>
          <span class="item-chevron" :class="{ 'rotate': item.isOpen }">›</span>
        </div>

        <transition name="slide-fade">
          <div v-if="item.isAbout && item.isOpen" class="about-expanded-content">
            <p><strong>Sistema de Gestión de Inventario Cybernine_C9</strong></p>
            <p>Desarrollado por Ariel Gárate.</p>
            <p>Proyecto para la asignatura Capstone.</p>
            <p class="small-text">DuocUC 2025 - Desarrollo con motivos educacionales.</p>
          </div>
        </transition>

      </template>

    </div>

    <div class="logout-section">
      <button class="logout-button" @click="handleLogout" :disabled="isLoggingOut">
        {{ isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión' }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';

const router = useRouter();
const isLoggingOut = ref(false);

// Definición de las opciones del menú con nuevas propiedades de estado.
const menuItems = ref([
  // showToast: controla la visibilidad del mensaje flotante
  { title: 'Editar Perfil', icon: '👤', showToast: false },
  { title: 'Notificaciones', icon: '🔔', showToast: false },
  { title: 'Seguridad', icon: '🔒', showToast: false },
  { title: 'Apariencia', icon: '🎨', showToast: false },
  { title: 'Ayuda y Soporte', icon: '❓', showToast: false },
  // isAbout: marca este ítem como especial
  // isOpen: controla si el acordeón está desplegado
  { title: 'Acerca de', icon: 'ℹ️', isAbout: true, isOpen: false },
]);

// Manejador de clics inteligente
const handleItemClick = (item) => {
  if (item.isAbout) {
    // CASO 1: Es el menú "Acerca de" -> Alternar abrir/cerrar
    item.isOpen = !item.isOpen;
  } else {
    // CASO 2: Es cualquier otro menú -> Mostrar mensaje flotante
    
    // Si ya se está mostrando, no hacemos nada para evitar parpadeos
    if (item.showToast) return;

    item.showToast = true;
    // Ocultar el mensaje automáticamente después de 2 segundos
    setTimeout(() => {
      item.showToast = false;
    }, 2000);
  }
};

// Lógica de cierre de sesión (sin cambios)
const handleLogout = async () => {
  isLoggingOut.value = true;
  try {
    await signOut(auth);
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
  display: flex;
  flex-direction: column;
  align-items: center; 
}

.page-title {
  color: #000000;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  margin-top: 0;
}

/* --- Tarjeta del Menú --- */
.settings-card {
  background-color: #ffffff; 
  border-radius: 12px;
  overflow: hidden; 
  width: 90%;
  max-width: 600px; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* --- Elemento individual del menú --- */
.settings-item {
  position: relative; /* Necesario para posicionar el mensaje flotante */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.2rem;
  background-color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0; 
  color: var(--text-dark);
}

.settings-item:hover, .settings-item:active {
  background-color: #f9f9f9;
}
/* Estilo para cuando el acordeón está abierto */
.settings-item.is-open {
  background-color: #f0f0f0; /* Un gris muy sutil para indicar que está activo */
  border-bottom: none; /* Quitamos el borde para que se una con el contenido */
}

.item-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-icon {
  font-size: 1.4rem;
  display: flex;
  align-items: center;
}

.item-title {
  font-size: 1rem;
  font-weight: 500;
}

.item-chevron {
  font-size: 1.5rem;
  color: #ccc; 
  font-weight: 300;
  line-height: 1;
  transition: transform 0.3s ease; /* Animación suave para la rotación */
}
/* Clase para rotar el chevron 90 grados */
.item-chevron.rotate {
  transform: rotate(90deg);
}


/* --- ESTILOS NUEVOS: MENSAJE FLOTANTE (TOAST) --- */
.toast-message {
  position: absolute;
  bottom: 80%; /* Lo coloca justo encima del elemento */
  left: 50%;
  transform: translateX(-50%); /* Centrado horizontal */
  background-color: rgba(50, 50, 50, 0.9); /* Fondo oscuro semi-transparente */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  white-space: nowrap; /* Evita que el texto se rompa en varias líneas */
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 10; /* Asegura que quede por encima de otros elementos */
  pointer-events: none; /* El clic pasa a través del mensaje */
}

/* Animaciones de entrada/salida para el toast */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px); /* Un pequeño desplazamiento hacia abajo al entrar/salir */
}


/* --- ESTILOS NUEVOS: CONTENIDO EXPANDIDO "ACERCA DE" --- */
.about-expanded-content {
  background-color: #f9f9f9; /* Un gris muy claro para diferenciarlo */
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  color: #0076b1;
  font-size: 0.95rem;
}

.about-expanded-content p {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.about-expanded-content .small-text {
  font-size: 0.85rem;
  color: #888;
  margin-top: 1rem;
}

/* Animaciones para el acordeón */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}


/* --- Sección de Cerrar Sesión (Sin cambios) --- */
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
  background-color: var(--error-color); 
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(244, 67, 54, 0.2);
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.logout-button:hover:not(:disabled) {
  background-color: #d32f2f; 
}

.logout-button:active:not(:disabled) {
  transform: scale(0.98); 
}

.logout-button:disabled {
  background-color: #e57373; 
  cursor: not-allowed;
}
</style>