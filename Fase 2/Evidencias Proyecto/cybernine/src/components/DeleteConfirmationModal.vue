<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="cancel">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Confirmar Eliminación</h3>
        <button class="close-button" @click="cancel">×</button>
      </div>
      
      <div class="modal-body">
        <p>¿Estás seguro de que deseas eliminar el producto <strong>{{ productName }}</strong>?</p>
        <p class="warning-text">
          ⚠ Esta acción eliminará el producto del catálogo, pero <strong>mantendrá el historial</strong> de movimientos asociados para no afectar tus reportes.
        </p>
      </div>

      <div class="modal-actions">
        <button class="secondary-button" @click="cancel">Cancelar</button>
        <button class="danger-button" @click="confirm">Sí, Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  productName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => {
  emit('confirm');
};

const cancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100; /* Mayor que el nav */
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  padding: 0;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
  color: #333;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #d32f2f; /* Rojo para indicar peligro */
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #888;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

.warning-text {
  font-size: 0.9rem;
  color: #666;
  background-color: #fff3cd;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
  border-left: 4px solid #ffc107;
}

.modal-actions {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
}

.secondary-button {
  padding: 0.6rem 1.2rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
  color: #555;
  cursor: pointer;
  font-weight: 600;
}

.danger-button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  background-color: #d32f2f; /* Rojo */
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.danger-button:hover {
  background-color: #b71c1c;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>