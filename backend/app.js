const express = require('express');
const { sequelize } = require('./models');
const auth = require('./middleware/auth.js');
const apiRoutes = require('./routes/api.js');
const userRoutes = require('./routes/user.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded requests

app.use('/api', auth, apiRoutes);
app.use('/user', auth, userRoutes);

const PORT = process.env.PORT || 3000;

// Test database connection and sync models
sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
