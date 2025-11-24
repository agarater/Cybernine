<template>
  <div class="inventario-container">
    
    <div class="top-bar">
      <div class="search-input-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar en movimientos..." 
          class="search-input" 
        />
        <span class="search-icon">🔍</span>
      </div>
      <button class="filter-button" @click="showFilterNotice">
        <img src="/icons/filter-icon.png" alt="Filtrar" /> 
      </button>
    </div>

    <div class="movements-list-section">
      
      <p v-if="isLoading" class="loading-text">Cargando historial...</p>
      
      <div v-else-if="movementsHistory.length === 0" class="empty-state">
        <p>No hay registros de movimientos aún.</p>
      </div>

      <div v-else-if="filteredMovements.length === 0" class="empty-state">
        <p>No se encontraron movimientos que coincidan con la búsqueda.</p>
      </div>

      <div v-else class="movements-list">
        <div 
          v-for="item in filteredMovements" 
          :key="item.id" 
          class="movement-card"
        >
          
          <div class="movement-type-indicator" :class="item.typeClass">
            <span class="type-icon">{{ item.icon }}</span>
          </div>

          <div class="movement-details">
            <h3 class="product-title">{{ item.productName }}</h3>
            <p class="product-subtitle">
              {{ item.productPresentation }}
              <span v-if="item.productBrand"> - {{ item.productBrand }}</span>
            </p>
            <div class="movement-meta">
              <span class="movement-reason">{{ item.reasonText }}</span>
              <span class="separator">•</span>
              <span class="movement-date">{{ item.formattedDate }}</span>
            </div>
          </div>

          <div class="movement-quantity-box" :class="item.typeClass">
            <span class="quantity-prefix">{{ item.quantityPrefix }}</span>
            <span class="quantity-number">{{ item.cantidad }}</span>
          </div>

        </div>
      </div>

    </div>
    
    <nav class="bottom-nav">
      <router-link to="/app/inventario" class="nav-item">
        <img src="/icons/catalog-icon.png" alt="Catálogo" /> <span>Catálogo</span>
      </router-link>
      <router-link to="/app/movimientos" class="nav-item router-link-active">
        <img src="/icons/movements-icon.png" alt="Movimientos" />
        <span>Movimientos</span>
      </router-link>
      <router-link to="/app/sramaria" class="nav-item">
        <img src="/icons/ai-icon.png" alt="Sra. MarIA" />
        <span>Sra. MarIA</span>
      </router-link>
      <router-link to="/app/configuracion" class="nav-item">
        <img src="/icons/config-icon.png" alt="Configuración" />
        <span>Configuración</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'; // Agregamos 'computed'
import { db, auth } from '@/firebase/config';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useRouter } from 'vue-router';

const router = useRouter();
// movementsHistory guarda TODOS los movimientos cargados de la BD
const movementsHistory = ref([]);
const isLoading = ref(true);
// searchQuery guarda el texto que escribe el usuario
const searchQuery = ref('');
let unsubscribeMovements = () => {};

// --- Computed Property para el filtrado ---
// Esta es la magia: filteredMovements se recalcula automáticamente cuando cambia searchQuery
const filteredMovements = computed(() => {
  // Si no hay búsqueda, mostramos todo
  if (!searchQuery.value) {
    return movementsHistory.value;
  }
  
  const queryText = searchQuery.value.toLowerCase();
  
  // Filtramos la lista completa
  return movementsHistory.value.filter(item => {
    // Usamos optional chaining (?.) y valores por defecto (|| '') para evitar errores si un campo falta
    const name = item.productName?.toLowerCase() || '';
    const presentation = item.productPresentation?.toLowerCase() || '';
    const brand = item.productBrand?.toLowerCase() || ''; // Ahora incluimos la marca en la búsqueda

    // Retorna verdadero si alguna de las propiedades incluye el texto buscado
    return name.includes(queryText) || presentation.includes(queryText) || brand.includes(queryText);
  });
});

// --- FUNCIÓN PARA INDICAR "DISPONIBLE EN ACTUALIZACIÓN FUTURA" ---
const showFilterNotice = () => {
  alert('"Filtrar por" Disponible en futura actualización');
};

// --- Helpers para formato (SIN CAMBIOS) ---
const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const getMovementVisuals = (movementDoc) => {
  const tipo = movementDoc.tipo;
  const motivo = movementDoc.motivo;
  const esInicial = movementDoc.esMovimientoInicial;

  let visuals = {
    typeClass: '', 
    icon: '', 
    reasonText: '', 
    quantityPrefix: '' 
  };

  switch (tipo) {
    case 'entrada':
      visuals.typeClass = 'type-success';
      visuals.icon = '📥';
      visuals.reasonText = esInicial ? 'Nuevo producto' : 'Ingreso (Compra)';
      visuals.quantityPrefix = '+';
      break;
    case 'salida':
      visuals.typeClass = 'type-error';
      visuals.icon = '📤';
      visuals.reasonText = 'Salida (Venta)';
      visuals.quantityPrefix = '-';
      break;
    case 'ajuste':
      visuals.typeClass = 'type-accent';
      visuals.icon = '🔧';
      visuals.reasonText = motivo || 'Ajuste manual';
      visuals.quantityPrefix = movementDoc.cantidad >= 0 ? '+' : '';
      break;
    default:
      visuals.typeClass = 'type-neutral';
      visuals.icon = '📄';
      visuals.reasonText = 'Movimiento';
      visuals.quantityPrefix = '';
  }
  return visuals;
};


// --- Lógica Principal ---

onMounted(() => {
  const unsubscribeAuth = auth.onAuthStateChanged(user => {
    if (user) {
      fetchMovements(user.uid);
    } else {
      router.push('/login');
    }
  });
   onUnmounted(() => {
    unsubscribeAuth();
  });
});

const fetchMovements = async (userId) => {
  isLoading.value = true;
  const q = query(
    collection(db, "inventory_movements"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  );

  unsubscribeMovements = onSnapshot(q, async (snapshot) => {
    const rawMovements = [];
    const productIdsToFetch = new Set();

    snapshot.forEach(doc => {
      const data = doc.data();
      rawMovements.push({ id: doc.id, ...data });
      if (data.productId) {
        productIdsToFetch.add(data.productId);
      }
    });

    const productMap = {};
    await Promise.all(Array.from(productIdsToFetch).map(async (pid) => {
      try {
        const productDoc = await getDoc(doc(db, "products", pid));
        if (productDoc.exists()) {
          productMap[pid] = productDoc.data();
        } else {
           // Valores por defecto si el producto fue borrado físicamente (raro)
           productMap[pid] = { nombre: 'Producto desconocido', presentacion: '', marca: '' };
        }
      } catch (e) {
          console.error("Error fetching product details: ", e);
          productMap[pid] = { nombre: 'Error cargando producto', presentacion: '', marca: '' };
      }
    }));

    movementsHistory.value = rawMovements.map(move => {
      // Obtenemos los detalles del mapa, usando un objeto vacío por seguridad
      const productDetails = productMap[move.productId] || {};
      const visuals = getMovementVisuals(move);

      return {
        ...move,
        // Mapeamos los campos, incluyendo la MARCA ahora
        productName: productDetails.nombre || 'Sin nombre',
        productPresentation: productDetails.presentacion || '',
        productBrand: productDetails.marca || '', // NUEVO: Agregamos la marca al objeto
        formattedDate: formatDateTime(move.timestamp),
        ...visuals, 
        cantidad: Math.abs(move.cantidad) 
      };
    });
    
    isLoading.value = false;

  }, (error) => {
    console.error("Error fetching movements real-time:", error);
    isLoading.value = false;
  });
};

onUnmounted(() => {
  if (unsubscribeMovements) unsubscribeMovements();
});
</script>

<style scoped>
/* Hereda estilos base del main.css (fondo oscuro, etc.) */

/* --- NUEVOS ESTILOS DE LA BARRA SUPERIOR (Copiados de InventarioView) --- */
.top-bar {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #ffffff !important; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  box-sizing: border-box;
  color: var(--text-dark);
}

.search-input-container { flex-grow: 1; position: relative; margin-right: 0.5rem; }
.search-input { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.5rem; border: 1px solid var(--border-color); border-radius: 25px; font-size: 0.95rem; background-color: var(--bg-light); color: var(--text-dark); box-sizing: border-box; }
.search-input::placeholder { color: #999; }
.search-icon { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: var(--text-light); }
.filter-button { background: none; border: none; padding: 0.5rem; cursor: pointer; flex-shrink: 0; }
.filter-button img { width: 1.5rem; height: 1.5rem; vertical-align: middle; }
/* ----------------------------------------------------------------------- */


.movements-list-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.loading-text, .empty-state {
  text-align: center;
  color: #e0e0e0;
  margin-top: 2rem;
  font-size: 1.1rem;
  padding: 1rem;
  background-color: rgba(255,255,255,0.05);
  border-radius: 10px;
}

/* --- ESTILOS DE LA TARJETA DE MOVIMIENTO (SIN CAMBIOS) --- */
.movements-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-bottom: 1rem;
}

.movement-card {
  background-color: #ffffff !important;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: stretch; 
  overflow: hidden; 
  min-height: 80px;
}

/* Indicador lateral izquierdo (Icono y Color) */
.movement-type-indicator {
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.type-icon {
  font-size: 1.5rem;
}

/* Colores de fondo para el indicador */
.type-success { background-color: #e8f5e9; color: var(--success-color); }
.type-error { background-color: #ffebee; color: var(--error-color); }
.type-accent { background-color: #fff3e0; color: var(--accent-color); }
.type-neutral { background-color: #f5f5f5; color: #757575; }


/* Sección Central (Detalles) */
.movement-details {
  flex-grow: 1;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid #f0f0f0;
}

.product-title {
  margin: 0 0 0.2rem 0;
  font-size: 1.1rem;
  color: var(--text-dark);
  font-weight: 600;
}

.product-subtitle {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.movement-meta {
  font-size: 0.8rem;
  color: #888;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.separator { margin: 0 0.5rem; }


/* Sección Derecha (Cantidad) */
.movement-quantity-box {
  padding: 0 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  min-width: 80px;
}

.quantity-prefix {
  font-size: 1.2rem;
  margin-right: 2px;
}

.quantity-number {
  font-size: 1.8rem;
}

/* Colores para el texto de la cantidad */
.movement-quantity-box.type-success { color: var(--success-color); }
.movement-quantity-box.type-error { color: var(--error-color); }
.movement-quantity-box.type-accent { color: var(--accent-color); }


/* --- BARRA INFERIOR (Reutilizada) --- */
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