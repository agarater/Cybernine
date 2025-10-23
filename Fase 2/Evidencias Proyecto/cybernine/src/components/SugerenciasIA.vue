<template>
  <div class="ia-window" :class="{ 'is-minimized': isMinimized }">
    
    <div class="ia-header" @click="toggleMinimize">
      <strong>{{ isMinimized ? 'IA' : 'Asistente de Inventario' }}</strong>
      <button class="minimize-btn">{{ isMinimized ? '＋' : '—' }}</button>
    </div>
    
    <template v-if="!isMinimized">
      <div class="ia-body">
        <p v-if="!sugerencia" class="ia-placeholder">
          Presiona el botón para obtener una sugerencia sobre tu stock.
        </p>
        <p v-else class="ia-suggestion">
          <strong>IA dice:</strong> {{ sugerencia }}
        </p>
      </div>
      <div class="ia-footer">
        <button @click.stop="obtenerSugerencia" :disabled="cargando">
          {{ cargando ? 'Pensando...' : 'Obtener Sugerencia' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// --- 1. IMPORTA LAS HERRAMIENTAS DE CLOUD FUNCTIONS ---
import { getFunctions, httpsCallable } from 'firebase/functions';

// --- 2. DEFINE LOS "PROPS" ---
// Esto le dice al componente que "aceptará" una variable
// llamada 'productos' que viene desde el componente padre.
const props = defineProps({
  productos: {
    type: Array,
    required: true,
  },
});

// --- 3. INICIALIZA LA CONEXIÓN A TU FUNCIÓN ---
// Conecta con el servicio de Cloud Functions
const functions = getFunctions();
// Apunta específicamente a la función que desplegamos
const getAISuggestion = httpsCallable(functions, 'getAISuggestion');


// --- Variables de estado (sin cambios) ---
const sugerencia = ref('');
const cargando = ref(false);
const isMinimized = ref(true);

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};

// --- 4. ESTA ES LA FUNCIÓN ACTUALIZADA ---
const obtenerSugerencia = async () => {
  cargando.value = true;
  sugerencia.value = ''; // Limpiamos la sugerencia anterior

  // --- REEMPLAZAMOS EL 'setTimeout' ---
  try {
    // 1. Llama a la Cloud Function que está en la nube
    //    y le envía la lista de productos actuales.
    const result = await getAISuggestion({ productos: props.productos });
    
    // 2. Recibe la respuesta de la IA (result.data.suggestion)
    //    y la muestra en la ventana.
    sugerencia.value = result.data.suggestion;

  } catch (error) {
    // Si algo sale mal (ej. error de red o de la IA),
    // mostramos un mensaje de error al usuario.
    console.error("Error al llamar la Cloud Function:", error);
    sugerencia.value = "Error: No se pudo contactar al asistente. Intenta de nuevo.";
  } finally {
    // 3. Pase lo que pase, dejamos de "cargar"
    cargando.value = false;
  }
};
</script>

<style scoped>
/* --- PASO 5: LA MAGIA DE LA ANIMACIÓN (TRANSICIÓN) --- */
.ia-window {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  height: auto; /* Dejamos que la altura sea automática */
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  overflow: hidden; /* Clave para que el contenido no se salga al encogerse */
  z-index: 1000;
  
  /* Aquí está la magia: animamos estos cambios durante 0.4 segundos */
  transition: width 0.4s ease, height 0.4s ease, border-radius 0.4s ease;
}

/* Este es el estilo que se aplica cuando isMinimized es true */
.ia-window.is-minimized {
  width: 60px; /* Ancho de la esfera */
  height: 60px; /* Alto de la esfera */
  border-radius: 50%; /* ¡La esfera! */
  padding: 0;
}

/* --- Estilos para la cabecera y el nuevo botón --- */
.ia-header {
  background-color: #f5f5f5;
  padding: 10px 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer; /* Indica que se puede hacer clic */
}

/* Ocultamos el título cuando está minimizado */
.ia-window.is-minimized .ia-header strong {
  display: none;
}

/* Centramos el botón '+' cuando está minimizado */
.ia-window.is-minimized .ia-header {
  justify-content: center;
  padding: 0;
  height: 100%;
  border-bottom: none;
}

.minimize-btn {
  background: none;
  border: none;
  font-size: 1.4rem; /* Más grande para que sea fácil de presionar */
  line-height: 1;
  color: #777;
  cursor: pointer;
  padding: 0 5px;
  font-weight: bold;
}
.ia-window.is-minimized .minimize-btn {
  font-size: 1.8rem;
}

/* --- Estilos existentes (sin cambios) --- */
.ia-body {
  padding: 15px;
  min-height: 100px;
  font-size: 0.9em;
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
button:disabled { background-color: #ccc; cursor: not-allowed; }

/* Hacemos que el botón de sugerencia no sea el mismo que el de minimizar */
.ia-footer button {
  font-size: 0.9em;
  font-weight: normal;
}
</style>