
require('dotenv').config();

const mongoose = require('mongoose');
const Usuario = require('../src/models/Usuario');

// ======================================
// CONFIGURAÇÃO DO BANCO
// ======================================

const MONGO_LOCAL_URI =
  process.env.SEED_MONGO_URI ||
  'mongodb://127.0.0.1:27018/bubatag';

const MONGO_ATLAS_URI = process.env.MONGO_URI;

const ambiente = (process.argv[2] || 'local').toLowerCase();

if (!['local', 'atlas'].includes(ambiente)) {
  throw new Error(
    'Ambiente inválido. Utilize: npm run seed ou npm run seed -- atlas'
  );
}

const MONGO_SEED_URI =
  ambiente === 'atlas'
    ? MONGO_ATLAS_URI
    : MONGO_LOCAL_URI;

if (!MONGO_SEED_URI) {
  throw new Error(
    `URI do MongoDB ${ambiente.toUpperCase()} não configurada.`
  );
}

// ======================================
// DADOS DE DEMONSTRAÇÃO
// ======================================

const criarDadosBiometricos = () => {
  const agora = new Date();

  return [
    {
      batimento_cardiaco: 65,
      temperatura: 37.5,
      data: new Date(agora.getTime() - 3600000)
    },
    {
      batimento_cardiaco: 78,
      temperatura: 38.1,
      data: new Date(agora.getTime() - 1800000)
    },
    {
      batimento_cardiaco: 92,
      temperatura: 39.3,
      data: agora
    }
  ];
};

const criarHistoricoEstresse = () => {
  const agora = new Date();

  return [
    {
      estado_estresse: 'Normal',
      data_estresse: new Date(agora.getTime() - 7200000)
    },
    {
      estado_estresse: 'Alerta',
      data_estresse: new Date(agora.getTime() - 3600000)
    },
    {
      estado_estresse: 'Estresse Térmico',
      data_estresse: agora
    }
  ];
};

const criarLocalizacoes = () => {
  const agora = new Date();

  return [
    {
      latitude: '-24.4975',
      longitude: '-47.8449',
      data: new Date(agora.getTime() - 3600000)
    },
    {
      latitude: '-24.4980',
      longitude: '-47.8455',
      data: agora
    }
  ];
};

const criarBubalino = (raca, etiqueta, sexo, ativo = true) => ({
  raca,
  n_etiqueta: etiqueta,
  dt_nasc: new Date('2022-05-10'),
  sexo,
  ativo,
  excluido_em: null,
  dados: criarDadosBiometricos(),
  historico_estresse: criarHistoricoEstresse(),
  localizacao: criarLocalizacoes()
});

const criarColeira = (
  numero,
  localizacao,
  ip,
  bubalinoId = null,
  ativo = true
) => {
  const historicoVinculos = bubalinoId
    ? [
        {
          bubalino_id: bubalinoId,
          data_inicio: new Date(),
          data_fim: null,
          ativo: true
        }
      ]
    : [];

  return {
    n_coleira: numero,
    coleira_localizacao: localizacao,
    IP: ip,
    ativo,
    excluido_em: null,
    bubalino_id: bubalinoId,
    historico_vinculos: historicoVinculos
  };
};

// ======================================
// USUÁRIOS DE DEMONSTRAÇÃO
// ======================================

const usuariosDemo = () => {
  // Os IDs são criados antes dos vínculos para
  // manter as referências entre coleiras e bubalinos.

  const bubalino1Id = new mongoose.Types.ObjectId();
  const bubalino2Id = new mongoose.Types.ObjectId();
  const bubalino3Id = new mongoose.Types.ObjectId();

  return [
    {
      nome: 'Produtor Demonstração 1',
      email: 'produtor1@bubatag.com',
      senha: 'Bubatag@123',
      CCIR: 'CCIR-DEMO-001',
      ativo: true,

      bubalinos: [
        {
          _id: bubalino1Id,
          ...criarBubalino(
            'Murrah',
            'BUF-DEMO-001',
            'Fêmea',
            true
          )
        },
        {
          _id: bubalino2Id,
          ...criarBubalino(
            'Mediterrâneo',
            'BUF-DEMO-002',
            'Macho',
            false
          )
        }
      ],

      coleiras: [
        criarColeira(
          'COL-DEMO-001',
          'Área de pastagem 1',
          '192.168.1.101',
          bubalino1Id,
          true
        ),
        criarColeira(
          'COL-DEMO-002',
          'Área de pastagem 2',
          '192.168.1.102',
          bubalino2Id,
          true
        ),
        criarColeira(
          'COL-DEMO-003',
          'Estoque',
          '192.168.1.103',
          null,
          true
        )
      ]
    },

    {
      nome: 'Produtor Demonstração 2',
      email: 'produtor2@bubatag.com',
      senha: 'Bubatag@123',
      CCIR: 'CCIR-DEMO-002',
      ativo: true,

      bubalinos: [
        {
          _id: bubalino3Id,
          ...criarBubalino(
            'Jafarabadi',
            'BUF-DEMO-003',
            'Fêmea',
            true
          )
        }
      ],

      coleiras: [
        criarColeira(
          'COL-DEMO-004',
          'Área de pastagem 3',
          '192.168.1.104',
          bubalino3Id,
          false
        )
      ]
    }
  ];
};

// ======================================
// VERIFICAÇÃO DE DUPLICIDADES
// ======================================

const verificarConflitos = async (dados) => {
  const conflitos = [];

  const usuarioExistente = await Usuario.findOne({
    email: dados.email
  }).select('_id email');

  if (usuarioExistente) {
    return {
      usuarioExistente: true,
      conflitos: []
    };
  }

  const ccirExistente = await Usuario.findOne({
    CCIR: dados.CCIR
  }).select('_id CCIR');

  if (ccirExistente) {
    conflitos.push(`CCIR já cadastrado: ${dados.CCIR}`);
  }

  for (const bubalino of dados.bubalinos) {
    const etiquetaExistente = await Usuario.findOne({
      'bubalinos.n_etiqueta': bubalino.n_etiqueta
    }).select('_id');

    if (etiquetaExistente) {
      conflitos.push(
        `Etiqueta já cadastrada: ${bubalino.n_etiqueta}`
      );
    }
  }

  for (const coleira of dados.coleiras) {
    const coleiraExistente = await Usuario.findOne({
      'coleiras.n_coleira': coleira.n_coleira
    }).select('_id');

    if (coleiraExistente) {
      conflitos.push(
        `Coleira já cadastrada: ${coleira.n_coleira}`
      );
    }
  }

  return {
    usuarioExistente: false,
    conflitos
  };
};

// ======================================
// EXECUÇÃO DO SEED
// ======================================

const executarSeed = async () => {
  try {
    console.log('\n======================================');
    console.log(' INICIANDO SEED DO BUBATAG');
    console.log('======================================');

    console.log(
      `[SEED] Ambiente selecionado: ${ambiente.toUpperCase()}`
    );

    console.log('[SEED] Conectando ao MongoDB...');

    await mongoose.connect(MONGO_SEED_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('[SEED] Conexão estabelecida.');
    console.log('[SEED] Banco:', mongoose.connection.name);
    console.log('[SEED] Servidor:', mongoose.connection.host);

    const usuarios = usuariosDemo();

    let criados = 0;
    let ignorados = 0;
    let conflitosEncontrados = 0;

    for (const dados of usuarios) {
      console.log(`\n[SEED] Verificando: ${dados.email}`);

      const verificacao = await verificarConflitos(dados);

      if (verificacao.usuarioExistente) {
        console.log(
          `[SEED] Usuário já existe. Nenhuma alteração realizada: ${dados.email}`
        );

        ignorados++;
        continue;
      }

      if (verificacao.conflitos.length > 0) {
        console.log(
          `[SEED] Cadastro não realizado: ${dados.email}`
        );

        verificacao.conflitos.forEach((conflito) => {
          console.log(`[SEED] CONFLITO: ${conflito}`);
        });

        conflitosEncontrados++;
        continue;
      }

      const novoUsuario = new Usuario(dados);

      await novoUsuario.save();

      console.log(
        `[SEED] Usuário criado com sucesso: ${dados.email}`
      );

      console.log(
        `[SEED] Bubalinos cadastrados: ${dados.bubalinos.length}`
      );

      console.log(
        `[SEED] Coleiras cadastradas: ${dados.coleiras.length}`
      );

      criados++;
    }

    console.log('\n======================================');
    console.log(' SEED FINALIZADO');
    console.log(` Ambiente: ${ambiente.toUpperCase()}`);
    console.log(` Usuários criados: ${criados}`);
    console.log(` Usuários ignorados: ${ignorados}`);
    console.log(` Cadastros com conflitos: ${conflitosEncontrados}`);
    console.log('======================================\n');

    console.log('CREDENCIAIS DE DEMONSTRAÇÃO:');
    console.log('E-mail: produtor1@bubatag.com');
    console.log('E-mail: produtor2@bubatag.com');
    console.log('Senha dos dois usuários: Bubatag@123');

  } catch (error) {
    console.error('\n[SEED ERRO]', error.message);
    process.exitCode = 1;

  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    console.log('[SEED] Conexão encerrada.');
  }
};

executarSeed();
