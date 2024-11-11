const express = require('express');
const { generateRecommendation } = require('../services/generativeAI.js');
const { User, Recommendation, Feedback } = require('../models');

const router = express.Router();

router.post('/recommend', async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });

    const { genre, favorite, type } = req.body;

    // Validate input
    if (!genre || !favorite || !type) {
      return res.status(400).json({ error: "Missing required fields: genre, favorite, type." });
    }

    // Create the user input message for the AI
    const userInput = `
      Estoy buscando un videojuego del género ${genre}. 
      Mi juego favorito es ${favorite} y estoy buscando un juego que sea ${type}.
    `;

    // Generate personalized recommendation using the AI service
    const aiResponse = await generateRecommendation(user, userInput);
    console.log("aiResponse: ", aiResponse);

    // Process the AI response
    const recommendationsData = aiResponse
      .split('\n') // Split response into lines
      .filter(line => line.trim() !== '') // Remove empty lines
      .map(line => {
          // Remove leading "- " if present
          const trimmedLine = line.startsWith('- ') ? line.slice(2) : line;

          // Remove **
          const cleanLine = trimmedLine.replace('**', '')

          // Split the line at the first colon to separate title and description
          const colonIndex = cleanLine.indexOf(':');
          if (colonIndex === -1) {
              // Handle lines without a colon
              return { title: cleanLine.trim(), description: "" };
          }

          const title = cleanLine.slice(0, colonIndex).trim();
          const description = cleanLine.slice(colonIndex + 1).trim();

          return { title, description };
      });

    // Create recommendations in the database
    const recommendations = await Promise.all(recommendationsData.map(async ({ title, description }) => {
      return await Recommendation.create({
        userId: user.id,
        gameTitle: title,
        gameDescription: description
      });
    }));

    res.status(200).json({ message: "Recommendations generated successfully.", recommendations });

  } catch (error) {
    console.error("Error generating recommendation:", error);
    res.status(500).json({ error: "An error occurred while generating recommendations." });
  }
});

router.post('/feedback', async (req, res) => {
  const auth0Id = req.auth.sub;
  const user = await User.findOne({ where: { auth0Id } });
  const { feedbacks } = req.body;

  // Validate that feedbacks is provided and is an array
  if (!feedbacks || !Array.isArray(feedbacks)) {
    return res.status(400).json({ error: "Request body must contain a 'feedbacks' array." });
  }

  // Early exit if feedbacks array is empty
  if (feedbacks.length === 0) {
    return res.status(400).json({ error: "'feedbacks' array cannot be empty." });
  }

  // Iterate over each feedback to validate
  // feedbacks.forEach((feedback, index) => {
    for (const [_, feedback] of feedbacks.entries()) {
    const { recommendationId, rating } = feedback;

    // Check for required fields
    if (recommendationId === undefined || rating === undefined) {
      return res.status(400).json({ error: "Missing required fields: recommendationId and/or rating." });
    }

    // Validate rating range
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5." });
    }
  }

  try {
    const result = await Feedback.sequelize.transaction(async (t) => {
      // Extract all recommendationIds from the feedbacks
      const recommendationIds = feedbacks.map(fb => fb.recommendationId);

      // Fetch all recommendations that belong to the user
      const recommendations = await Recommendation.findAll({
        where: {
          id: recommendationIds,
          userId: user.id
        },
        transaction: t
      });

      // Check if all recommendationIds are valid and belong to the user
      if (recommendations.length !== recommendationIds.length) {
        // return res.status(400).json({ error: "One or more recommendationIds are invalid or do not belong to the user." });
        throw new Error("One or more recommendationIds are invalid or do not belong to the user.");
      }

      // Prepare feedback records for bulk creation
      const feedbackRecords = feedbacks.map(fb => ({
        userId: user.id,
        recommendationId: fb.recommendationId,
        rating: fb.rating,
        comment: fb.comment || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // Bulk create feedbacks
      const createdFeedbacks = await Feedback.bulkCreate(feedbackRecords, { transaction: t });

      return createdFeedbacks;
    });

    // Respond with success and the created feedbacks
    res.status(201).json({ message: "Feedbacks submitted successfully.", feedbacks: result });

  } catch (error) {
    console.error("Error submitting feedbacks:", error.message);

    if (error.message === "One or more recommendationIds are invalid or do not belong to the user.") {
      return res.status(400).json({ error: "One or more recommendationIds are invalid or do not belong to the user." });
    }

    res.status(500).json({ error: "An error occurred while submitting feedbacks." });
  }
});

module.exports = router;
