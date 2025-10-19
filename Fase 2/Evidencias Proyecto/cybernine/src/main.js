// src/main.js

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // <-- 1. Importa el router que creaste

const app = createApp(App);

app.use(router); // <-- 2. Dile a la app que use el router

app.mount('#app');