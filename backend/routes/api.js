import express from 'express';
import model from '../services/generativeAI.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World!')
})

// Ruta para procesar las respuestas del formulario y generar recomendaciones
router.post('/recommend', async (req, res) => {
    const { genre, favorite, type } = req.body;

    // Crea el mensaje que se enviará al modelo Gemini con las respuestas del formulario
    const userInput = `
      Estoy buscando un videojuego del género ${genre}. 
      Mi juego favorito es ${favorite} y estoy buscando un juego que sea ${type}.
    `;

    try {
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: userInput }],
                }
            ],
        });

        const result = await chat.sendMessage(userInput); // Envía las respuestas del formulario al modelo de IA
        const aiResponse = result.response.text(); // Recibe la respuesta de la IA

        // Convierte la respuesta en una lista de recomendaciones
        const gamesList = aiResponse
            .split('\n')  // Asume que cada juego está separado por una nueva línea
            .filter(line => line.trim() !== '');  // Elimina líneas vacías

        // Envia la lista de recomendaciones como JSON
        res.json({
            recommendations: gamesList
        });
    } catch (error) {
        console.error("Error al procesar el chat:", error);
        res.status(500).json({ error: "Ocurrió un error al obtener recomendaciones." });
    }
});

export default router;
