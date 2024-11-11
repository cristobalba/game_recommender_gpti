const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAICacheManager } = require('@google/generative-ai/server');
const dotenv = require('dotenv');
const { Recommendation, Feedback } = require('../models');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
    model: 'models/gemini-1.5-flash-001',
    systemInstruction: `Eres un trabajador de la plataforma de videojuegos Steam y amante de los 
                        videojuegos con mucha experiencia en múltiples videojuegos de computador. 
                        Tu objetivo es proporcionar información, recomendaciones y consejos sobre 
                        videojuegos de Steam. Al recomendar videojuegos preocúpate de listarlos en  
                        una lista con exactamente el siguiente formato 'Nombre juego: Descripción juego', 
                        donde cada juego esté separado por un salto de línea. Por favor no proporciones 
                        ningún comentario adicional ni formatees el texto con carácteres especiales, 
                        sólo entrega los nombres de los juegos con sus descripciones.`
});

// Collects the user feedback on previous recommendations
const formatUserFeedback = async (user) => {
  try {
    // Retrieve all feedback for the user
    const feedbackRecords = await Feedback.findAll({
      where: { userId: user.id },
      include: [{
        model: Recommendation,
        as: 'recommendation',
        attributes: ['gameTitle'],
      }],
    });

    // Aggregate feedback into a readable format
    let aggregatedFeedback = feedbackRecords.map(fb => {
      return `- Game: ${fb.recommendation.gameTitle}, Rating: ${fb.rating}, Comment: ${fb.comment || 'N/A'}`;
    }).join('\n');

    // Add instruction at the beginning
    if (aggregatedFeedback) {
      aggregatedFeedback = "User feedback on previous recommendations, please consider for future recommendations:\n" + aggregatedFeedback;
    } else {
      aggregatedFeedback = "User has not provided any feedback on previous recommendations.";
    }

    return aggregatedFeedback

  } catch (error) {
    console.error("Error collecting user feedback:", error);
    throw error;
  }
};


// Generates a recommendation based on user feedback
const generateRecommendation = async (user, userInput) => {
  try {
    // Retrieve user feedback
    const userFeedback = await formatUserFeedback(user);

    // Start chat
    const chat = model.startChat({
      history: [
          {
              role: "user",
              parts: [{ text: userFeedback }],
          }
      ],
  });

    // Send message
    const result = await chat.sendMessage(userInput);
    const aiResponse = result.response.text();

    // Return the AI response
    return aiResponse;

  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw error;

  }
};


module.exports = {
    generateRecommendation,
};
