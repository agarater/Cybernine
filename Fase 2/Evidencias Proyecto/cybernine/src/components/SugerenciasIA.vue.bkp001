<template>
  <div class="ia-window" :class="{ 'is-minimized': isMinimized }">
    
    <div class="ia-header" @click="toggleMinimize">
      <strong class="ia-title">{{ isMinimized ? 'IA' : 'Ayuda de la Sra MarIA' }}</strong>
      <button class="minimize-btn">{{ isMinimized ? '＋' : '—' }}</button>
    </div>
    
    <template v-if="!isMinimized">
      <div class="ia-body">

        <div v-if="cargando" class="loading-animation">
          <span class="typing-text">{{ loadingText }}</span>
          <span class="blinking-dots" v-if="showBlinkingDots">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>

        <p v-else-if="!sugerencia" class="ia-placeholder">
          Presiona el botón para obtener una sugerencia sobre tu stock.
        </p>
        
        <p v-else class="ia-suggestion">
          <strong>Sra MarIA:</strong> {{ sugerencia }}
        </p>

      </div>
      <div class="ia-footer">
        <button @click.stop="obtenerSugerencia" :disabled="cargando">
          {{ cargando ? 'Analizando...' : 'Presioname!' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/config'; // Usamos la conexión del emulador

// --- Props (sin cambios) ---
const props = defineProps({
  productos: {
    type: Array,
    required: true,
  },
});

// --- Conexión a la Cloud Function (sin cambios) ---
const getAISuggestion = httpsCallable(functions, 'getAISuggestion');

// --- Estado de la UI (con añadidos) ---
const sugerencia = ref('');
const cargando = ref(false);
const isMinimized = ref(true);

// --- ¡Aquí empieza la magia nueva! ---
const loadingText = ref('');       // El texto que se ve (ej: "Analizando...")
const showBlinkingDots = ref(false); // Controla si los puntos parpadean
let typingInterval = null;         // Para guardar el ID del intervalo de tipeo
let sequenceTimeout = null;        // Para guardar el ID del timeout de la secuencia

// Lista de mensajes para la espera
const loadingMessages = [
  "Contactando a la Sra. MarIA",
  "Analizando su inventario",
  "Buscando las mejores sugerencias",
  "Esto puede tardar un poco (arranque en frío)",
  "Casi listo..."
];

// Función para simular el sueño (no bloquea el navegador)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función que escribe un mensaje letra por letra
const typeMessage = async (message) => {
  loadingText.value = ''; // Resetea el texto
  showBlinkingDots.value = false; // Oculta los puntos mientras escribe
  
  const letters = message.split('');
  for (const letter of letters) {
    // Si 'cargando' se vuelve false (porque la IA ya respondió), paramos de escribir
    if (!cargando.value) return; 
    loadingText.value += letter;
    await sleep(60); // Velocidad de tipeo (ajusta 60ms como quieras)
  }
  
  showBlinkingDots.value = true; // Muestra los puntos parpadeantes
};

// Función que corre la secuencia de mensajes de carga
const runLoadingSequence = async () => {
  let i = 0;
  // Loop infinito mientras esté cargando
  while (cargando.value) {
    const message = loadingMessages[i % loadingMessages.length]; // Va rotando por los mensajes
    await typeMessage(message);
    await sleep(2500); // Tiempo que parpadean los puntos (2.5 seg)
    if (!cargando.value) break; // Chequeo por si la IA ya terminó
    i++;
  }
};

// Función principal (¡totalmente renovada!)
const obtenerSugerencia = async () => {
  cargando.value = true;
  sugerencia.value = '';

  // 1. Inicia la llamada REAL a la IA en segundo plano
  const apiPromise = getAISuggestion({ productos: props.productos });
  
  // 2. Inicia la SECUENCIA DE ANIMACIÓN (la coreografía)
  runLoadingSequence(); 

  // 3. Espera a que la llamada REAL termine
  try {
    const result = await apiPromise;
    sugerencia.value = result.data.suggestion;
  } catch (error) {
    console.error("Error al llamar la Cloud Function:", error);
    sugerencia.value = "Error: No se pudo contactar al asistente. Intenta de nuevo.";
  } finally {
    // 4. Detiene todo
    cargando.value = false;
    showBlinkingDots.value = false;
    clearTimeout(sequenceTimeout);
    clearInterval(typingInterval);
  }
};

// Limpieza por si el componente se destruye (sales de la página)
onUnmounted(() => {
  clearTimeout(sequenceTimeout);
  clearInterval(typingInterval);
});

// Lógica de Minimizar (sin cambios)
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};
</script>

<style scoped>
/* --- Estilos base (sin cambios) --- */
.ia-window {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  height: auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  z-index: 1000;
  transition: width 0.4s ease, height 0.4s ease, border-radius 0.4s ease;
}
.ia-window.is-minimized {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  padding: 0;
}
.ia-header {
  background-color: #f5f5f5;
  padding: 10px 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
/* --- Título en negro --- */
.ia-header .ia-title { /* Renombré <strong> a .ia-title para claridad */
  color: black;
  font-weight: 600; /* Un poco más de peso */
}
.ia-window.is-minimized .ia-title { display: none; }
.ia-window.is-minimized .ia-header {
  justify-content: center;
  padding: 0;
  height: 100%;
  border-bottom: none;
}
.minimize-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
  line-height: 1;
  color: #777;
  cursor: pointer;
  padding: 0 5px;
  font-weight: bold;
}
.ia-window.is-minimized .minimize-btn { font-size: 1.8rem; }
.ia-body {
  padding: 15px;
  min-height: 100px;
  font-size: 0.9em;
  color: #333; /* Color de texto por defecto para el body */
}
.ia-placeholder { color: #777; font-style: italic; }
.ia-suggestion { color: #333; }
.ia-footer {
  background-color: #f5f5f5;
  padding: 10px 15px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
}
button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover { background-color: var(--button-hover); }
button:disabled {
  background-color: #9e9e9e; /* Un gris más oscuro para 'Analizando...' */
  cursor: not-allowed;
}
.ia-footer button {
  font-size: 0.9em;
  font-weight: normal;
}

/* --- ¡AQUÍ EMPIEZA LA MAGIA CSS NUEVA! --- */

/* Contenedor de la animación de carga */
.loading-animation {
  display: flex;
  align-items: baseline; /* Alinea el texto con los puntos */
  font-style: italic;
  color: #555;
}

.typing-text {
  margin-right: 2px; /* Espacio antes de los puntos */
}

/* Contenedor de los puntos que parpadean */
.blinking-dots span {
  animation: blink 1.4s infinite both;
  font-weight: bold;
  font-size: 1.2em;
}

/* Define el retraso de la animación para cada punto */
.blinking-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.blinking-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

/* La animación que hace el parpadeo */
@keyframes blink {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>