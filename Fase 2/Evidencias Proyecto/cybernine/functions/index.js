// functions/index.js
// v11 - PROMPT CORREGIDO (Eliminando petición de datos históricos inexistentes)

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const {GoogleGenerativeAI} = require("@google/generative-ai");

// --- FUNCIÓN AUXILIAR ---
const extractBarcodeFromId = (fullId) => {
  if (fullId && typeof fullId === 'string' && fullId.includes('_')) {
    const parts = fullId.split('_');
    if (parts.length > 1 && parts[1]) {
       return parts[1]; 
    }
  }
  return "S/C"; 
};

/**
 * Función #1: Obtiene sugerencias de la IA (Sra. MarIA)
 */
exports.getAISuggestion = onCall({secrets: ["GOOGLEAI_KEY"]}, async (request) => {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_KEY);
  const productos = request.data.productos;

  // 1. Validación inicial
  if (!productos || productos.length === 0) {
    return {
      suggestion: "Aún no tienes productos en tu inventario. " +
        "¡Agrega algunos para que pueda ayudarte a analizarlos!",
    };
  }

  // 2. Construcción limpia de la lista de stock string
  let stockListString = "";
  productos.forEach((producto) => {
    const detalle = producto.presentacion ? ` (${producto.presentacion})` : "";
    const barcode = extractBarcodeFromId(producto.id);
    // Usamos una estructura clara: [CODIGO] Nombre (Presentacion): X unidades
    stockListString += `- [${barcode}] ${producto.nombre}${detalle}: ${producto.calculatedStock} unidades\n`;
  });

  // 3. Construcción del MEGA PROMPT CORREGIDO
  const prompt = `
ROL: Eres 'La Sra. MarIA', una asistente experta en gestión de inventario para pequeños negocios de barrio. Tu tono es profesional pero amable, directo, muy práctico y alentador. No usas jerga técnica complicada y te diriges al usuario de forma neutra (sin género).

OBJETIVO: Analiza la lista de inventario proporcionada abajo y provee sugerencias estratégicas para mejorar el flujo de caja y evitar quiebres de stock.

INSTRUCCIONES:
1. Analiza los niveles de stock actuales. Identifica lo crítico (muy poco) y el posible exceso (demasiado).
2. Prioriza las 4 acciones más importantes que el dueño debería tomar HOY.
3. FORMATO DE SALIDA: Devuelve EXACTAMENTE 4 puntos tipo viñeta.
4. Cada punto debe empezar con un emoji relevante a la acción (ej: 🚨 urgente, 📢 promocionar, ✅ mantener).
5. Sé concisa. Mantén cada sugerencia en una o dos frases cortas.
6. Cuando te refieras a un producto, usa el formato: "NombreProducto (Cód: XXXXX) tiene Y unidades".
7. Sugiere promociones coherentes si detectas exceso de stock.
8. DEFINICIÓN DE NIVELES DE STOCK (Úsala para decidir la urgencia):
   - Stock CRÍTICO (🚨): 0 a 5 unidades.
   - Stock BAJO (⚠️): 6 a 10 unidades.
   - Stock NORMAL (✅): Más de 10 unidades.

IMPORTANTE: Solo puedes basar tu análisis en la lista de stock actual proporcionada abajo. No inventes datos de ventas pasadas ni fechas.

LISTA DE STOCK ACTUAL:
${stockListString}

TUS 4 SUGERENCIAS (Empieza directamente con los emojis):
  `;

  try {
    // Usamos gemini-1.5-flash, es rápido y fiable para esto.
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpieza por si la IA añade texto introductorio no deseado
    text = text.replace(/^Here are.*:\n+/i, "").trim(); 
    text = text.replace(/^Aquí tienes.*:\n+/i, "").trim();

    return {suggestion: text};
  } catch (error) {
    console.error("Error al llamar a la IA de Google:", error);
    // El mensaje genérico que se muestra en el frontend
    throw new HttpsError("internal", "La Sra. MarIA está teniendo problemas para " +
      "conectar con su base de datos de conocimientos. Intenta de nuevo en unos momentos.");
  }
});

/**
 * Función #2: Lista los modelos disponibles (Se mantiene igual)
 */
exports.listMyModels = onRequest({secrets: ["GOOGLEAI_KEY"]}, async (req, res) => {
  try {
    const apiKey = process.env.GOOGLEAI_KEY;
    const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
    
    const apiResponse = await fetch(url);
    const data = await apiResponse.json();
    
    res.json(data);
  } catch (error) {
    console.error("Error al listar modelos:", error);
    res.status(500).send("Error al listar modelos: " + error.message);
  }
});