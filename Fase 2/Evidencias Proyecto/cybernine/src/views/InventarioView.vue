<template>
  <div>
    <h1>Mi Inventario</h1>
    
    <form @submit.prevent="agregarProducto">
      <h3>Agregar Nuevo Producto</h3>
      <input type="text" placeholder="Nombre del producto" v-model="nuevoProducto.nombre" required>
      <input type="number" placeholder="Stock inicial" v-model.number="nuevoProducto.stock" required>
      <input type="number" placeholder="Precio de venta" v-model.number="nuevoProducto.precio" required>
      <button type="submit">Agregar</button>
    </form>

    <hr>

    <h2>Productos en Stock</h2>
    <ul>
      <li v-for="producto in productos" :key="producto.id">
        {{ producto.nombre }} - Stock: {{ producto.stock }} - Precio: ${{ producto.precio }}
      </li>
    </ul>

    <SugerenciasIA :productos="productos" />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db, auth } from '@/firebase/config'; // Importamos la DB y Auth
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';

// --- Importa tu componente de IA ---
import SugerenciasIA from '@/components/SugerenciasIA.vue'; 

// Variable reactiva para el formulario
const nuevoProducto = ref({
  nombre: '',
  stock: null,
  precio: null
});

// Arreglo para guardar los productos que vienen de Firebase
const productos = ref([]);

// --- 1. FUNCIÓN PARA AGREGAR PRODUCTOS ---
const agregarProducto = async () => {
  if (!auth.currentUser) {
    alert("Debes iniciar sesión para agregar productos");
    return;
  }
  
  try {
    // Agregamos el producto a la colección 'productos'
    await addDoc(collection(db, "productos"), {
      ...nuevoProducto.value,
      userId: auth.currentUser.uid // Guardamos el ID del usuario
    });

    // Limpiamos el formulario
    nuevoProducto.value = { nombre: '', stock: null, precio: null };

  } catch (error) {
    console.error("Error al agregar el producto:", error);
  }
};

// --- 2. FUNCIÓN PARA LEER LOS PRODUCTOS EN TIEMPO REAL ---
onMounted(() => {
  if (auth.currentUser) {
    // Consulta para traer solo productos del usuario actual
    const q = query(collection(db, "productos"), where("userId", "==", auth.currentUser.uid));
    
    // onSnapshot es un listener en tiempo real
    onSnapshot(q, (querySnapshot) => {
      const productosTemp = [];
      querySnapshot.forEach((doc) => {
        productosTemp.push({ id: doc.id, ...doc.data() });
      });
      productos.value = productosTemp; // Actualizamos nuestro arreglo reactivo
    });
  }
});
</script>

<style scoped>
/* Estilos para que se vea un poco más ordenado */
form {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}
input {
  display: block;
  margin-bottom: 10px;
  padding: 8px;
  width: 95%;
}
hr {
  margin: 20px 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ddd;
  margin-bottom: 5px;
  border-radius: 5px;
}
</style>