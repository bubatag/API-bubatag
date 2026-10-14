const express = require('express');
const cors = require('cors');

const usuarioRoutes = require('./routes/usuarioRoutes');
const coleiraRoutes = require('./routes/coleiraRoutes');
const telemetriaRoutes = require('./routes/telemetriaRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Registro de Rotas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/coleiras', coleiraRoutes);
app.use('/api/telemetria', telemetriaRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', servico: 'Bubatag API' });
});

// Middleware Global de Tratamento de Erros (último da pilha)
app.use(errorMiddleware);

module.exports = app;