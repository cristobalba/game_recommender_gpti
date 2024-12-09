const express = require('express');
const { sequelize } = require('./models');
const auth = require('./middlewares/auth.js');
const apiRoutes = require('./routes/api.js');
const userRoutes = require('./routes/user.js');
const { initializeChat } = require('./services/generativeAI'); // Importamos el servicio para inicializar el chat
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded requests

app.use('/api', auth, apiRoutes);
app.use('/user', auth, userRoutes);

const PORT = process.env.PORT || 3000;

// Test database connection and sync models
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected...');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
      await initializeChat(); // Inicializa el chat cuando el servidor se levanta
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
