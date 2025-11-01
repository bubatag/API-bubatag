import express from "express";
const bufaloRoutes = express.Router();
import bufaloController from "../controllers/bufaloController.js";
// Importando o middleware de autenticação
import Auth from '../middleware/Auth.js'

// Endpoint para listar todos os bufalos (rota)
bufaloRoutes.get("/bufalos",  bufaloController.getAllBufalo);

// Endpoint para cadastrar um bufalo
bufaloRoutes.post("/bufalos", bufaloController.createBufalo);

// Endpoint para excluir um bufalo
bufaloRoutes.delete("/bufalos/:id",  bufaloController.deleteBufalo);

// Endpoint para alterar um bufalo
bufaloRoutes.put("/bufalos/:id",  bufaloController.updateBufalo)

// Endpoint para listar um único bufalo
bufaloRoutes.get("/bufalos/:id",  bufaloController.getOneBufalo)

export default bufaloRoutes;
