<template>
  <div class="inventario-container informe-view">
    
    <h2 class="page-title">Informe de Inventario</h2>

    <div v-if="isLoading" class="loading-container">
      <p>Calculando métricas...</p>
    </div>

    <div v-else class="content-wrapper">
      <div class="metrics-grid">
        <div class="metric-card valor">
          <div class="metric-icon">💰</div>
          <div class="metric-info">
            <h3>Valor Estimado</h3>
            <p class="big-number">${{ formatCurrency(totalInventoryValue) }}</p>
            <small>Basado en stock actual y precio registrado</small>
          </div>
        </div>
        <div class="metric-card unidades">
          <div class="metric-icon">📦</div>
          <div class="metric-info">
            <h3>Total Unidades</h3>
            <p class="big-number">{{ totalUnits }}</p>
            <small>Productos físicos en bodega</small>
          </div>
        </div>
      </div>

      <div class="chart-card">
        
        <h3>Balance de Movimientos (Últimos 30 días)</h3>
        <p class="chart-subtitle">Comparativa de unidades que entran vs. salen.</p>
        
        <div class="balance-chart-container">
          <div class="balance-row">
            <span class="label">Entradas (📥)</span>
            <div class="bar-container">
              <div class="bar in" :style="{ width: inflowPercentage + '%' }"></div>
              <span class="bar-value">{{ recentInflow }} un.</span>
            </div>
          </div>
          <div class="balance-row">
            <span class="label">Salidas (📤)</span>
            <div class="bar-container">
              <div class="bar out" :style="{ width: outflowPercentage + '%' }"></div>
              <span class="bar-value">{{ recentOutflow }} un.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card stock-health-card">
        <div class="health-info">
          <h3>Salud del Stock</h3>
          <p class="chart-subtitle">Productos con stock crítico (≤ 5 unidades).</p>
          <div class="health-legend">
            <div class="legend-item"><span class="dot critical"></span> Crítico: <strong>{{ criticalStockCount }}</strong></div>
            <div class="legend-item"><span class="dot okay"></span> Normal: <strong>{{ totalProductsCount - criticalStockCount }}</strong></div>
          </div>
        </div>
        
        <div class="donut-chart-wrapper">
          <svg viewBox="0 0 36 36" class="simple-donut">
            <path class="donut-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="donut-segment" 
                  :stroke-dasharray="`${criticalPercentage}, 100`"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <text x="18" y="20.35" class="donut-text">{{ criticalPercentage }}%</text>
          </svg>
        </div>
      </div>

      <div class="download-section">
         <transition name="fade">
          <div v-if="showExcelToast" class="toast-message">
            Disponible próximamente
          </div>
        </transition>

        <button class="excel-button" @click="handleExcelClick">
          📄 Descargar informe en Excel
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { db, auth } from '@/firebase/config';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

// --- Estado Reactivo ---
const isLoading = ref(true);
const totalInventoryValue = ref(0);
const totalUnits = ref(0);
const totalProductsCount = ref(0);
const criticalStockCount = ref(0); 
const recentInflow = ref(0);
const recentOutflow = ref(0);

// Estado para el mensaje flotante del botón Excel
const showExcelToast = ref(false);

// --- Utilidad de Formato de Moneda (Reutilizada) ---
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0';
  let num = value.toString().replace(/\./g, '');
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// --- Cálculos para Gráficos ---
const totalFlow = computed(() => recentInflow.value + recentOutflow.value);
const inflowPercentage = computed(() => totalFlow.value === 0 ? 0 : Math.round((recentInflow.value / totalFlow.value) * 100));
const outflowPercentage = computed(() => totalFlow.value === 0 ? 0 : Math.round((recentOutflow.value / totalFlow.value) * 100));
const criticalPercentage = computed(() => {
  if (totalProductsCount.value === 0) return 0;
  return Math.round((criticalStockCount.value / totalProductsCount.value) * 100);
});

// --- Manejador del clic en el botón Excel ---
const handleExcelClick = () => {
  if (showExcelToast.value) return; // Evitar doble clic rápido
  showExcelToast.value = true;
  // Ocultar automáticamente después de 2 segundos
  setTimeout(() => {
    showExcelToast.value = false;
  }, 2000);
};


// --- Lógica Principal de Carga de Datos ---
onMounted(async () => {
  const user = auth.currentUser;
  if (!user) {
    isLoading.value = false;
    return;
  }

  try {
    // 1. Cargar Productos y calcular Stock Actual al vuelo
    const productsQuery = query(collection(db, "products"), where("userId", "==", user.uid));
    const productsSnapshot = await getDocs(productsQuery);
    const productsMap = new Map();
    productsSnapshot.forEach(doc => {
      if (!doc.data().eliminado) {
        productsMap.set(doc.id, { ...doc.data(), calculatedStock: 0 });
      }
    });

    const allMovementsQuery = query(collection(db, "inventory_movements"), where("userId", "==", user.uid));
    const allMovementsSnapshot = await getDocs(allMovementsQuery);

    allMovementsSnapshot.forEach(doc => {
      const move = doc.data();
      if (productsMap.has(move.productId)) {
        const product = productsMap.get(move.productId);
        if (move.tipo === 'entrada' || move.tipo === 'ajuste') {
           product.calculatedStock += move.cantidad;
        } else if (move.tipo === 'salida') {
           product.calculatedStock -= move.cantidad;
        }
      }
    });

    let tempTotalValue = 0;
    let tempTotalUnits = 0;
    let tempCriticalCount = 0;
    
    productsMap.forEach(product => {
      const stock = Math.max(0, product.calculatedStock); 
      const precio = product.precio || 0;
      
      tempTotalUnits += stock;
      tempTotalValue += (stock * precio);
      if (stock <= 5) tempCriticalCount++;
    });

    totalInventoryValue.value = tempTotalValue;
    totalUnits.value = tempTotalUnits;
    criticalStockCount.value = tempCriticalCount;
    totalProductsCount.value = productsMap.size;


    // 2. Calcular Flujo Reciente (Últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const timestamp30DaysAgo = Timestamp.fromDate(thirtyDaysAgo);

    const recentMovementsQuery = query(
      collection(db, "inventory_movements"),
      where("userId", "==", user.uid),
      where("timestamp", ">=", timestamp30DaysAgo)
    );
    const recentSnapshot = await getDocs(recentMovementsQuery);

    let tempInflow = 0;
    let tempOutflow = 0;

    recentSnapshot.forEach(doc => {
      const move = doc.data();
      if (move.tipo === 'entrada' && !move.esMovimientoInicial) {
        tempInflow += Math.abs(move.cantidad);
      } else if (move.tipo === 'salida') {
        tempOutflow += Math.abs(move.cantidad);
      }
    });

    recentInflow.value = tempInflow;
    recentOutflow.value = tempOutflow;

  } catch (error) {
    console.error("Error calculando informe Kardex:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* Hereda el fondo oscuro de .inventario-container */

.informe-view {
  padding-top: 1.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  /* Asegura que el contenido no quede tapado por la barra inferior */
  padding-bottom: 85px !important; 
}

.page-title {
  color: #000000;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  margin-top: 0;
}

.loading-container {
  text-align: center;
  color: #e0e0e0;
  margin-top: 3rem;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

/* --- SECCIÓN 1: Tarjetas de Métricas --- */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.2rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.metric-icon {
  font-size: 2rem;
  margin-right: 1rem;
  opacity: 0.8;
}

.metric-info h3 {
  margin: 0 0 0.3rem 0;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.big-number {
  margin: 0;
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--text-dark);
  line-height: 1.1;
}

.metric-info small {
  font-size: 0.7rem;
  color: #999;
}

/* Colores temáticos sutiles para las tarjetas */
.metric-card.valor .big-number { color: var(--primary-color); }
.metric-card.unidades .big-number { color: var(--accent-color); }


/* --- ESTILOS GENERALES PARA TARJETAS DE GRÁFICOS --- */
.chart-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  color: var(--text-dark);
}

.chart-card h3 {
  margin-top: 0;
  margin-bottom: 0.3rem;
  font-size: 1.1rem;
}

.chart-subtitle {
  margin: 0 0 1.2rem 0;
  font-size: 0.85rem;
  color: #777;
}


/* --- SECCIÓN 2: Gráfico de Barras de Flujo --- */
.balance-chart-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.balance-row {
  display: flex;
  align-items: center;
}

.label {
  width: 95px;
  font-size: 0.9rem;
  font-weight: 500;
  flex-shrink: 0;
}

.bar-container {
  flex-grow: 1;
  background-color: #f0f0f0;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
}

.bar {
  height: 100%;
  /* Asegúrate de que esto exista */
  transition: width 1s ease-out;
  /* A veces ayuda definir un ancho inicial */
  width: 0%; 
}

.bar.in { background-color: var(--success-color); } /* Verde para entradas */
.bar.out { background-color: var(--error-color); } /* Rojo para salidas */

.bar-value {
  position: absolute;
  right: 10px;
  font-size: 0.85rem;
  font-weight: bold;
  color: #555;
}


/* --- SECCIÓN 3: Gráfico de Dona de Salud --- */
.stock-health-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.health-info {
  flex: 1;
}

.health-legend {
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
  color: #555;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}
.dot.critical { background-color: var(--error-color); }
.dot.okay { background-color: #e0e0e0; }

/* Estilos del SVG */
.donut-chart-wrapper {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  margin-left: 1rem;
}

.simple-donut {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg); /* Empezar desde arriba */
}

.donut-ring {
  fill: none;
  stroke: #e0e0e0; /* Color de fondo del anillo */
  stroke-width: 3;
}

.donut-segment {
  fill: none;
  stroke: var(--error-color); /* Color de la sección crítica */
  stroke-width: 3;
  stroke-linecap: round; /* Bordes redondeados al final del segmento */
  transition: stroke-dasharray 1s ease-out;
}

.donut-text {
  fill: var(--text-dark);
  font-family: sans-serif;
  font-size: 0.6em;
  text-anchor: middle;
  transform: rotate(90deg); /* Contrarrestar la rotación del SVG */
  transform-origin: center;
  font-weight: bold;
}


/* --- NUEVA SECCIÓN: Estilos para el Botón Excel y Toast --- */

.download-section {
  margin-top: 2rem;
  margin-bottom: 1rem;
  position: relative; /* Necesario para posicionar el toast */
}

.excel-button {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  /* Color verde estilo Excel */
  background-color: #107c41; 
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem; /* Espacio entre icono y texto */
  box-shadow: 0 4px 6px rgba(16, 124, 65, 0.3);
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.excel-button:hover {
  background-color: #0c5e31; /* Un verde un poco más oscuro al pasar el mouse */
}

.excel-button:active {
  transform: scale(0.98); /* Pequeño efecto de presión */
}

/* ESTILOS DEL MENSAJE FLOTANTE (Copiados de ConfiguracionView para consistencia) */
.toast-message {
  position: absolute;
  bottom: 110%; /* Lo coloca justo encima del botón */
  left: 50%;
  transform: translateX(-50%); /* Centrado horizontal */
  background-color: rgba(50, 50, 50, 0.95); /* Fondo oscuro semi-transparente */
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 30px;
  font-size: 0.9rem;
  white-space: nowrap; 
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  z-index: 10; 
  pointer-events: none; 
}

/* Animaciones de entrada/salida para el toast */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px); /* Un pequeño desplazamiento hacia abajo */
}


/* --- RESPONSIVE --- */
@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .stock-health-card {
    flex-direction: column;
    text-align: center;
  }
  .health-legend {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .donut-chart-wrapper {
    margin-left: 0;
  }
}
</style>