
require('dotenv').config();

const mongoose = require('mongoose');
const Usuario = require('../src/models/Usuario');

// O Seed utiliza somente o banco local.
// No Docker, o endereço será fornecido pelo docker-compose.
// Fora do Docker, utiliza a porta 27018 publicada pelo Compose.
const MONGO_SEED_URI =
  process.env.SEED_MONGO_URI ||
  'mongodb://127.0.0.1:27018/bubatag';

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

const usuariosDemo = () => {
  // IDs são criados antes dos vínculos para manter
  // as referências entre coleiras e bubalinos corretas.
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

const executarSeed = async () => {
  try {
    console.log('\n======================================');
    console.log(' INICIANDO SEED DO BUBATAG');
    console.log('======================================');

    console.log('[SEED] Conectando ao MongoDB local...');

    await mongoose.connect(MONGO_SEED_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('[SEED] Conectado ao banco local.');
    console.log('[SEED] Banco:', mongoose.connection.host);

    const usuarios = usuariosDemo();

    let criados = 0;
    let ignorados = 0;

    for (const dados of usuarios) {
      const usuarioExistente = await Usuario.findOne({
        email: dados.email
      });

      if (usuarioExistente) {
        console.log(
          `[SEED] Usuário já existe. Ignorando: ${dados.email}`
        );

        ignorados++;
        continue;
      }

      const novoUsuario = new Usuario(dados);

      await novoUsuario.save();

      console.log(
        `[SEED] Usuário criado: ${dados.email}`
      );

      criados++;
    }

    console.log('\n======================================');
    console.log(' SEED FINALIZADO');
    console.log(` Usuários criados: ${criados}`);
    console.log(` Usuários ignorados: ${ignorados}`);
    console.log('======================================\n');

    console.log('CREDENCIAIS DE DEMONSTRAÇÃO:');
    console.log('E-mail: produtor1@bubatag.com');
    console.log('E-mail: produtor2@bubatag.com');
    console.log('Senha dos dois usuários: Bubatag@123');

  } catch (error) {
    console.error('\n[SEED ERRO]', error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
    console.log('[SEED] Conexão encerrada.');
  }
};

executarSeed();
