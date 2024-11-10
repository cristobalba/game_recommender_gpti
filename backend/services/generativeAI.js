const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAICacheManager } = require('@google/generative-ai/server');
const dotenv = require('dotenv');
const { User, Feedback } = require('../models');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const cacheManager = new GoogleAICacheManager(process.env.API_KEY);

// Creates a new Gemini context cache with the user's current feedback.
const createCacheWithFeedback = async (user) => {
  try {
    // Retrieve all feedback for the user
    const allFeedback = await Feedback.findAll({
      where: { userId: user.id },
      include: [{
        model: Recommendation,
        as: 'recommendation',
        attributes: ['gameTitle'],
      }],
    });

    // Aggregate feedback into a readable format
    const aggregatedFeedback = allFeedback.map(fb => {
      return `Game: ${fb.recommendation.gameTitle}, Rating: ${fb.rating}, Comment: ${fb.comment || 'N/A'}`;
    }).join('\n');

    // Create a new cache with aggregated feedback
    const cache = await cacheManager.create({
      model: 'models/gemini-1.5-flash-001',
      displayName: 'Feedback Cache',
      systemInstruction: `Eres un trabajador de la plataforma de videojuegos Steam y amante de los 
                          videojuegos con mucha experiencia en múltiples videojuegos de computador. 
                          Tu objetivo es proporcionar información, recomendaciones y consejos sobre 
                          videojuegos de Steam. Al recomendar videojuegos preocupate de listarlos en 
                          una lista de puntos, separados por un salto de línea, e incluye una breve descripción del juego.`,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `User feedback for previous recommendations:\n${aggregatedFeedback}`
            },
          ],
        },
      ],
      ttlSeconds: 300, // 5 minutes TTL
    });

    return cache

  } catch (error) {
    console.error("Error creating cache with feedback:", error);
    throw error;
  }
};


// Generates a recommendation using a temporary cache based on user feedback.
const generateRecommendation = async (user, userInput) => {
  let cache;
  try {
    // Create a cache with current feedback
    cache = await createCacheWithFeedback(user);

    // Construct a GenerativeModel using the created cache
    const genModel = genAI.getGenerativeModelFromCachedContent(cache);

    // Generate recommendation using the cached context
    const result = await genModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userInput,
            },
          ],
        },
      ],
    });

    const aiResponse = result.response.text();

    // Return the AI response
    return aiResponse;

  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw error;

  } finally {
    // Delete the cache after generating the recommendation
    if (cache) {
      try {
        await cacheManager.delete(cache.name);
      } catch (deleteError) {
        console.error("Error deleting cache:", deleteError);
      }
    }
  }
};

module.exports = {
    generateRecommendation,
};
