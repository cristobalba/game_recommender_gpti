import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import readline from 'readline'; // Importa el módulo readline

dotenv.config();

const app = express();

let lastResponse = "Escribe tu pregunta sobre videojuegos de Steam: ";

app.get('/', (req, res) => {
    res.send(lastResponse); // Envía la última respuesta almacenada
});

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
                        comunidad de Steam. Tienes un conocimiento profundo sobre las 
                        tendencias actuales en la industria, los mejores juegos en diferentes 
                        géneros, las ofertas especiales en Steam y cómo los usuarios pueden 
                        aprovechar al máximo su experiencia en la plataforma. Conoces los 
                        géneros de juegos más populares en Steam, como acción, aventura, RPG, 
                        estrategia, simulación, etc.  Ofrece recomendaciones personalizadas basadas 
                        en los intereses y preferencias del usuario. Pregunta sobre su estilo de 
                        juego y qué tipo de experiencias busca. Mantente actualizado sobre los 
                        últimos lanzamientos, actualizaciones de juegos populares y tendencias 
                        emergentes en la comunidad de jugadores de Steam. Mantén un tono amigable y 
                        accesible, pero asegúrate de que la información sea precisa y útil. 
                        Utiliza un lenguaje claro y evita jerga excesiva, a menos que sea relevante 
                        y se explique adecuadamente.`
});

// Configuración de readline para leer entradas de la terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para manejar el chat
async function handleChat(userInput) {
    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: userInput }],
            }
        ],
    });

    const result = await chat.sendMessage(userInput); // Envía el mensaje del usuario a la IA
    console.log(result.response.text()); // Muestra la respuesta en la terminal
    lastResponse = lastResponse + "\n" + result.response.text(); // Actualiza la última respuesta
}

const port = 3000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log("Escribe tu pregunta sobre videojuegos de Steam: ");

    // Leer entradas de la terminal
    rl.on('line', async (input) => {
        await handleChat(input); // Procesa la entrada del usuario
    });
});