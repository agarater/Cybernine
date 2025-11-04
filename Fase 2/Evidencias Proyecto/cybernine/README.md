# Vue 3 + Vite

# Cybernine_C9: Sistema de Gestión de Inventario para Comercios de Barrio (PWA)

## Resumen del Proyecto

**Cybernine_C9** es una **Progressive Web App (PWA)** diseñada para la digitalización simple y accesible del inventario en pequeños comercios y almacenes de barrio. El proyecto tiene como objetivo reemplazar los métodos manuales de control de stock (cuaderno y lápiz) por una solución digital intuitiva, accesible desde cualquier dispositivo (móvil, tablet, PC) y enriquecida con capacidades de Inteligencia Artificial para la toma de decisiones.

## Características Clave

* **PWA Multi-dispositivo:** Acceso unificado desde cualquier navegador o como aplicación instalable en Android e iOS, eliminando barreras de descarga y reduciendo costos de desarrollo.
* **Gestión de Catálogo Inteligente:** Registro y mantenimiento de productos utilizando el código de barras como identificador único.
* **Control de Movimientos de Inventario:** Registro ágil de entradas, salidas y ajustes de stock.
* **Escáner Integrado:** Captura de códigos de barras mediante la cámara del dispositivo (`html5-qrcode`).
* **Kardex y Reportes:** Visualización y exportación del historial de movimientos por producto para un control detallado.
* **Asistente Proactivo (Sra. MarIA):** Integración de IA (`gemini-2.5-flash` vía Cloud Functions) para ofrecer sugerencias accionables sobre stock y optimización comercial.
* **Autenticación Segura:** Sistema de registro e inicio de sesión gestionado por Firebase Authentication para garantizar la privacidad y seguridad de los datos de cada usuario.

## Tecnologías Utilizadas

### Frontend (Capas de Presentación y Lógica Cliente)

* **Framework:** `Vue.js 3` con `<script setup>` para un desarrollo reactivo y modular.
* **Construcción:** `Vite` como herramienta de construcción rápida y optimizada.
* **Lenguajes:** `HTML5`, `CSS3`, `JavaScript (ES6+)`.
* **Escáner:** `html5-qrcode` para la integración de la cámara y reconocimiento de códigos de barras.
* **Persistencia Local:** `localStorage` para guardar preferencias del usuario (ej., cámara seleccionada).
* **PWA:** Implementación de Service Workers y Web App Manifest para la funcionalidad de Aplicación Web Progresiva.

### Backend (Servicios Gestionados de Firebase)

* **Plataforma BaaS:** `Firebase` (Google Cloud Platform) como la base de nuestra infraestructura.
* **Alojamiento:** `Firebase Hosting` para el despliegue y servicio seguro de la PWA.
* **Autenticación:** `Firebase Authentication` para la gestión robusta de usuarios.
* **Base de Datos NoSQL:** `Cloud Firestore` para la persistencia de datos (colecciones `products` y `inventory_movements`).
* **Funciones Serverless:** `Firebase Cloud Functions` para la lógica de backend (ej., `getAISuggestion` para la IA).

### Inteligencia Artificial

* **Proveedor:** `Google AI Studio` (parte de Google Cloud).
* **Modelo:** `gemini-2.5-flash` para la generación de texto y sugerencias.

## Instalación y Uso Local

Para levantar el proyecto en tu entorno de desarrollo:

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DE_TU_REPOSITORIO>
    cd cybernine_c9
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
    o
    ```bash
    yarn
    ```

3.  **Configurar Firebase:**
    * Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
    * Crea una aplicación web y obtén tus credenciales.
    * Crea un archivo `.env` en la raíz del proyecto y añade tus variables de entorno. Consulta `README.md` para un ejemplo.
    * Configura Firestore (colecciones `products`, `inventory_movements`) y Cloud Functions (función `getAISuggestion`).
    * Crea un proyecto en [Google AI Studio](https://aistudio.google.com/) y genera una API Key para el modelo `gemini-2.5-flash`. Asegúrate de habilitar la API de Gemini en Google Cloud.

4.  **Ejecutar el proyecto en modo desarrollo:**
    ```bash
    npm run dev
    ```
    o
    ```bash
    yarn dev
    ```
    La aplicación se iniciará en `http://localhost:5173`.

5.  **Desplegar Cloud Functions (si modificas el backend):**
    ```bash
    firebase deploy --only functions
    ```

## Despliegue en Producción

Para desplegar la aplicación en Firebase Hosting:

1.  **Construir la aplicación para producción:**
    ```bash
    npm run build
    ```
    o
    ```bash
    yarn build
    ```
    Esto generará los archivos optimizados en la carpeta `dist/`.

2.  **Desplegar en Firebase Hosting:**
    ```bash
    firebase deploy --only hosting
    ```
    Tu PWA estará accesible en la URL de Firebase Hosting configurada (`<YOUR_PROJECT_ID>.web.app`).

## Referencias Adicionales

* [Vue.js 3 Documentation](https://vuejs.org/guide/introduction.html)
* [Vite Documentation](https://vitejs.dev/guide/)
* [Firebase Documentation](https://firebase.google.com/docs)
* [Google AI Studio Documentation](https://developers.generativeai.google/guide)

---

**Comentarios de Ayuda Formal / Referencias de Uso:**

* **Estructura Completa:** Este `README.md` sigue una estructura estándar para proyectos de software, lo que facilita la comprensión y el uso por parte de cualquier lector (evaluador, futuro desarrollador, etc.).
* **Secciones Claras:** Cada sección (`Resumen`, `Características`, `Tecnologías`, `Instalación`, `Despliegue`, `Referencias`) tiene un propósito definido.
* **Detalle Tecnológico:** Nombra explícitamente las tecnologías y sus roles, lo cual es fundamental para tu informe técnico.
* **Instrucciones Concretas:** La sección de "Instalación y Uso Local" proporciona pasos claros para que cualquier persona pueda configurar y ejecutar el proyecto. Incluye un paso crítico sobre la configuración de `.env` y las claves de Firebase/AI.
* **Enlaces a Documentación Oficial:** Las referencias adicionales son cruciales para que los interesados puedan profundizar en cualquier tecnología.

Este `README.md` es importante mantenerlo actualizado, favor si realiza algún cambio, actualizar los detalles del proyecto y/o README.md

# -------------------------------------------------------------------------

# This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs]
# (https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

# Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
