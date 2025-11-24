<template>
  <nav class="top-nav-bar">
    <div class="status-indicator" :class="{ 'is-online': isOnline }">
      <span class="dot"></span>
      <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
    </div>

    <div class="user-info" v-if="userEmail">
      <span class="user-email">{{ userEmail }}</span>
      <button @click="logout" class="logout-button">Cerrar Sesión</button>
    </div>
    <div v-else class="user-info">
      <span>Invitado</span>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/firebase/config'; // Asegúrate de que esta ruta es correcta
import { signOut, onAuthStateChanged } from 'firebase/auth';

const router = useRouter();
const userEmail = ref(null);
const isOnline = ref(navigator.onLine); // Estado inicial de la conexión

// --- Lógica de Autenticación (Firebase) ---
let unsubscribeAuth; // Para desuscribirse del listener de Firebase Auth

onMounted(() => {
  // Escucha cambios en el estado de autenticación
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmail.value = user.email;
    } else {
      userEmail.value = null;
    }
  });

  // Escucha cambios en el estado de conexión del navegador
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  // Limpia los listeners cuando el componente se destruye
  if (unsubscribeAuth) {
    unsubscribeAuth();
  }
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

const logout = async () => {
  try {
    await signOut(auth);
    // Redirigir al login después de cerrar sesión
    router.push({ name: 'Login' });
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    alert("Error al cerrar sesión. Intenta de nuevo.");
  }
};
</script>

<style scoped>
.top-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background-color: var(--primary-color, #3f51b5); /* Fondo azul primario */
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: fixed; /* Fija la barra en la parte superior */
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1010; /* Mayor que la barra inferior para asegurar que esté encima */
  box-sizing: border-box;
}

.status-indicator {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-indicator .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #f44336; /* Rojo para offline */
  margin-right: 5px;
  transition: background-color 0.3s ease;
}

.status-indicator.is-online .dot {
  background-color: #4CAF50; /* Verde para online */
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-email {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap; /* Evita que el correo se rompa en varias líneas */
  overflow: hidden;
  text-overflow: ellipsis; /* Añade puntos suspensivos si el correo es muy largo */
  max-width: 150px; /* Limita el ancho para evitar desbordamiento en móviles */
}

.logout-button {
  background-color: rgba(255, 255, 255, 0.2); /* Fondo semitransparente para armonía */
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 0.4rem 0.7rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: white;
}

/* Media Queries para pantallas más grandes */
@media (min-width: 768px) {
  .top-nav-bar {
    padding: 1rem 1.5rem;
  }
  .user-email {
    max-width: none; /* Elimina la restricción de ancho en pantallas más grandes */
    font-size: 1rem;
  }
  .logout-button {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
}
</style>