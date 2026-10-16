const mongoose = require('mongoose');

const DadoBiometricoSchema = new mongoose.Schema({
  batimento_cardiaco: { type: Number, required: true },
  temperatura: { type: Number, required: true },
  ativo: { type: Boolean, default: true },
  data: { type: Date, default: Date.now }
});

const HistoricoEstresseSchema = new mongoose.Schema({
  estado_estresse: {
    type: String,
    enum: ['Normal', 'Ocioso', 'Alerta', 'Estresse Térmico', 'Estresse Crítico', 'Estressado'],
    default: 'Normal'
  },
  data_estresse: { type: Date, default: Date.now },
  ativo: { type: Boolean, default: true }
});

const LocalizacaoSchema = new mongoose.Schema({
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  ativo: { type: Boolean, default: true }
});

const BubalinoSchema = new mongoose.Schema({
  raca: { type: String, required: true },
  n_etiqueta: { type: String, required: true },
  dt_nasc: { type: Date, required: true },
  sexo: { type: String, enum: ['Masculino', 'Feminino'], required: true },
  ativo: { type: Boolean, default: true },
  dados: [DadoBiometricoSchema],
  historico_estresse: [HistoricoEstresseSchema],
  localizacao: [LocalizacaoSchema]
});

const ColeiraSchema = new mongoose.Schema({
  n_coleira: { type: String, required: true },
  coleira_localizacao: { type: String, required: true },
  IP: { type: String, required: true },
  ativo: { type: Boolean, default: true },
  bubalino: BubalinoSchema
});

const UsuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    CCIR: { type: String, required: true },
    ativo: { type: Boolean, default: true },
    coleiras: [ColeiraSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Usuario', UsuarioSchema, 'usuarios');