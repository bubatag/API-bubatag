
const mongoose = require('mongoose');

const DadoBiometricoSchema = new mongoose.Schema({
  batimento_cardiaco: {
    type: Number,
    required: true
  },
  temperatura: {
    type: Number,
    required: true
  },
  ativo: {
    type: Boolean,
    default: true
  },
  data: {
    type: Date,
    default: Date.now
  }
});

const HistoricoEstresseSchema = new mongoose.Schema({
  estado_estresse: {
    type: String,
    enum: [
      'Normal',
      'Ocioso',
      'Alerta',
      'Estresse Térmico',
      'Estresse Crítico',
      'Estressado'
    ],
    default: 'Normal'
  },
  data_estresse: {
    type: Date,
    default: Date.now
  },
  ativo: {
    type: Boolean,
    default: true
  }
});

const LocalizacaoSchema = new mongoose.Schema({
  latitude: {
    type: String,
    required: true
  },
  longitude: {
    type: String,
    required: true
  },
  ativo: {
    type: Boolean,
    default: true
  },
  data: {
    type: Date,
    default: Date.now
  }
});

// Cadastro independente do bubalino.
const BubalinoSchema = new mongoose.Schema({
  raca: {
    type: String,
    required: true
  },
  n_etiqueta: {
    type: String,
    required: true
  },
  dt_nasc: {
    type: Date,
    required: true
  },
  sexo: {
    type: String,
    enum: ['Macho', 'Fêmea'],
    required: true
  },
  ativo: {
    type: Boolean,
    default: true
  },
  excluido_em: {
    type: Date,
    default: null
  },
  dados: {
    type: [DadoBiometricoSchema],
    default: []
  },
  historico_estresse: {
    type: [HistoricoEstresseSchema],
    default: []
  },
  localizacao: {
    type: [LocalizacaoSchema],
    default: []
  }
});

// Histórico de associações entre coleira e bubalino.
const HistoricoVinculoSchema = new mongoose.Schema({
  bubalino_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  data_inicio: {
    type: Date,
    default: Date.now,
    required: true
  },
  data_fim: {
    type: Date,
    default: null
  },
  ativo: {
    type: Boolean,
    default: true
  }
});

// Cadastro independente da coleira.
const ColeiraSchema = new mongoose.Schema({
  n_coleira: {
    type: String,
    required: true
  },
  coleira_localizacao: {
    type: String,
    required: true
  },
  IP: {
    type: String,
    required: true
  },
  ativo: {
    type: Boolean,
    default: true
  },
  excluido_em: {
    type: Date,
    default: null
  },

  // Referência ao bubalino atualmente associado.
  bubalino_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  // Histórico de todos os animais que utilizaram a coleira.
  historico_vinculos: {
    type: [HistoricoVinculoSchema],
    default: []
  }
});

const UsuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    senha: {
      type: String,
      required: true
    },
    CCIR: {
      type: String,
      required: true
    },
    ativo: {
      type: Boolean,
      default: true
    },

    coleiras: {
      type: [ColeiraSchema],
      default: []
    },

    // Os animais agora existem independentemente das coleiras.
    bubalinos: {
      type: [BubalinoSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Usuario ||
  mongoose.model('Usuario', UsuarioSchema, 'usuarios');