const express = require('express');
const router = express.Router();

const bubalinoController = require('../controllers/bubalinoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, bubalinoController.cadastrar);
router.put('/:id', authMiddleware, bubalinoController.atualizar);
router.delete('/:id', authMiddleware, bubalinoController.excluir);

module.exports = router;
