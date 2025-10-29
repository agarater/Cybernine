// src/firebase/config.js

// Importa las funciones que necesitas de los SDKs
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Opcional, lo puedes dejar o quitar
import { getAuth } from "firebase/auth";           // Herramienta para autenticación (login)
import { getFirestore } from "firebase/firestore"; // Herramienta para la base de datos

// La configuración de TU aplicación web que te dio Firebase
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

// Inicia y exporta los servicios que usarás en tu app
export const auth = getAuth(app);
export const db = getFirestore(app);

// const analytics = getAnalytics(app); // Esto es para analíticas de uso, por ahora no lo necesitas para que la app funcione.