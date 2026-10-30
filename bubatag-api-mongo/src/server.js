require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  try {
    const ambiente = await connectDB();

    app.listen(PORT, () => {
      console.log('\n======================================');

      if (ambiente === 'NUVEM') {
        console.log(' BUBATAG: RODANDO NA NUVEM');
        console.log(' Conectado ao MongoDB Atlas');
      } else {
        console.log(' BUBATAG: RODANDO LOCALMENTE');
        console.log(' Conectado ao MongoDB local');
      }

      console.log(` API disponível na porta ${PORT}`);
      console.log('======================================\n');
    });
  } catch (error) {
    console.error('\n[ERRO] Não foi possível iniciar a API:', error.message);
    process.exit(1);
  }
};

iniciarServidor();
