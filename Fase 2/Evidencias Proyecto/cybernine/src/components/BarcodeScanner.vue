<template>
  <div class="scanner-container">
    <div id="reader" width="100%"></div> 
    
    <div v-if="cameras.length > 1" class="camera-selector">
      <label for="camera-select">Cámara:</label>
      <select id="camera-select" :value="selectedCameraId" @change="changeCamera($event.target.value)">
        <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
          {{ camera.label || `Cámara ${camera.id.substring(0, 4)}` }}
        </option>
      </select>
    </div>

    <button @click="stopScanning" class="stop-button">Detener Escáner</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineEmits } from 'vue';
import { Html5Qrcode } from 'html5-qrcode'; // Usamos la clase base

const emit = defineEmits(['code-scanned', 'scan-error', 'scanner-closed']);

let html5Qrcode = null; 
const cameras = ref([]); 
const selectedCameraId = ref(null); 

// --- ¡NUEVO! La llave para guardar en localStorage ---
const STORAGE_KEY = 'preferredCameraId'; 

// --- Función para iniciar/cambiar cámara ---
const startScanning = (deviceId) => {
  // Detiene el escáner anterior si existe
  if (html5Qrcode && html5Qrcode.isScanning) {
    // Usamos una promesa para asegurarnos de que se detenga antes de iniciar de nuevo
    return html5Qrcode.stop()
      .catch(err => console.warn("Error al detener para cambiar:", err)) // Solo advertencia si falla
      .finally(() => { // Siempre intenta iniciar la nueva
        html5Qrcode = null; // Resetea la instancia por si acaso
        initiateScan(deviceId); // Llama a la función que realmente inicia
      });
  } else {
    // Si no había nada corriendo, simplemente inicia
    initiateScan(deviceId);
  }
};

// --- NUEVA función separada para iniciar ---
const initiateScan = (deviceId) => {
   html5Qrcode = new Html5Qrcode("reader"); 
   const config = { 
       fps: 10, 
       qrbox: { width: 250, height: 250 } 
   };

   html5Qrcode.start(
       deviceId, 
       config,
       onScanSuccess,
       onScanFailure
   ).then(() => {
       // ¡Éxito al iniciar! Guardamos la preferencia
       selectedCameraId.value = deviceId; 
       localStorage.setItem(STORAGE_KEY, deviceId); // <-- Guardamos en localStorage
       console.log("Escáner iniciado con cámara:", deviceId);
   }).catch(err => {
       console.error(`Error al iniciar escáner con cámara ${deviceId}:`, err);
       emit('scan-error', `No se pudo iniciar la cámara seleccionada (${deviceId.substring(0,4)}...).`);
       // Si falla al iniciar, podríamos intentar con otra cámara o mostrar error
   });
};


// --- Función que maneja el cambio desde el <select> ---
const changeCamera = (newDeviceId) => {
  startScanning(newDeviceId);
};

// --- Funciones onScanSuccess y onScanFailure (sin cambios) ---
const onScanSuccess = (decodedText, decodedResult) => {
  emit('code-scanned', decodedText);
};
const onScanFailure = (error) => { /* sin cambios */ };

// --- Función stopScanning (sin cambios) ---
const stopScanning = () => {
  if (html5Qrcode && html5Qrcode.isScanning) {
    html5Qrcode.stop().then(() => {
      console.log("Escáner detenido.");
      emit('scanner-closed');
    }).catch(error => {
      console.error("Fallo al detener:", error);
      emit('scanner-closed'); 
    });
  } else {
     emit('scanner-closed');
  }
};

// --- onMounted (¡ACTUALIZADO con lógica de localStorage!) ---
onMounted(async () => {
  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length) {
      cameras.value = devices; 
      
      // --- ¡Lógica de memoria! ---
      const savedCameraId = localStorage.getItem(STORAGE_KEY); // 1. Lee la cámara guardada
      let cameraToUse = null;

      // 2. ¿Existe una guardada Y todavía está disponible en la lista actual?
      if (savedCameraId && devices.some(d => d.id === savedCameraId)) {
         cameraToUse = devices.find(d => d.id === savedCameraId);
         console.log("Usando cámara guardada:", savedCameraId);
      } else {
         // 3. Si no, busca la trasera o usa la primera
         cameraToUse = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
         console.log("Usando cámara por defecto:", cameraToUse.id);
      }
      
      // 4. Inicia el escáner con la cámara elegida
      startScanning(cameraToUse.id); 

    } else {
       emit('scan-error', 'No se encontraron cámaras.');
    }
  } catch (err) {
    console.error("Error obteniendo cámaras:", err);
    emit('scan-error', 'No se pudo acceder a las cámaras.');
  }
});

// --- onBeforeUnmount (sin cambios) ---
onBeforeUnmount(() => {
  if (html5Qrcode && html5Qrcode.isScanning) {
    html5Qrcode.stop().catch(error => {
      console.error("Fallo al limpiar al desmontar:", error);
    });
  }
});
</script>

<style scoped>
/* Tus estilos scoped se quedan igual, incluyendo .camera-selector */
.scanner-container {
  position: relative; 
  border: 1px solid #ccc;
  padding: 10px;
  background-color: black; 
  margin-bottom: 15px;
}
#reader { /* Sin cambios */ }
.camera-selector {
  position: absolute;
  top: 15px; 
  left: 15px; 
  background: rgba(0, 0, 0, 0.6);
  padding: 5px 8px;
  border-radius: 5px;
  z-index: 10;
  color: white;
  font-size: 0.8em;
}
.camera-selector label { margin-right: 5px; }
.camera-selector select {
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 3px;
  font-size: 0.9em;
}
.stop-button {
  position: absolute;
  bottom: 15px; 
  left: 50%; 
  transform: translateX(-50%); 
  padding: 8px 15px;
  background-color: rgba(217, 83, 79, 0.8); 
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 10; 
}
.stop-button:hover { background-color: #d9534f; }
</style>