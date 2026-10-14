require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const Usuario = require('./src/models/Usuario');

async function seed() {
  await connectDB();

  await Usuario.deleteOne({ email: 'vinicius.costa@bubatag.com' });

  const usuarioCriado = await Usuario.create({
    nome: "Vinícius de Souza Camargo Costa",
    email: "vinicius.costa@bubatag.com",
    senha: "hash_senha_segura_123",
    CCIR: "1234567891234",
    ativo: true,
    coleiras: [
      {
        n_coleira: "COL-001",
        coleira_localizacao: "Pasto A",
        IP: "10.12.27.101",
        ativo: true,
        bubalino: {
          raca: "Murrah",
          n_etiqueta: "BUF-001",
          dt_nasc: new Date("2023-01-15"),
          sexo: "Masculino",
          ativo: true,
          dados: [{ batimento_cardiaco: 72, temperatura: 38.5, ativo: true, data: new Date() }],
          historico_estresse: [{ estado_estresse: "Ocioso", data_estresse: new Date(), ativo: true }],
          localizacao: [{ latitude: "-24.492101", longitude: "-47.845101", ativo: true }]
        }
      },
      {
        n_coleira: "COL-002",
        coleira_localizacao: "Pasto B",
        IP: "10.12.27.102",
        ativo: true,
        bubalino: {
          raca: "Mediterrâneo",
          n_etiqueta: "BUF-002",
          dt_nasc: new Date("2022-06-20"),
          sexo: "Feminino",
          ativo: true,
          dados: [{ batimento_cardiaco: 68, temperatura: 38.3, ativo: true, data: new Date() }],
          historico_estresse: [{ estado_estresse: "Ocioso", data_estresse: new Date(), ativo: true }],
          localizacao: [{ latitude: "-24.493202", longitude: "-47.846202", ativo: true }]
        }
      }
    ]
  });

  console.log(`[SEED] Sucesso! Usuario inserido com ID: ${usuarioCriado._id}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('[ERRO SEED]:', err);
  process.exit(1);
});
