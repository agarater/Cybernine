<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <h3>Ajustar Stock Manual</h3>
      
      <div v-if="product" class="stock-info-section">
        <p class="product-title">{{ product.nombre }}</p>
        <p class="product-presentation">{{ product.presentacion }}</p>
        <p class="product-brand">{{ product.marca }}</p> 
        
        <p class="current-stock-label">Stock Actual:</p>
        <div class="stock-display-container">
           <p class="stock-big-number" :class="stockClass">
            <strong>{{ product.calculatedStock }}</strong>
          </p>
        </div>
      </div>

      <div class="input-group">
        <label for="newStockValue">Nueva Cantidad Total:</label>
        <input 
          type="number" 
          id="newStockValue" 
          v-model.number="newInputValue" 
          min="0"
          placeholder="Ej: 50"
          @keyup.enter="confirm"
        />
      </div>

      <div class="modal-actions">
        <button @click="cancel" class="cancel-button">Cancelar</button>
        <button @click="confirm" class="confirm-button" :disabled="!isValidInput">Aceptar</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isVisible: Boolean,
  product: Object
});

const emit = defineEmits(['close', 'confirm-adjust']);

const newInputValue = ref(null);

// Resetear el input cuando se abre el modal
watch(() => props.isVisible, (newVal) => {
  if (newVal && props.product) {
    // Opcional: si quieres que empiece vacío o con el valor actual.
    // newInputValue.value = props.product.calculatedStock; 
    newInputValue.value = null;
  }
});

// Calcular la clase de color para el stock actual (copiado de la lógica principal)
const stockClass = computed(() => {
  if (!props.product) return '';
  const stock = props.product.calculatedStock;
  if (stock <= 5) return 'stock-low';
  if (stock > 5 && stock <= 10) return 'stock-medium';
  return 'stock-high';
});

const isValidInput = computed(() => {
  return newInputValue.value !== null && newInputValue.value !== '' && !isNaN(newInputValue.value) && newInputValue.value >= 0;
});

const cancel = () => {
  emit('close');
};

const confirm = () => {
  if (!isValidInput.value || !props.product) return;

  const currentStock = props.product.calculatedStock;
  const newStock = newInputValue.value;
  const diferencia = newStock - currentStock;

  if (diferencia === 0) {
    alert("No hay cambios en el stock.");
    return;
  }
  
  // Emitimos el evento con los datos necesarios para que el padre lo procese
  emit('confirm-adjust', {
    productId: props.product.id,
    diferencia: diferencia,
    newTotal: newStock
  });
  
  emit('close');
};
</script>

<style scoped>
/* --- Estilos base del Modal (Similares a EditProductModal) --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Por encima de todo */
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  text-align: center;
}

h3 {
  margin-top: 0;
  color: var(--primary-color);
}

/* --- Estilos específicos de contenido --- */
.stock-info-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}
.product-title {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0;
    color: #000000;
}
/* Para los detalles de "presentación" */
.product-presentation,
.product-brand {
  color: #000000 !important;
  font-size: 0.9rem; /* Puedes ajustar si quieres */
}

.current-stock-label {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
}

/* --- ESTILOS COPIADOS PARA EL NÚMERO GIGANTE --- */
.stock-display-container {
    display: flex;
    justify-content: center;
    align-items: baseline;
}
.stock-big-number strong {
  font-size: 4rem; /* Un poco más grande para que destaque en el modal */
  line-height: 1;
}
/* Definimos los colores aquí también porque los estilos son scoped */
.stock-high { color: var(--success-color); }
.stock-medium { color: var(--accent-color); }
.stock-low { color: var(--error-color); }
/* ----------------------------------------------- */

.input-group {
  margin-bottom: 1.5rem;
  text-align: left;
}
.input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #000000;
}
.input-group input {
  width: 100%;
  padding: 0.8rem;
  font-size: 1.1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
}

.cancel-button {
  background-color: #e0e0e0;
  color: #333;
}

.confirm-button {
  background-color: var(--accent-color); /* Usamos el color naranja de "Ajustar" */
  color: white;
}
.confirm-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>