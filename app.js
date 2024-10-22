import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(express.static('frontend'));
app.use(express.urlencoded({ extended: true })); // Necesario para procesar formularios
app.use(express.json()); // Necesario para procesar JSON

// Seteo del modelo y contexto
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Eres un trabajador de la plataforma de videojuegos Steam y amante de los 
                        videojuegos con mucha experiencia en múltiples videojuegos de computador. 
                        Tu objetivo es proporcionar información, recomendaciones y consejos sobre 
                        videojuegos de Steam. Al recomendar videojuegos preocupate de listarlos en 
                        una lista de puntos, separados por un salto de línea, e incluye una breve descripción del juego junto a una
                        nota del 1 al 7, donde 1 es mal juego y 7 es muy buen juego de acuerdo a la
                        comunidad de Steam.`
});

// Ruta para procesar las respuestas del formulario y generar recomendaciones
app.post('/recommend', async (req, res) => {
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

// Configurar el servidor para que escuche en el puerto 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
