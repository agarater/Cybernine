<template>
  <div class="sramaria-container">
    <h1>¡Hola! Soy la Sra. MarIA, tu asistente de inventario.</h1>
    <p class="description">
      Puedo analizar tu catálogo de productos y movimientos para ofrecerte sugerencias personalizadas,
      como productos con bajo stock, recomendaciones de compra o análisis de ventas.
      Presiona el botón para que empiece a trabajar.
    </p>

    <button @click="activateAI = true" v-if="!activateAI" class="activate-button">
      Consultar a la Sra. MarIA 💬
    </button>

    <div v-if="activateAI" class="ai-results-section">
      <p class="loading-message" v-if="loadingAI">Cargando sugerencias... Por favor espera.</p>
      <SugerenciasIA :productos="productsCatalog" @loading-status="handleLoadingStatus" />
    </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SugerenciasIA from '@/components/SugerenciasIA.vue';
import { db } from '@/firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

const activateAI = ref(false);
const loadingAI = ref(true); // Estado para controlar si la IA está "cargando"
const productsCatalog = ref([]);

// Función para actualizar el estado de carga desde SugerenciasIA
const handleLoadingStatus = (status) => {
  loadingAI.value = status;
};

// Cargar el catálogo de productos (necesario para SugerenciasIA)
onMounted(() => {
  const productsQuery = collection(db, "products");
  const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
    const tempProducts = [];
    snapshot.forEach(doc => {
      tempProducts.push({ id: doc.id, ...doc.data() });
    });
    productsCatalog.value = tempProducts;
  }, (error) => {
    console.error("Error al cargar el catálogo para SraMariaView:", error);
  });

  // Asegurarse de desuscribirse cuando el componente se desmonte
  return () => unsubscribe();
});
</script>

<style scoped>
.sramaria-container {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  background-color: #f4f6f9; /* Un fondo claro para esta vista */
  min-height: calc(100vh - 65px); /* Ajusta a la altura de la pantalla menos el nav inferior */
  box-sizing: border-box;
  color: #333; /* Texto oscuro por defecto */
}

h1 {
  font-size: 2rem;
  color: #3f51b5; /* primary-color */
  margin-bottom: 1rem;
}

.description {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.activate-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #4CAF50; /* success-color */
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.activate-button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.ai-results-section {
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.loading-message {
  font-style: italic;
  color: #666;
  margin-top: 1rem;
}

/* Media Queries para responsividad */
@media (max-width: 600px) {
  h1 {
    font-size: 1.6rem;
  }
  .description {
    font-size: 0.95rem;
  }
  .activate-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
}
</style>