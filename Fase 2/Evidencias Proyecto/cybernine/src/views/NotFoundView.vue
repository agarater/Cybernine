<template>
  <div class="not-found-container">
    <h1>404 - Página no encontrada</h1>
    <p>Lo sentimos, la página que buscas no existe. Aquí un simpático animalito para mejorar tu día.</p>

    <img :src="selectedGif" alt="gif divertido" class="cat-gif" />

    <router-link to="/" class="back-link">Volver al inicio</router-link>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Lista de GIFs posibles (ubicados en /public/img/)
const gifs = [
  "/img/cat-spinning.gif",
  "/img/doggo_dance.gif",
  "/img/maxwell_dance.gif",
  "/img/doggo_ears.gif"
];

// Selecciona uno al azar en cada carga
const selectedGif = ref(gifs[Math.floor(Math.random() * gifs.length)]);
</script>

<style scoped>
.not-found-container {
  background-color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.cat-gif {
  width: 250px;
  height: auto;
  margin: 20px 0;
}

.back-link {
  margin-top: 20px;
  font-weight: bold;
  text-decoration: underline;
  color: #007bff;
}

h1 {
  color: black;
}

p {
  color: black;
}

</style>