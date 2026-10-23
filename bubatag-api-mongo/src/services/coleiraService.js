
const Usuario = require('../models/Usuario');

class ColeiraService {
  async cadastrarParaUsuario(usuarioId, dadosColeira) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      const erro = new Error('Usuário não encontrado.');
      erro.status = 404;
      throw erro;
    }

    if (
      !dadosColeira ||
      !dadosColeira.n_coleira ||
      !dadosColeira.coleira_localizacao ||
      !dadosColeira.IP ||
      !dadosColeira.bubalino
    ) {
      const erro = new Error(
        'Informe os dados da coleira e do bubalino.'
      );
      erro.status = 400;
      throw erro;
    }

    const numeroExistente = usuario.coleiras.some(
      (coleira) =>
        coleira.n_coleira === dadosColeira.n_coleira
    );

    if (numeroExistente) {
      const erro = new Error(
        'Já existe uma coleira com esse número.'
      );
      erro.status = 409;
      throw erro;
    }

    usuario.coleiras.push(dadosColeira);
    await usuario.save();

    return usuario.coleiras[usuario.coleiras.length - 1];
  }

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
        estadosDeAtencao.includes(
          ultimoEstresse.estado_estresse
        )
      ) {
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
      }
    });

    return alertas;
  }
}

module.exports = new ColeiraService();
