
const express = require('express');
const router = express.Router();

const coleiraController = require('../controllers/coleiraController');
const authMiddleware = require('../middlewares/authMiddleware');

// Cadastra uma coleira sem bubalino associado.
router.post(
  '/usuario/:usuarioId',
  authMiddleware,
  coleiraController.cadastrarParaUsuario
);

// Lista todas as coleiras do usuário, ativas e inativas.
router.get(
  '/usuario/:usuarioId',
  authMiddleware,
  coleiraController.listarPorUsuario
);

// Lista coleiras ativas e disponíveis para associação.
router.get(
  '/usuario/:usuarioId/disponiveis',
  authMiddleware,
  coleiraController.listarDisponiveisParaUsuario
);

// Associa um bubalino a uma coleira já cadastrada.
router.post(
  '/usuario/:usuarioId/:coleiraId/bubalino',
  authMiddleware,
  coleiraController.associarBubalino
);

// Desvincula o bubalino sem apagar seu cadastro ou histórico.
router.patch(
  '/usuario/:usuarioId/:coleiraId/desvincular',
  authMiddleware,
  coleiraController.desvincularBubalino
);

// Consulta os alertas do usuário.
router.get(
  '/usuario/:usuarioId/alertas',
  authMiddleware,
  coleiraController.obterAlertas
);

// Edita os dados de uma coleira.
router.put(
  '/usuario/:usuarioId/:coleiraId',
  authMiddleware,
  coleiraController.editar
);

// Desativa uma coleira sem apagar seus dados ou desvincular o bubalino.
router.delete(
  '/usuario/:usuarioId/:coleiraId',
  authMiddleware,
  coleiraController.excluir
);

// Reativa uma coleira anteriormente desativada.
router.patch(
  '/usuario/:usuarioId/:coleiraId/reativar',
  authMiddleware,
  coleiraController.reativar
);

module.exports = router;
