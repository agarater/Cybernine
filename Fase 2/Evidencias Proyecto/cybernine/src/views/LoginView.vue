<template>
  <div class="login-container">
    <div class="login-header">
      <img src="/logo.png" alt="Logo de la Aplicación" class="app-logo" />
      <h1 class="app-title">Bienvenido</h1>
    </div>

    <form @submit.prevent="handleLogin" class="login-form">
      <div class="input-group">
        <label for="email" class="input-label">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          v-model="email"
          placeholder="tu@correo.com"
          required
          class="login-input"
        />
      </div>

      <div class="input-group">
        <label for="password" class="input-label">Contraseña</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="••••••••"
          required
          class="login-input"
        />
      </div>

      <div class="form-options">
        <label class="remember-me">
          <input type="checkbox" v-model="rememberMe" />
          Recordarme
        </label>
        <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
      </div>

      <button type="submit" class="login-button">Iniciar Sesión</button>
    </form>

    <div class="social-login">
      <p class="social-text">O inicia sesión con</p>
      <div class="social-buttons">
        <button class="social-button google">
          <img src="/google-icon.svg" alt="Google" class="social-icon" />
          Google
        </button>
        <button class="social-button apple">
          <img src="/apple-icon.svg" alt="Apple" class="social-icon" />
          Apple
        </button>
      </div>
    </div>

    <div class="signup-link">
      ¿No tienes una cuenta? <a href="#" @click.prevent="handleRegister" class="signup-text">Regístrate</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// --- 1. IMPORTACIONES AÑADIDAS ---
import { auth } from '@/firebase/config'; // Tu conexión a Firebase
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth'; // Las funciones específicas de autenticación
import { useRouter } from 'vue-router'; // Para redirigir al usuario

// --- 2. VARIABLES DEL NUEVO LOGIN ---
const email = ref('');
const password = ref('');
const rememberMe = ref(false); // Por ahora no usaremos esta, pero la dejamos

// --- 3. INICIALIZAMOS EL ROUTER ---
const router = useRouter();

// --- 4. FUNCIÓN DE LOGIN (LÓGICA FUSIONADA) ---
const handleLogin = async () => {
  try {
    // Usamos la función de Firebase para iniciar sesión
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log("¡Inicio de sesión exitoso!", userCredential.user);
    // Redirigimos al usuario a la página de inventario
    router.push('/inventario');
  } catch (error) {
    // Si algo sale mal, mostramos una alerta
    console.error("Error al iniciar sesión:", error.message);
    alert("Error al iniciar sesión: " + error.code);
  }
};

// --- 5. FUNCIÓN DE REGISTRO (LÓGICA ADAPTADA) ---
const handleRegister = async () => {
  try {
    // Usamos la función de Firebase para crear un usuario
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    console.log("¡Usuario registrado con éxito!", userCredential.user);
    // Redirigimos al nuevo usuario a la página de inventario
    router.push('/inventario'); 
  } catch (error) {
    // Si algo sale mal, mostramos una alerta
    console.error("Error al registrar:", error.message);
    alert("Error al registrar: " + error.code);
  }
};
</script>

<style scoped>


.login-container {
  background-color: var(--card-dark);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  padding: 40px 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

/* Efecto de fondo sutil */
.login-container::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  background: radial-gradient(circle at top left, rgba(67, 104, 155, 0.2) 0%, transparent 50%),
              radial-gradient(circle at bottom right, rgba(29, 58, 102, 0.2) 0%, transparent 50%);
  z-index: 0;
  opacity: 0.7;
  pointer-events: none;
}

.login-header {
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.app-logo {
  width: auto; /* Ocupará el ancho natural de la imagen */
  max-width: 150px; /* Limita el ancho para que no sea enorme */
  height: auto; /* Mantiene la proporción de la imagen */
  border-radius: 0; /* ¡QUITAMOS el borde redondo! */
  object-fit: contain; /* Asegura que la imagen se vea completa dentro de su espacio */
  margin-bottom: 15px;
  border: none; /* Quitamos el borde verde */
  box-shadow: none; /* Quitamos la sombra */
}

/* Esto es un bkp del "app-logo" en caso de querer dejarlo con un circulo
.app-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 2px solid var(--primary-color);
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.4);
}
*/

.app-title {
  font-size: 2.2em;
  font-weight: 700;
  color: var(--text-light);
  letter-spacing: 1px;
  margin: 0;
}

.login-form {
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-label {
  display: block;
  font-size: 0.9em;
  color: var(--text-dark);
  margin-bottom: 8px;
  font-weight: 500;
}

.login-input {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--input-bg);
  color: var(--text-light);
  font-size: 1em;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.login-input::placeholder {
  color: #7f8c8d;
}

.login-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
  background-color: #0a2542; /* Un poco más claro al enfocar */
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 0.9em;
  position: relative;
  z-index: 1;
}

.remember-me {
  color: var(--text-dark);
  display: flex;
  align-items: center;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color); /* Color del checkbox */
}

.forgot-password {
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  letter-spacing: 0.5px;
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.login-button:hover {
  background-color: var(--button-hover);
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.social-login {
  margin-top: 30px;
  position: relative;
  z-index: 1;
}

.social-text {
  color: var(--text-dark);
  margin-bottom: 20px;
  font-size: 0.9em;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-text::before,
.social-text::after {
  content: '';
  flex-grow: 1;
  height: 1px;
  background: var(--border-color);
  margin: 0 15px;
}

.social-buttons {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap; /* Para que los botones se adapten en pantallas pequeñas */
}

.social-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--input-bg);
  color: var(--text-light);
  font-size: 0.95em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px; /* Asegura un tamaño mínimo en móvil */
}

.social-button .social-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.social-button.google:hover {
  background-color: #db4437; /* Google red */
  border-color: #c23321;
}

.social-button.apple:hover {
  background-color: #000000; /* Apple black */
  border-color: #333333;
}

.signup-link {
  margin-top: 35px;
  font-size: 0.9em;
  color: var(--text-dark);
  position: relative;
  z-index: 1;
}

.signup-text {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.signup-text:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

/* Media Queries para Responsividad */
@media (max-width: 500px) {
  .login-container {
    padding: 30px 20px;
    margin: 15px; /* Pequeño margen para no pegarse a los bordes */
  }

  .app-logo {
    width: 70px;
    height: 70px;
  }

  .app-title {
    font-size: 1.8em;
  }

  .social-buttons {
    flex-direction: column; /* Apilar los botones en pantallas muy pequeñas */
  }

  .social-button {
    width: 100%; /* Ocupar todo el ancho disponible */
  }
}

@media (max-width: 350px) {
  .login-container {
    padding: 25px 15px;
  }

  .app-logo {
    width: 60px;
    height: 60px;
  }

  .app-title {
    font-size: 1.6em;
  }

  .input-label,
  .form-options,
  .social-text,
  .signup-link {
    font-size: 0.85em;
  }

  .login-button {
    font-size: 1em;
    padding: 12px;
  }
}
</style>