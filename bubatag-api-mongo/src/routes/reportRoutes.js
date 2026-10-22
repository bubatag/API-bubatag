
const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get(
  '/coleira/:n_coleira',
  authMiddleware,
  reportController.gerarPorColeira
);

module.exports = router;
