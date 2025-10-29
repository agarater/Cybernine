// src/firebase/config.js (La versión COMPLETA con emuladores)

import { initializeApp } from "firebase/app";
// Importa las funciones para conectar a los emuladores
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"; // ¡Importante!

// La configuración de TU aplicación web (lee desde .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Inicia Firebase
const app = initializeApp(firebaseConfig);

// --- ¡ESTA ES LA PARTE QUE FALTABA! ---
// Inicia y EXPORTA los tres servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app); // <-- ¡AHORA SÍ EXISTE!

// --- ¡Y ESTE ES EL BLOQUE MÁGICO! ---
// Detecta si estamos en modo local (ej. npm run dev)
if (window.location.hostname === "localhost") {
  console.warn("¡MODO EMULADOR ACTIVADO! Conectando a servicios locales...");

  // Conecta al Emulador de Autenticación
  connectAuthEmulator(auth, "http://localhost:9099");

  // Conecta al Emulador de Firestore
  connectFirestoreEmulator(db, 'localhost', 8080);

  // Conecta al Emulador de Funciones (IA)
  connectFunctionsEmulator(functions, "localhost", 5001);
}