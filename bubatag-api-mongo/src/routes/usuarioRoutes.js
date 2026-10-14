const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/login', usuarioController.login);
router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.obterPorId);
router.post('/', usuarioController.criar);

module.exports = router;