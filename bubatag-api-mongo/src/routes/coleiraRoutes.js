
const express = require('express');
const router = express.Router();

const coleiraController = require('../controllers/coleiraController');
const authMiddleware = require('../middlewares/authMiddleware');

// Cadastra uma coleira sem búfalo associado.
router.post(
  '/usuario/:usuarioId',
  authMiddleware,
  coleiraController.cadastrarParaUsuario
);

// Lista todas as coleiras do usuário.
router.get(
  '/usuario/:usuarioId',
  authMiddleware,
  coleiraController.listarPorUsuario
);

// Lista apenas as coleiras disponíveis para associação.
router.get(
  '/usuario/:usuarioId/disponiveis',
  authMiddleware,
  coleiraController.listarDisponiveisParaUsuario
);

// Associa um búfalo a uma coleira já cadastrada.
router.post(
  '/usuario/:usuarioId/:coleiraId/bubalino',
  authMiddleware,
  coleiraController.associarBubalino
);

// Consulta os alertas do usuário.
router.get(
  '/usuario/:usuarioId/alertas',
  authMiddleware,
  coleiraController.obterAlertas
);

module.exports = router;
