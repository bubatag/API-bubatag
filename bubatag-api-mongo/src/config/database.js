
const mongoose = require('mongoose');

const connectDB = async () => {
  const conexoes = [
    {
      nome: 'NUVEM',
      uri: process.env.MONGO_URI
    },
    {
      nome: 'LOCAL',
      uri: process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/bubatag'
    }
  ];

  for (const conexao of conexoes) {
    if (!conexao.uri) {
      console.log(`[AVISO] URI do banco ${conexao.nome} não configurada.`);
      continue;
    }

    try {
      console.log(`\n[CONEXÃO] Tentando conectar ao banco ${conexao.nome}...`);

      const conn = await mongoose.connect(conexao.uri, {
        serverSelectionTimeoutMS: 5000
      });

      console.log('\n======================================');
      console.log(` BUBATAG RODANDO EM: ${conexao.nome}`);
      console.log(` Banco conectado: ${conn.connection.host}`);
      console.log('======================================\n');

      return conexao.nome;
    } catch (error) {
      console.log(
        `[AVISO] Falha ao conectar ao banco ${conexao.nome}: ${error.message}`
      );

      await mongoose.disconnect();
    }
  }

  throw new Error(
    'Não foi possível conectar ao MongoDB na nuvem nem localmente.'
  );
};

module.exports = connectDB;
