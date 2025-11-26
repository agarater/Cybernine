// src/main.js

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // <-- 1. Importa el router que creaste

import './assets/main.css'; // <-- Estilos visuales globales

// --- NUEVAS IMPORTACIONES PARA LAS NOTIFICACIONES ---
import Toast from "vue-toastification";
// Importar los estilos CSS necesarios
import "vue-toastification/dist/index.css";
// ----------------------------------------------------


const app = createApp(App);

app.use(router); // <-- 2. Dile a la app que use el router

// --- NUEVO: DECIRLE A LA APP QUE USE EL PLUGIN ---
// Puedes pasar opciones aquí si quieres personalizarlo, 
// por ahora lo usaremos con la configuración por defecto.
app.use(Toast);
// -------------------------------------------------

app.mount('#app');