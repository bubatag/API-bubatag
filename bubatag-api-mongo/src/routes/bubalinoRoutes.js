
const express = require('express');
const router = express.Router();

const bubalinoController = require('../controllers/bubalinoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, bubalinoController.cadastrar);
router.put('/:id', authMiddleware, bubalinoController.atualizar);
router.delete('/:id', authMiddleware, bubalinoController.excluir);
router.patch('/:id/reativar', authMiddleware, bubalinoController.reativar);
router.patch('/:id/desvincular', authMiddleware, bubalinoController.desvincular);

module.exports = router;
