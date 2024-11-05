import express from 'express';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();

// Middleware para procesar formularios y JSON
app.use(express.urlencoded({ extended: true })); // Necesario para procesar formularios
app.use(express.json()); // Necesario para procesar JSON

// Montar el enrutador en la ruta /api
app.use('/api', apiRouter);

// Configurar el servidor para que escuche en el puerto 3000
app.listen(process.env.APP_PORT, () => {
    console.log(`Server listening on port ${process.env.APP_PORT}`);
});
