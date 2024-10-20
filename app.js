import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true })); // Necesario para procesar formularios

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

// Ruta para mostrar el formulario HTML
app.get('/', (req, res) => {
    const formHTML = `
    <html>
      <head>
        <title>Recomendador de Videojuegos</title>
      </head>
      <body>
        <h1>Recomendaciones personalizadas de videojuegos en Steam</h1>
        <form action="/recommend" method="POST">
          
          <label for="genre">¿Qué género de videojuego estás buscando?</label><br>
          <p>Especifica el tipo de juego que te interesa, como acción, aventura, RPG, estrategia, etc. Esto ayudará al modelo a seleccionar juegos dentro de esa categoría.</p>
          <input type="text" name="genre" id="genre" required><br><br>

          <label for="favorite">¿Cuál es tu juego favorito?</label><br>
          <p>Menciona tu juego favorito. Esto permitirá al modelo entender mejor tus gustos y encontrar juegos similares que podrían interesarte.</p>
          <input type="text" name="favorite" id="favorite" required><br><br>

          <label for="type">¿Qué tipo de juego estás buscando (online, mundo abierto, singleplayer, etc.)?</label><br>
          <p>Indica si prefieres juegos online, de mundo abierto, para un solo jugador o cualquier otra característica importante. Esto ayudará al modelo a filtrar juegos de acuerdo a tu estilo de juego.</p>
          <input type="text" name="type" id="type" required><br><br>

          <button type="submit">Enviar</button>
        </form>
      </body>
    </html>
    `;
    res.send(formHTML);  // Enviar el HTML como respuesta
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

        // Convierte la respuesta en una lista HTML
        const gamesList = aiResponse
            .split('\n')  // Asume que cada juego está separado por una nueva línea
            .filter(line => line.trim() !== '')  // Elimina líneas vacías
            .map(game => `<li>${game}</li>`)     // Convierte cada línea en un elemento de lista
            .join('');                          // Une todos los elementos de lista

        // Muestra las recomendaciones en la página web en formato de lista
        res.send(`
          <html>
            <head><title>Recomendaciones</title></head>
            <body>
              <h1>Recomendaciones basadas en tus respuestas</h1>
              <ul>${gamesList}</ul>  <!-- Muestra las recomendaciones como una lista -->
              <a href="/">Volver al formulario</a>
            </body>
          </html>
        `);
    } catch (error) {
        console.error("Error al procesar el chat:", error);
        res.status(500).send("Ocurrió un error al obtener recomendaciones.");
    }
});

// Configurar el servidor para que escuche en el puerto 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
