<template>
  <div class="ia-panel">
    
    <div class="ia-body">

      <div v-if="cargando" class="loading-animation">
        <span class="typing-text">{{ loadingText }}</span>
        <span class="blinking-dots" v-if="showBlinkingDots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>

      <p v-else-if="!sugerencia" class="ia-placeholder">
        Aquí aparecerá el análisis y las recomendaciones de la Sra. MarIA.
      </p>
      
      <div v-else class="ia-suggestion-container">
        <strong class="suggestion-title">Sra. MarIA dice:</strong>
        <p class="suggestion-text">{{ sugerencia }}</p>
      </div>

    </div>
    </div>
</template>

<script setup>
import { ref, onUnmounted, defineExpose } from 'vue'; // Importamos defineExpose
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/config';

// --- Props ---
const props = defineProps({
  productos: {
    type: Array,
    required: true,
  },
});

// --- Emits para comunicarse con el padre ---
const emit = defineEmits(['update-loading']);

const getAISuggestion = httpsCallable(functions, 'getAISuggestion');

// --- Estado local ---
const sugerencia = ref('');
const cargando = ref(false);

// --- Lógica de Animación ---
const loadingText = ref('');
const showBlinkingDots = ref(false);
let typingInterval = null;
let sequenceTimeout = null;

const loadingMessages = [
  "Contactando a la Sra. MarIA",
  "Analizando su inventario",
  "Buscando las mejores sugerencias",
  "Esto puede tardar un poco",
  "Casi listo..."
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const typeMessage = async (message) => {
  loadingText.value = '';
  showBlinkingDots.value = false;
  const letters = message.split('');
  for (const letter of letters) {
    if (!cargando.value) return; 
    loadingText.value += letter;
    await sleep(60);
  }
  showBlinkingDots.value = true;
};

const runLoadingSequence = async () => {
  let i = 0;
  while (cargando.value) {
    const message = loadingMessages[i % loadingMessages.length];
    await typeMessage(message);
    await sleep(2500);
    if (!cargando.value) break;
    i++;
  }
};

// --- Función Principal (Ahora se llama desde el padre) ---
const obtenerSugerencia = async () => {
  if (cargando.value) return; // Evitar doble llamada
  
  cargando.value = true;
  sugerencia.value = '';
  emit('update-loading', true); // Notificar al padre que empezó la carga

  const apiPromise = getAISuggestion({ productos: props.productos });
  runLoadingSequence();

  try {
    const result = await apiPromise;
    sugerencia.value = result.data.suggestion;
  } catch (error) {
    console.error("Error al llamar la Cloud Function:", error);
    sugerencia.value = "Error: No se pudo contactar al asistente. Por favor, intenta de nuevo más tarde.";
  } finally {
    cargando.value = false;
    showBlinkingDots.value = false;
    clearTimeout(sequenceTimeout);
    clearInterval(typingInterval);
    emit('update-loading', false); // Notificar al padre que terminó
  }
};

onUnmounted(() => {
  clearTimeout(sequenceTimeout);
  clearInterval(typingInterval);
});

// --- Exponer la función para que el padre pueda llamarla ---
defineExpose({
  obtenerSugerencia
});
</script>

<style scoped>
/* Estilos adaptados para un panel dentro de la página, usando el tema oscuro */
.ia-panel {
  background-color: #ffffff; /* Panel blanco para contraste */
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  /* Quitamos position fixed, bottom, right, width fijo */
}

.ia-body {
  padding: 1.5rem;
  font-size: 1rem;
  color: var(--text-dark); /* Texto oscuro dentro del panel blanco */
  min-height: 120px; /* Altura mínima para que no colapse */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ia-placeholder {
  color: #777;
  font-style: italic;
  text-align: center;
  margin: 0;
}

.ia-suggestion-container {
  text-align: left;
}

.suggestion-title {
  display: block;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.suggestion-text {
  line-height: 1.6;
  white-space: pre-wrap; /* Mantener saltos de línea si la IA los envía */
}

/* --- Estilos de la animación (se mantienen igual) --- */
.loading-animation {
  display: flex;
  justify-content: center; /* Centrado */
  align-items: baseline;
  font-style: italic;
  color: var(--primary-color); /* Usamos el color primario para la carga */
  font-weight: 500;
}

.typing-text { margin-right: 2px; }

.blinking-dots span {
  animation: blink 1.4s infinite both;
  font-weight: bold;
  font-size: 1.2em;
}
.blinking-dots span:nth-child(2) { animation-delay: 0.2s; }
.blinking-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  20% { opacity: 1; }
}
</style>