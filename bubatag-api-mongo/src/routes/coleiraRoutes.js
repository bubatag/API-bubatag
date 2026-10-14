const express = require('express');
const router = express.Router();
const coleiraController = require('../controllers/coleiraController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/usuario/:usuarioId', authMiddleware, coleiraController.listarPorUsuario);
router.get('/usuario/:usuarioId/alertas', authMiddleware, coleiraController.obterAlertas);

module.exports = router;