import express from 'express';
const localizacaoRoutes = express.Router();
import localizacaoController from '../controllers/localizacaoController.js';

localizacaoRoutes.get('/localizacao', localizacaoController.getAll);
localizacaoRoutes.post('/localizacao', localizacaoController.create);
localizacaoRoutes.delete('/localizacao/:id', localizacaoController.remove);
localizacaoRoutes.put('/localizacao/:id', localizacaoController.update);
localizacaoRoutes.get('/localizacao/:id', localizacaoController.getOne);

export default localizacaoRoutes;