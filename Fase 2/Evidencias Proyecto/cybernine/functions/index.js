// functions/index.js
// v7 - Corrigiendo al modelo "2.5-flash" (de la lista)

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https"); // Mantenemos esto por ahora
const {GoogleGenerativeAI} = require("@google/generative-ai");

/**
 * Función #1: Obtiene sugerencias de la IA
 */
exports.getAISuggestion = onCall({secrets: ["GOOGLEAI_KEY"]}, async (request) => {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_KEY);
  const productos = request.data.productos;

  let prompt = "Eres un asistente experto en gestión de inventario para un " +
    "pequeño negocio de barrio. Analiza la siguiente lista de productos y " +
    "su stock actual. Dame 3 sugerencias cortas y accionables sobre qué " +
    "hacer (ej. reabastecer, promocionar, etc.).\n\nLista de Stock:\n";

  if (!productos || productos.length === 0) {
    return {
      suggestion: "Aún no tienes productos en tu inventario. " +
        "¡Agrega algunos para que pueda ayudarte a analizarlos!",
    };
  }

  productos.forEach((producto) => {
    prompt += `- ${producto.nombre}: ${producto.stock} unidades\n`;
  });

  prompt += "\nDame 3 sugerencias cortas y accionables:";

  try {
    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN FINAL! ---
    // Usamos el nombre exacto de la lista que nos diste
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return {suggestion: text};
  } catch (error) {
    console.error("Error al llamar a la IA de Google:", error);
    throw new HttpsError("internal", "No se pudo " +
      "contactar al asistente de IA en este momento.");
  }
});

/**
 * Función #2: Lista los modelos disponibles (la dejamos por ahora)
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

// ¡Línea en blanco al final!