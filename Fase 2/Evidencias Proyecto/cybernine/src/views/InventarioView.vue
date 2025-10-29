<template>
  <div>
    <h1>Registro de Inventario</h1>

    <div class="scan-section">
      <label for="barcode">Código de Barras:</label>
      <input
        type="text"
        id="barcode"
        v-model="scannedCode"
        placeholder="Ingresa o escanea el código"
        @keyup.enter="buscarProducto" 
      />
      <button @click="buscarProducto" :disabled="!scannedCode">Buscar</button>
      <button @click="showScanner = true" class="scan-button">Escanear</button>
      <p v-if="lookupError" class="error-message">{{ lookupError }}</p>
    </div> <BarcodeScanner 
      v-if="showScanner" 
      @code-scanned="handleCodeScanned" 
      @scanner-closed="showScanner = false"
    /> 
    <hr />

    <div v-if="uiState !== 'initial'" class="product-form">

      <div v-if="uiState === 'newProduct'" class="new-product-fields">
        <h3>¡Producto Nuevo! Registra sus datos:</h3>
        <input type="text" placeholder="Producto (Ej: Leche)" v-model="productData.nombre" required />
        <input type="text" placeholder="Presentación (Ej: Entera Soprole 1L)" v-model="productData.presentacion" required />
        <input type="text" placeholder="Marca (Opcional)" v-model="productData.marca" />
      </div>

      <div v-if="uiState === 'productFound'" class="found-product-info">
        <h3>Producto Encontrado:</h3>
        <p><strong>{{ productData.nombre }}</strong> - {{ productData.presentacion }}</p>
        <p v-if="productData.marca">Marca: {{ productData.marca }}</p>
      </div>

      <div class="movement-fields">
        <h3>Registrar Movimiento:</h3>
        <select v-model="movementData.tipo">
          <option value="entrada">Entrada (Compra)</option>
          <option value="salida">Salida (Venta)</option>
        </select>
        <input type="number" placeholder="Cantidad" v-model.number="movementData.cantidad" required min="1" />
        <input type="date" placeholder="Fecha Vencimiento (Opcional)" v-model="movementData.fechaVencimiento" />
        
        <button @click="registrarMovimiento" :disabled="!movementData.cantidad || saving">
          {{ saving ? 'Guardando...' : 'Registrar Movimiento' }}
        </button>
        <p v-if="saveError" class="error-message">{{ saveError }}</p>
      </div>
    </div>

    <hr v-if="uiState !== 'initial'" />
    <h2>Productos Registrados (Catálogo)</h2>
    <ul>
      <li v-for="producto in productsCatalog" :key="producto.id">
        <span>
          {{ producto.nombre }} {{ producto.presentacion }} 
          ({{ producto.marca || 'Sin marca' }}) - 
          <strong>Stock: {{ producto.calculatedStock }}</strong> 
        </span>
        <button 
          @click="ajustarStock(producto.id, producto.calculatedStock)" 
          class="adjust-button"
          :disabled="saving">
          Ajustar
        </button>
      </li>
    </ul>

    <SugerenciasIA :productos="productsCatalog" /> 

  </div>
</template>

<script setup>
// --- LIBRERÍAS EXTERNAS PRIMERO ---
// --- Importación para el lector de codigos de barra ---
import BarcodeScanner from '@/components/BarcodeScanner.vue';
import { ref, reactive, onMounted, onUnmounted } from 'vue'; // (Añadí onUnmounted que usamos antes)
import { 
  // --- REFERENCIAS ---
  collection, // Obtiene una referencia a una colección (ej: 'products', 'inventory_movements'). Como ir al cajón correcto del archivador.
  doc,        // Obtiene una referencia a un DOCUMENTO específico dentro de una colección, usando su ID (ej: el código de barras). Como apuntar a UNA carpeta específica dentro del cajón.

  // --- LECTURA DE DATOS ---
  getDoc,     // Lee UN documento UNA SOLA VEZ (necesita una referencia 'doc'). Como sacar y leer UNA carpeta.
  getDocs,    // Lee MÚLTIPLES documentos UNA SOLA VEZ (usualmente el resultado de un 'query'). Como sacar y leer VARIAS carpetas que cumplen un criterio.
  onSnapshot, // ¡El chismoso! Escucha cambios en TIEMPO REAL en un documento o query. Te avisa si algo cambia, se añade o se borra. Como tener un sensor en el cajón que te notifica al instante.

  // --- ESCRITURA DE DATOS ---
  setDoc,     // Escribe o SOBREESCRIBE un documento específico (necesita una referencia 'doc' con el ID que TÚ le das). Como crear o reemplazar UNA carpeta específica con el nombre que tú eliges. Lo usamos para el catálogo 'products'.
  addDoc,     // AÑADE un NUEVO documento a una colección (Firestore genera el ID automáticamente). Como meter una carpeta nueva al cajón y dejar que el sistema le ponga el número. Lo usamos para 'inventory_movements'.

  // --- CONSULTAS (Queries) ---
  query,      // Construye una consulta para buscar documentos. Como preparar los filtros de búsqueda.
  where,      // Añade una condición (filtro) a una consulta (ej: 'donde userId sea igual a...'). Como decir "busca solo las carpetas de este cliente".

  // --- UTILIDADES ---
  Timestamp   // Crea objetos de fecha y hora compatibles con Firestore (mejor que usar `new Date()` directamente para queries). Como usar el sello de fecha oficial del archivador.
  
} from 'firebase/firestore';

// --- ARCHIVOS INTERNOS DEL PROYECTO DESPUÉS ---
import { db, auth } from '@/firebase/config'; 
import SugerenciasIA from '@/components/SugerenciasIA.vue'; 


// --- COMENTARIOS (Opcional: moverlos fuera) ---
// ¡Importamos más herramientas de Firestore!
// setDoc: Para guardar/actualizar el catálogo
// addDoc: Para guardar movimientos

// --- ESTADO DE LA UI ---
const scannedCode = ref(''); // Código ingresado/escaneado
const uiState = ref('initial'); // 'initial', 'productFound', 'newProduct'
const lookupError = ref(''); // Mensaje de error al buscar
const saveError = ref(''); // Mensaje de error al guardar
const saving = ref(false); // Para deshabilitar botón mientras guarda
const showScanner = ref(false); // Para controlar si el escáner está visible o no

// --- DATOS DEL PRODUCTO (CATÁLOGO) ---
// Usamos 'reactive' porque es un objeto con varios campos
const productData = reactive({ 
  nombre: '',
  presentacion: '',
  marca: ''
});

// --- DATOS DEL MOVIMIENTO (KARDEX) ---
const movementData = reactive({
  tipo: 'entrada', // Por defecto es una entrada
  cantidad: null,
  fechaVencimiento: null
});

// --- LISTA DEL CATÁLOGO DE PRODUCTOS (Para mostrar abajo y pasar a la IA) ---
const productsCatalog = ref([]); 

// --- FUNCIÓN 1: Buscar Producto por Código ---
const buscarProducto = async () => {
  if (!scannedCode.value) return;
  lookupError.value = ''; // Limpia error anterior
  uiState.value = 'loading'; // (Podríamos añadir un estado de carga visual)

  try {
    const productRef = doc(db, "products", scannedCode.value); // Referencia al documento con ID = codigo
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      // Caso A: Producto Encontrado
      const data = docSnap.data();
      productData.nombre = data.nombre;
      productData.presentacion = data.presentacion;
      productData.marca = data.marca || ''; // Si no tiene marca, queda vacío
      uiState.value = 'productFound';
    } else {
      // Caso B: Producto Nuevo
      // Reseteamos los campos por si acaso
      productData.nombre = '';
      productData.presentacion = '';
      productData.marca = '';
      uiState.value = 'newProduct';
    }
    // Reseteamos el formulario de movimiento
    movementData.tipo = 'entrada';
    movementData.cantidad = null;
    movementData.fechaVencimiento = null;

  } catch (error) {
    console.error("Error buscando producto:", error);
    lookupError.value = "Error al buscar el código. Intenta de nuevo.";
    uiState.value = 'initial'; // Volvemos al estado inicial si hay error
  }
};

// --- NUEVA FUNCIÓN para manejar el código escaneado ---
const handleCodeScanned = (code) => {
  scannedCode.value = code; // Rellena el input de texto
  showScanner.value = false; // Cierra el escáner
  buscarProducto(); // ¡Ejecuta la búsqueda automáticamente!
};



// --- FUNCIÓN 2: Registrar Movimiento (Y Producto si es nuevo) ---
const registrarMovimiento = async () => {
  if (!movementData.cantidad || movementData.cantidad <= 0) {
    saveError.value = "La cantidad debe ser mayor a cero.";
    return;
  }
  if (!auth.currentUser) {
    saveError.value = "Error: Debes iniciar sesión.";
    return;
  }
  
  saving.value = true;
  saveError.value = '';

  try {
    const userId = auth.currentUser.uid;
    const timestamp = new Date(); // Fecha y hora actual

    // Paso 1 (Opcional): Si es un producto nuevo, guardarlo en el catálogo
    if (uiState.value === 'newProduct') {
      if (!productData.nombre || !productData.presentacion) {
        throw new Error("Nombre y Presentación son obligatorios para productos nuevos.");
      }
      const productRef = doc(db, "products", scannedCode.value);
      await setDoc(productRef, {
        nombre: productData.nombre,
        presentacion: productData.presentacion,
        marca: productData.marca || '',
        // Podríamos añadir 'createdAt', 'createdByUserId' si quisiéramos
      });
      console.log("Nuevo producto guardado en catálogo:", scannedCode.value);
    }

    // Paso 2: Siempre guardar el movimiento en el Kardex
    await addDoc(collection(db, "inventory_movements"), {
      productId: scannedCode.value, // El código de barras escaneado
      userId: userId, // Quién hizo el movimiento
      tipo: movementData.tipo, // 'entrada' o 'salida'
      cantidad: movementData.cantidad,
      fechaVencimiento: movementData.fechaVencimiento || null, // Guarda null si está vacío
      timestamp: timestamp, // Cuándo se registró
      // Podríamos añadir 'costoUnitario' si fuera una entrada, etc.
    });

    console.log("Movimiento registrado:", movementData);

    // ¡Éxito! Limpiamos todo para el siguiente escaneo
    scannedCode.value = '';
    uiState.value = 'initial';
    // No reseteamos productData ni movementData aquí, buscarProducto lo hace

  } catch (error) {
    console.error("Error al registrar movimiento:", error);
    saveError.value = "Error al guardar: " + error.message;
  } finally {
    saving.value = false;
  }
};

// --- FUNCIÓN 3: Cargar Catálogo (Para la lista y la IA) ---
// (Esta se ejecuta al cargar la página)
// src/views/InventarioView.vue -> <script setup>

// --- FUNCIÓN 3: Cargar Catálogo Y CALCULAR STOCK (Versión Mejorada) ---
onMounted(() => {
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;

    // 1. Escuchamos cambios en el catálogo ('products')
    const productsQuery = query(collection(db, "products")); 
    const unsubscribeProducts = onSnapshot(productsQuery, (productSnapshot) => {
      const catalogTemp = [];
      productSnapshot.forEach((doc) => {
        catalogTemp.push({ 
          id: doc.id, 
          ...doc.data(),
          calculatedStock: 0 // Añadimos un campo inicial para el stock
        });
      });
      // Actualizamos el catálogo base, pero aún sin stock calculado
      productsCatalog.value = catalogTemp; 
      // ¡Llamamos a recalcular stock CADA VEZ que el catálogo cambie!
      recalculateAllStock(); 
    });

    // 2. Escuchamos cambios en los movimientos ('inventory_movements') del usuario
    const movementsQuery = query(collection(db, "inventory_movements"), where("userId", "==", userId));
    const unsubscribeMovements = onSnapshot(movementsQuery, (movementSnapshot) => {
      // ¡Llamamos a recalcular stock CADA VEZ que los movimientos cambien!
      recalculateAllStock();
    });

    // Guardamos las funciones de desuscripción para limpiar al salir (buena práctica)
    // onUnmounted(() => {
    //   unsubscribeProducts();
    //   unsubscribeMovements();
    // });
  }
});

// --- NUEVA FUNCIÓN AUXILIAR: Recalcular TODO el Stock ---
// Esta función se llamará cada vez que cambie el catálogo o los movimientos
const recalculateAllStock = async () => {
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;

  // Hacemos una copia temporal para no mutar reactivamente mientras calculamos
  const currentCatalog = JSON.parse(JSON.stringify(productsCatalog.value)); 
  if (currentCatalog.length === 0) return; // Si no hay catálogo, no hay nada que calcular

  try {
    // Leemos TODOS los movimientos del usuario UNA SOLA VEZ
    const movementsQuery = query(collection(db, "inventory_movements"), where("userId", "==", userId));
    const movementSnapshot = await getDocs(movementsQuery); // Usamos getDocs para leer una vez
    
    const movementsByProduct = {}; // Objeto para agrupar movimientos por producto

    movementSnapshot.forEach(doc => {
      const movement = doc.data();
      if (!movementsByProduct[movement.productId]) {
        movementsByProduct[movement.productId] = [];
      }
      movementsByProduct[movement.productId].push(movement);
    });

    // Ahora, calculamos el stock para cada producto en el catálogo
    const updatedCatalog = currentCatalog.map(product => {
      let stock = 0;
      const productMovements = movementsByProduct[product.id] || []; // Movimientos de ESTE producto

      productMovements.forEach(move => {
        if (move.tipo === 'entrada') {
          stock += move.cantidad;
        } else if (move.tipo === 'salida') {
          stock -= move.cantidad;
        } else if (move.tipo === 'ajuste') {
          // Para ajustes, necesitamos saber el stock *antes* del ajuste.
          // Esto se complica. Simplifiquemos por ahora: 
          // Si el último movimiento fue un ajuste, ese es el stock. 
          // ¡¡ESTO ES UNA SIMPLIFICACIÓN PELIGROSA!! 
          // La forma correcta requiere ordenar por fecha y calcular secuencialmente.
          // Por ahora, asumamos que 'ajuste' REEMPLAZA el stock. (Lo arreglaremos si da problemas)
          // -> Mejor aún: Calculemos la diferencia que causó el ajuste.
          //    Necesitaríamos el stock *antes* del ajuste.
          // -> **LA FORMA MÁS SIMPLE Y AUDITABLE:** El ajuste es un movimiento más.
          //    Si cantidad es +5, suma 5. Si es -3, resta 3.
          //    El usuario debe ingresar la DIFERENCIA, no el total.
          // *** CAMBIO DE PLAN: El ajuste registrará la DIFERENCIA ***

          // *** NO NECESITAMOS LÓGICA ESPECIAL AQUÍ ***
          // Un ajuste con cantidad +5 se trata como entrada.
          // Un ajuste con cantidad -3 se trata como salida (si lo permitimos).
          // O siempre cantidad positiva y el 'tipo' dice si suma o resta.
          // *** MANTENGAMOS: tipo='ajuste', cantidad=DIFERENCIA (+/-) ***
           stock += move.cantidad; // El ajuste suma o resta la diferencia directamente
        }
      });
      
      return { ...product, calculatedStock: stock };
    });

    // Actualizamos el catálogo reactivo final con los stocks calculados
    productsCatalog.value = updatedCatalog;

  } catch (error) {
    console.error("Error recalculando stock:", error);
  }
};


// --- NUEVA FUNCIÓN 4: Ajustar Stock Manualmente ---
const ajustarStock = async (productId, currentCalculatedStock) => {
  if (!auth.currentUser) {
    alert("Debes iniciar sesión.");
    return;
  }
  
  const newTotalStockStr = prompt(`Stock actual de ${productId} es: ${currentCalculatedStock}. Ingresa la NUEVA cantidad TOTAL:`);
  
  if (newTotalStockStr === null) return; // El usuario canceló

  const newTotalStock = parseInt(newTotalStockStr);

  if (isNaN(newTotalStock) || newTotalStock < 0) {
    alert("Cantidad inválida. Ingresa un número positivo o cero.");
    return;
  }

  // Calculamos la diferencia
  const diferencia = newTotalStock - currentCalculatedStock;

  if (diferencia === 0) {
    alert("No hay cambios en el stock.");
    return;
  }

  // Guardamos el movimiento de ajuste
  saving.value = true; // (Reutilizamos la variable 'saving' para feedback visual)
  saveError.value = ''; 
  try {
    await addDoc(collection(db, "inventory_movements"), {
      productId: productId,
      userId: auth.currentUser.uid,
      tipo: 'ajuste', // Nuevo tipo de movimiento
      cantidad: diferencia, // ¡Guardamos la diferencia! (+ o -)
      timestamp: Timestamp.now(), // Usamos el timestamp del servidor
      motivo: 'Ajuste manual' // Podemos añadir un motivo
    });
    console.log(`Ajuste registrado para ${productId}: ${diferencia}`);
    // No necesitamos hacer nada más, el 'onSnapshot' de movimientos 
    // detectará el cambio y llamará a 'recalculateAllStock' automáticamente.
  } catch (error) {
    console.error("Error al registrar ajuste:", error);
    saveError.value = "Error al guardar el ajuste: " + error.message;
  } finally {
    saving.value = false;
  }
};


</script>

<style scoped>
.scan-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px; /* Espacio entre elementos */
}
.scan-section label {
  font-weight: bold;
}
.scan-section input {
  flex-grow: 1; /* El input ocupa el espacio sobrante */
  padding: 8px;
}
.scan-section button {
   padding: 8px 12px;
}

.product-form {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.new-product-fields, .movement-fields {
  margin-bottom: 20px;
}
.new-product-fields input, .movement-fields input, .movement-fields select {
  display: block;
  width: 95%;
  padding: 8px;
  margin-bottom: 10px;
}

.found-product-info {
  background-color: #e7f3ff;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  border: 1px solid #b3d7ff;
}
.found-product-info h3 { margin-top: 0;}
.found-product-info p { margin: 5px 0; }

h3 {
  color: black; 
}
hr { margin: 20px 0; }
ul { list-style-type: none; padding: 0; }

li {
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ddd;
  margin-bottom: 5px;
  border-radius: 5px;
  color: black;
  display: flex; /* Para poner el texto y el botón en línea */
  justify-content: space-between; /* Empuja el botón a la derecha */
  align-items: center; /* Centra verticalmente */
}
.error-message {
  color: #d9534f; /* Rojo bootstrap */
  font-size: 0.9em;
  margin-top: 5px;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.adjust-button {
  padding: 5px 10px;
  font-size: 0.8em;
  margin-left: 10px; /* Espacio entre el texto y el botón */
  /* Puedes añadir más estilos si quieres (color, borde, etc.) */
  background-color: #f0ad4e; /* Naranja bootstrap */
  color: white;
  border: none;
  border-radius: 4px;
}
.adjust-button:disabled {
  background-color: #ccc;
}


/* Heredamos los botones bonitos del login, si están en main.css */
button { 
  /* Si no tienes estilos globales de botón, añade aquí: */
  /* background-color: var(--primary-color); */
  /* color: white; */
  /* border: none; */
  /* border-radius: 5px; */
  /* cursor: pointer; */
}

.scan-button {
  padding: 8px 10px;
  background-color: var(--secondary-color); /* Azul */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer; /* Añadido para que parezca botón */
}
.scan-button:hover { /* Efecto hover opcional */
  opacity: 0.9;
}
</style>