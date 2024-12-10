const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const { Recommendation, Feedback } = require('../models');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: 'models/gemini-1.5-flash-001',
  systemInstruction: `Eres un trabajador de la plataforma de videojuegos Steam y amante de los 
                        videojuegos con mucha experiencia en múltiples videojuegos de computador. 
                        Tu objetivo es proporcionar información, recomendaciones y consejos sobre 
                        videojuegos de Steam. Al recomendar videojuegos **solo entrega una lista** con exactamente el siguiente formato 'Nombre juego: Descripción juego', 
                        donde cada juego esté separado por un salto de línea. Por favor no proporciones 
                        ningún comentario adicional ni formatees el texto con carácteres especiales, 
                        sólo entrega los nombres de los juegos con sus descripciones. No incluyas comentarios adicionales, encabezados, saludos o cualquier texto fuera de este formato.` // Instrucción completa
});

// Variable para almacenar la instancia del chat
let chatInstance = null;

// Función para inicializar y precalentar el chat
const initializeChat = async () => {
  try {
    chatInstance = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Warm-up message to initialize the chat instance.' }],
        },
      ],
    });

    // Envía un mensaje de prueba para asegurarte de que el modelo esté inicializado
    await chatInstance.sendMessage('Esto es un mensaje de inicialización.');
    console.log('Chat instance initialized successfully.');
  } catch (error) {
    console.error('Error initializing chat instance:', error);
  }
};

// Función para obtener feedback de la bdd
const formatUserFeedback = async (user) => {
  try {
    const feedbackRecords = await Feedback.findAll({
      where: { userId: user.id },
      include: [
        {
          model: Recommendation,
          as: 'recommendation',
          attributes: ['gameTitle'],
        },
      ],
    });

    let aggregatedFeedback = feedbackRecords
      .map((fb) => {
        return `- Game: ${fb.recommendation.gameTitle}, Rating: ${fb.rating}, Comment: ${fb.comment || 'N/A'}`;
      })
      .join('\n');

    if (aggregatedFeedback) {
      aggregatedFeedback = 'User feedback on previous recommendations, please consider for future recommendations:\n' + aggregatedFeedback;
    } else {
      aggregatedFeedback = 'User has not provided any feedback on previous recommendations.';
    }

    return aggregatedFeedback;
  } catch (error) {
    console.error('Error collecting user feedback:', error);
    throw error;
  }
};

// Genera recomendaciones reutilizando la instancia del chat
const generateRecommendation = async (user, userInput) => {
  try {
    const userFeedback = await formatUserFeedback(user);

    if (!chatInstance) {
      throw new Error('Chat instance is not initialized.');
    }

    if (userFeedback) {
      // Incluye el feedback como contexto en el historial
      await chatInstance.sendMessage(userFeedback);
    }

    const result = await chatInstance.sendMessage(userInput);
    const aiResponse = result.response.text();
    console.log(aiResponse);

    return aiResponse;
  } catch (error) {
    console.error('Error generating recommendation:', error);
    throw error;
  }
};

module.exports = {
  initializeChat,
  generateRecommendation,
};
