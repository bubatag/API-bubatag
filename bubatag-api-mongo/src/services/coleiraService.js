
const Usuario = require('../models/Usuario');

class ColeiraService {
  // Cadastra uma coleira sem exigir um búfalo associado.
  async cadastrarParaUsuario(usuarioId, dadosColeira) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      const erro = new Error('Usuário não encontrado.');
      erro.status = 404;
      throw erro;
    }

    const nColeira = String(
      dadosColeira?.n_coleira || ''
    ).trim();

    const localizacao = String(
      dadosColeira?.coleira_localizacao || ''
    ).trim();

    const ip = String(
      dadosColeira?.IP || ''
    ).trim();

    if (!nColeira || !localizacao || !ip) {
      const erro = new Error(
        'Informe o número da coleira, a localização e o IP.'
      );
      erro.status = 400;
      throw erro;
    }

    // Evita números duplicados entre as coleiras do usuário.
    const numeroExistente = (usuario.coleiras || []).some(
      (coleira) =>
        String(coleira.n_coleira || '')
          .trim()
          .toLowerCase() === nColeira.toLowerCase()
    );

    if (numeroExistente) {
      const erro = new Error(
        'Já existe uma coleira com esse número.'
      );
      erro.status = 409;
      throw erro;
    }

    const novaColeira = {
      n_coleira: nColeira,
      coleira_localizacao: localizacao,
      IP: ip,
      ativo: dadosColeira.ativo ?? true
    };

    usuario.coleiras.push(novaColeira);
    await usuario.save();

    return usuario.coleiras[usuario.coleiras.length - 1];
  }

  // Lista todas as coleiras do usuário.
  async listarPorUsuario(usuarioId) {
    const usuario = await Usuario.findById(usuarioId)
      .select('coleiras');

    if (!usuario) {
      const erro = new Error('Usuário não encontrado.');
      erro.status = 404;
      throw erro;
    }

    return usuario.coleiras || [];
  }

  // Lista somente coleiras ativas que ainda não possuem búfalo.
  async listarDisponiveisParaUsuario(usuarioId) {
    const usuario = await Usuario.findById(usuarioId)
      .select('coleiras');

    if (!usuario) {
      const erro = new Error('Usuário não encontrado.');
      erro.status = 404;
      throw erro;
    }

    return (usuario.coleiras || []).filter(
      (coleira) =>
        coleira.ativo !== false &&
        !coleira.bubalino
    );
  }

  // Associa um búfalo a uma coleira já cadastrada.
  async associarBubalino(
    usuarioId,
    coleiraId,
    dadosBubalino
  ) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      const erro = new Error('Usuário não encontrado.');
      erro.status = 404;
      throw erro;
    }

    const coleira = usuario.coleiras.id(coleiraId);

    if (!coleira) {
      const erro = new Error('Coleira não encontrada.');
      erro.status = 404;
      throw erro;
    }

    if (coleira.ativo === false) {
      const erro = new Error('A coleira está inativa.');
      erro.status = 400;
      throw erro;
    }

    if (coleira.bubalino) {
      const erro = new Error(
        'Esta coleira já está associada a um búfalo.'
      );
      erro.status = 409;
      throw erro;
    }

    const raca = String(
      dadosBubalino?.raca || ''
    ).trim();

    const etiqueta = String(
      dadosBubalino?.n_etiqueta || ''
    ).trim();

    const dtNasc = dadosBubalino?.dt_nasc;
    const sexo = dadosBubalino?.sexo;

    if (!raca || !etiqueta || !dtNasc || !sexo) {
      const erro = new Error(
        'Informe raça, número da etiqueta, data de nascimento e sexo.'
      );
      erro.status = 400;
      throw erro;
    }

    const dataNascimento = new Date(dtNasc);

    if (Number.isNaN(dataNascimento.getTime())) {
      const erro = new Error(
        'A data de nascimento é inválida.'
      );
      erro.status = 400;
      throw erro;
    }

    if (dataNascimento > new Date()) {
      const erro = new Error(
        'A data de nascimento não pode estar no futuro.'
      );
      erro.status = 400;
      throw erro;
    }

    // Aceita somente Macho ou Fêmea.
    if (!['Macho', 'Fêmea'].includes(sexo)) {
      const erro = new Error(
        'O sexo deve ser Macho ou Fêmea.'
      );
      erro.status = 400;
      throw erro;
    }

    // Impede etiquetas duplicadas entre os búfalos do usuário.
    const etiquetaExistente = (usuario.coleiras || []).some(
      (outraColeira) =>
        outraColeira.bubalino &&
        String(outraColeira.bubalino.n_etiqueta || '')
          .trim()
          .toLowerCase() === etiqueta.toLowerCase()
    );

    if (etiquetaExistente) {
      const erro = new Error(
        'Já existe um búfalo com essa etiqueta.'
      );
      erro.status = 409;
      throw erro;
    }

    coleira.bubalino = {
      raca,
      n_etiqueta: etiqueta,
      dt_nasc: dataNascimento,
      sexo,
      ativo: dadosBubalino.ativo ?? true,
      dados: [],
      historico_estresse: [],
      localizacao: []
    };

    await usuario.save();

    return coleira;
  }

  // Busca os alertas dos búfalos associados a coleiras.
  async buscarAlertas(usuarioId) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      const erro = new Error('Usuário não encontrado.');
      erro.status = 404;
      throw erro;
    }

    const alertas = [];

    const estadosDeAtencao = [
      'Alerta',
      'Estresse Térmico',
      'Estresse Crítico'
    ];

    (usuario.coleiras || []).forEach((coleira) => {
      if (
        !coleira.ativo ||
        !coleira.bubalino ||
        !coleira.bubalino.ativo
      ) {
        return;
      }

      const bubalino = coleira.bubalino;
      const historicoEstresse =
        bubalino.historico_estresse || [];

      if (historicoEstresse.length === 0) {
        return;
      }

      const ultimoEstresse =
        historicoEstresse[historicoEstresse.length - 1];

      if (
        !estadosDeAtencao.includes(
          ultimoEstresse.estado_estresse
        )
      ) {
        return;
      }

      const dadosBiometricos = bubalino.dados || [];

      const ultimosDados =
        dadosBiometricos.length > 0
          ? dadosBiometricos[dadosBiometricos.length - 1]
          : null;

      const localizacoes = bubalino.localizacao || [];

      const ultimaLocalizacao =
        localizacoes.length > 0
          ? localizacoes[localizacoes.length - 1]
          : null;

      let prioridade = 'MEDIA';

      if (
        ultimoEstresse.estado_estresse === 'Estresse Crítico' ||
        ultimoEstresse.estado_estresse === 'Estresse Térmico'
      ) {
        prioridade = 'ALTA';
      }

      alertas.push({
        coleira_id: coleira._id,
        n_coleira: coleira.n_coleira,
        coleira_localizacao: coleira.coleira_localizacao,
        bubalino_id: bubalino._id,
        n_etiqueta: bubalino.n_etiqueta,
        raca: bubalino.raca,
        sexo: bubalino.sexo,

        alerta: {
          estado: ultimoEstresse.estado_estresse,
          prioridade,
          data: ultimoEstresse.data_estresse
        },

        telemetria_atual: {
          batimento_cardiaco: ultimosDados
            ? ultimosDados.batimento_cardiaco
            : null,
          temperatura: ultimosDados
            ? ultimosDados.temperatura
            : null,
          data_leitura: ultimosDados
            ? ultimosDados.data
            : null
        },

        localizacao_atual: {
          latitude: ultimaLocalizacao
            ? ultimaLocalizacao.latitude
            : null,
          longitude: ultimaLocalizacao
            ? ultimaLocalizacao.longitude
            : null
        }
      });
    });

    return alertas;
  }
}

module.exports = new ColeiraService();
