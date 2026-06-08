import express from 'express';
const historicoEstresseRoutes = express.Router();
import historicoEstresseController from '../controllers/historicoEstresseController.js';

historicoEstresseRoutes.get('/estresse', historicoEstresseController.getAll);
historicoEstresseRoutes.post('/estresse', historicoEstresseController.create);
historicoEstresseRoutes.delete('/estresse/:id', historicoEstresseController.remove);
historicoEstresseRoutes.put('/estresse/:id', historicoEstresseController.update);
historicoEstresseRoutes.get('/estresse/:id', historicoEstresseController.getOne);

export default historicoEstresseRoutes;