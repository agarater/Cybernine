<template>
  <div class="inventario-container sramaria-view">
    
    <div class="header-section">
      <div class="avatar-container">
        <img 
          src="/icons/sra-maria.png" 
          alt="Sra. MarIA" 
          class="avatar-image"
        />
      </div>
      <h1>Hola, soy la Sra. MarIA</h1>
      <p class="subtitle">Tu asistente de inventario inteligente</p>
    </div>

    <div class="content-section">
      <p class="description">
        Analizo tu catálogo de productos y movimientos para ofrecerte sugerencias personalizadas,
        como detectar stock bajo o darte recomendaciones de compra.
      </p>

      <button 
        @click="triggerConsulta" 
        class="consulta-button"
        :disabled="isLoadingAI || isLoadingCatalog || productsCatalog.length === 0"
      >
        <span v-if="!isLoadingAI && !isLoadingCatalog">Consultar ahora 💬</span>
        <span v-else-if="isLoadingCatalog">Cargando datos...</span>
        <span v-else>Consultando...</span>
      </button>
      
      <p v-if="productsCatalog.length === 0 && !isLoadingCatalog" class="empty-catalog-msg">
        No tienes productos en tu catálogo para analizar.
      </p>
    </div>

    <div class="results-container">
      <SugerenciasIA 
        ref="sugerenciasRef"
        :productos="productsCatalog" 
        @update-loading="handleLoadingUpdate" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import SugerenciasIA from '@/components/SugerenciasIA.vue';
import { db, auth } from '@/firebase/config';
// AGREGADO: getDocs para poder leer los movimientos
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';

const sugerenciasRef = ref(null);
const isLoadingAI = ref(false);
const isLoadingCatalog = ref(true);
const productsCatalog = ref([]);
let unsubscribeCatalog = null;

const handleLoadingUpdate = (status) => {
  isLoadingAI.value = status;
};

const triggerConsulta = () => {
  if (sugerenciasRef.value) {
    // Un console.log para verificar qué le estamos enviando a la IA antes de salir
    console.log("Datos enviados a la IA:", JSON.parse(JSON.stringify(productsCatalog.value)));
    sugerenciasRef.value.obtenerSugerencia();
  }
};

// --- NUEVA FUNCIÓN: Esta es la clave. Calcula el stock leyendo los movimientos ---
const recalculateStockForAI = async (userId, currentProductsList) => {
  if (currentProductsList.length === 0) {
    productsCatalog.value = [];
    isLoadingCatalog.value = false;
    return;
  }

  try {
    // 1. Buscamos TODOS los movimientos de este usuario
    const movementsQuery = query(collection(db, "inventory_movements"), where("userId", "==", userId));
    const movementSnapshot = await getDocs(movementsQuery);
    
    // 2. Agrupamos los movimientos por ID de producto
    const movementsByProduct = {};
    movementSnapshot.forEach(doc => {
      const movement = doc.data();
      if (!movementsByProduct[movement.productId]) {
        movementsByProduct[movement.productId] = [];
      }
      movementsByProduct[movement.productId].push(movement);
    });

    // 3. Recorremos la lista de productos y calculamos el total para cada uno
    const updatedCatalog = currentProductsList.map(product => {
      let stock = 0;
      const productMovements = movementsByProduct[product.id] || [];

      productMovements.forEach(move => {
        if (move.tipo === 'entrada' || move.tipo === 'ajuste') { 
          // Asumimos que el ajuste ya viene con el signo correcto en la BD si lo guardaste así
          stock += move.cantidad;
        } else if (move.tipo === 'salida') {
          stock -= move.cantidad;
        }
      });
      // ¡AQUÍ ES DONDE SE AGREGA LA CANTIDAD AL PRODUCTO!
      return { ...product, calculatedStock: stock };
    });

    // 4. Actualizamos la lista final que usará la IA
    productsCatalog.value = updatedCatalog;

  } catch (error) {
    console.error("Error recalculando stock para IA:", error);
    // Si falla, al menos mostramos los productos sin stock
    productsCatalog.value = currentProductsList;
  } finally {
    isLoadingCatalog.value = false;
  }
};
// --------------------------------------------------------------------------------


onMounted(() => {
  // Usamos onAuthStateChanged para asegurar que tenemos el usuario
  const unsubscribeAuth = auth.onAuthStateChanged(user => {
    if (user) {
      isLoadingCatalog.value = true;
      const q = query(collection(db, "products"), where("userId", "==", user.uid));
      
      unsubscribeCatalog = onSnapshot(q, async (snapshot) => {
        const tempProductsBasic = [];
        snapshot.forEach(doc => {
          if (!doc.data().eliminado) {
             // Aquí solo obtenemos nombre, marca, etc. NO el stock.
             tempProductsBasic.push({ id: doc.id, ...doc.data() });
          }
        });
        
        // --- CAMBIO IMPORTANTE: Ahora llamamos a la función que calcula ---
        // Le pasamos la lista básica y esperamos a que le agregue los stocks
        await recalculateStockForAI(user.uid, tempProductsBasic);
        
      }, (error) => {
        console.error("Error al cargar el catálogo base:", error);
        isLoadingCatalog.value = false;
      });
    } else {
        isLoadingCatalog.value = false;
        // Opcional: redirigir al login si no hay usuario
    }
  });

  onUnmounted(() => {
    if (unsubscribeCatalog) unsubscribeCatalog();
    unsubscribeAuth(); // Importante desuscribirse del auth listener también
  });
});
</script>

<style scoped>
/* ... (Los estilos siguen exactamente igual que antes) ... */
.sramaria-view {
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-container {
  margin-bottom: 0.5rem;
  animation: bounce 2s infinite ease-in-out;
}

.avatar-image {
  height: 100px; 
  width: auto;
  display: block; 
  margin: 0 auto;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.header-section h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #000000;
}

.subtitle {
  margin: 0.5rem 0 0;
  color: #008ba4;
  font-size: 1rem;
}

.content-section {
  max-width: 600px;
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.description {
  font-size: 1.1rem;
  color: #000000;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.consulta-button {
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: 50px; 
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(63, 81, 181, 0.4); 
  transition: all 0.3s ease;
}

.consulta-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(63, 81, 181, 0.6);
}

.consulta-button:disabled {
  background: #555; 
  color: #aaa;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.empty-catalog-msg {
    color: var(--error-color);
    margin-top: 1rem;
    font-weight: 500;
}

.results-container {
  width: 100%;
  max-width: 800px; 
  padding: 0 1rem;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 65px;
  background-color: #ffffff !important; 
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}
.nav-item { display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #757575; font-size: 0.7rem; font-weight: 500; transition: color 0.3s ease; padding: 0.25rem; flex: 1; text-align: center; }
.nav-item img { width: 1.5rem; height: 1.5rem; margin-bottom: 0.25rem; filter: grayscale(100%); transition: filter 0.3s ease; }
.nav-item.router-link-active, .nav-item:hover { color: var(--primary-color); }
.nav-item.router-link-active img, .nav-item:hover img { filter: none; }

@media (min-width: 768px) {
    .nav-item { font-size: 0.85rem; }
    .nav-item img { width: 1.8rem; height: 1.8rem; }
}
</style>