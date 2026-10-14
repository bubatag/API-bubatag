const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bubatag';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[BANCO] MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[BANCO ERRO] Falha ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;