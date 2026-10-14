import express from 'express';
const dadoRoutes = express.Router();
import dadoController from '../controllers/dadoController.js';

dadoRoutes.get('/dados', dadoController.getAll);
dadoRoutes.post('/dados', dadoController.create);
dadoRoutes.delete('/dados/:id', dadoController.remove);
dadoRoutes.put('/dados/:id', dadoController.update);
dadoRoutes.get('/dados/:id', dadoController.getOne);

export default dadoRoutes;