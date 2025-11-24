<template>
  <!-- Solo se muestra cuando isVisible es true -->
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <h2>Editar producto</h2>

      <form @submit.prevent="saveChanges">
        <!-- Código de barras solo lectura -->
        <div class="form-group">
          <label>Código de barras</label>
          <input
            type="text"
            :value="barcode"
            disabled
          />
        </div>

        <div class="form-group">
          <label>Nombre</label>
          <input
            type="text"
            v-model="localProduct.nombre"
            required
          />
        </div>

        <div class="form-group">
          <label>Presentación</label>
          <input
            type="text"
            v-model="localProduct.presentacion"
            required
          />
        </div>

        <div class="form-group">
          <label>Marca</label>
          <input
            type="text"
            v-model="localProduct.marca"
          />
        </div>

        <div class="form-group">
          <label>Precio</label>
          <input
            type="number"
            v-model.number="localProduct.precio"
            min="0"
            step="0.01"
          />
        </div>

        <div class="actions">
          <button type="button" class="btn-secondary" @click="emit('close')">
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue';
import { db } from '@/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

const props = defineProps({
  isVisible: { type: Boolean, default: false },
  product: { type: Object, default: null }
});

const emit = defineEmits(['close', 'saved']);

// Estado local editable del producto
const localProduct = reactive({
  id: '',
  nombre: '',
  presentacion: '',
  marca: '',
  precio: null
});

// Cuando cambia el producto seleccionado, copiamos sus datos al estado local
watch(
  () => props.product,
  (newVal) => {
    if (newVal) {
      localProduct.id = newVal.id;
      localProduct.nombre = newVal.nombre || '';
      localProduct.presentacion = newVal.presentacion || '';
      localProduct.marca = newVal.marca || '';
      localProduct.precio = newVal.precio ?? null;
    }
  },
  { immediate: true }
);

// Cálculo del código de barras a partir del id completo
const barcode = computed(() => {
  if (!localProduct.id) return '';
  const parts = localProduct.id.split('_');
  return parts.length > 1 ? parts[1] : localProduct.id;
});

// Guardar cambios en Firestore
const saveChanges = async () => {
  try {
    if (!localProduct.id) return;

    await updateDoc(doc(db, 'products', localProduct.id), {
      nombre: localProduct.nombre,
      presentacion: localProduct.presentacion,
      marca: localProduct.marca,
      precio: localProduct.precio ?? null
    });

    emit('saved'); // Para que el padre pueda refrescar si quiere
    emit('close');
  } catch (error) {
    console.error('Error actualizando producto:', error);
    alert('Error al actualizar el producto. Revisa la consola.');
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Más alto que tu bottom-nav (1000) */
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  text-align: center;
  color: black;
}

.form-group {
  margin-bottom: 0.75rem;
  color: black;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 0.9rem;
  box-sizing: border-box;
}

input[disabled] {
  background: #f3f3f3;
  color: #777;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  border-radius: 6px;
  padding: 0.5rem 0.9rem;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #3f51b5;
  color: #fff;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}
</style>
