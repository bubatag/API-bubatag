import express from 'express';
const coleiraRoutes = express.Router();
import coleiraController from '../controllers/coleiraController.js';

coleiraRoutes.get('/coleiras', coleiraController.getAll);
coleiraRoutes.post('/coleiras', coleiraController.create);
coleiraRoutes.delete('/coleiras/:id', coleiraController.remove);
coleiraRoutes.put('/coleiras/:id', coleiraController.update);
coleiraRoutes.get('/coleiras/:id', coleiraController.getOne);

export default coleiraRoutes;
