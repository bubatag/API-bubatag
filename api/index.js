import express from "express";
import cors from "cors";
import pool from "./db.js";

import userRoutes from "./routes/userRoutes.js";
import bufaloRoutes from "./routes/bufaloRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite ler JSON no corpo das requisições

// Rotas
app.use("/", userRoutes);
app.use("/", bufaloRoutes);

// Teste de conexão e inicialização
pool.getConnection()
  .then((conn) => {
    console.log("Conectado ao MySQL com sucesso!");
    conn.release();
    const PORT = 4000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Erro ao conectar no banco de dados MySQL:", error);
  });

