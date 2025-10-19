// src/firebase/config.js

// Importa las funciones que necesitas de los SDKs
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Opcional, lo puedes dejar o quitar
import { getAuth } from "firebase/auth";           // Herramienta para autenticación (login)
import { getFirestore } from "firebase/firestore"; // Herramienta para la base de datos

// La configuración de TU aplicación web que te dio Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD9M_TicmT7w6CINBenAxvTuKgvQOGK1WE",
  authDomain: "cybernine-2025.firebaseapp.com",
  projectId: "cybernine-2025",
  storageBucket: "cybernine-2025.firebasestorage.app",
  messagingSenderId: "895498127771",
  appId: "1:895498127771:web:5378c33075170c0fff793e",
  measurementId: "G-JNFPC4M3DZ"
};

// Inicia Firebase
const app = initializeApp(firebaseConfig);

// Inicia y exporta los servicios que usarás en tu app
export const auth = getAuth(app);
export const db = getFirestore(app);

// const analytics = getAnalytics(app); // Esto es para analíticas de uso, por ahora no lo necesitas para que la app funcione.