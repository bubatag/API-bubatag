const express = require('express');
const router = express.Router();
const telemetriaController = require('../controllers/telemetriaController');
const validarTelemetria = require('../middlewares/validarTelemetria');

// A rota IoT é aberta ou autenticada por chave de hardware, recebendo validação fisiológica direta
router.post('/registro', validarTelemetria, telemetriaController.registrar);

module.exports = router;