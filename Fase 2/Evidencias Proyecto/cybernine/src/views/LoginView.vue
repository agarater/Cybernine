<template>
  <div>
    <h2>Acceso de Usuario</h2>
    <form @submit.prevent>
      <input type="email" placeholder="Correo electrónico" v-model="email">
      <input type="password" placeholder="Contraseña" v-model="password">
      <br>
      <button @click="registrarUsuario">Registrar</button>
      <button @click="iniciarSesion">Iniciar Sesión</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// ¡Importamos nuestra herramienta de autenticación desde el archivo de config!
import { auth } from '@/firebase/config'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { useRouter } from 'vue-router'; // Para redirigir al usuario

// Variables para guardar lo que el usuario escribe en los inputs
const email = ref('');
const password = ref('');
const router = useRouter(); // Instancia del router

// --- FUNCIÓN PARA REGISTRAR UN NUEVO USUARIO ---
const registrarUsuario = async () => {
  try {
    // Usamos la función de Firebase para crear un usuario
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    console.log("¡Usuario registrado con éxito!", userCredential.user);
    // Redirigimos al usuario a la página de inventario
    router.push('/inventario'); 
  } catch (error) {
    // Si algo sale mal (ej: el email ya existe), mostramos una alerta
    console.error("Error al registrar:", error.message);
    alert("Error al registrar: " + error.message);
  }
};

// --- FUNCIÓN PARA INICIAR SESIÓN ---
const iniciarSesion = async () => {
  try {
    // Usamos la función de Firebase para iniciar sesión
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log("¡Inicio de sesión exitoso!", userCredential.user);
    // Redirigimos al usuario a la página de inventario
    router.push('/inventario');
  } catch (error) {
    // Si algo sale mal (ej: contraseña incorrecta), mostramos una alerta
    console.error("Error al iniciar sesión:", error.message);
    alert("Error al iniciar sesión: " + error.message);
  }
};
</script>

<style scoped>
/* Estilos para que se vea un poco más ordenado */
input { display: block; margin: 10px 0; padding: 8px; }
button { margin-right: 10px; }
</style>