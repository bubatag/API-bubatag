const Usuario = require('../models/Usuario');

class ColeiraService {
  // ... outros métodos existentes (ex: listarPorUsuario)

  async buscarAlertas(usuarioId) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      const erro = new Error('Usuário não encontrado.');
      erro.status = 404;
      throw erro;
    }

    const alertas = [];

    // Estados que configuram alerta ou atenção imediata
    const estadosDeAtencao = ['Alerta', 'Estresse Térmico', 'Estresse Crítico'];

    (usuario.coleiras || []).forEach((coleira) => {
      // Ignora coleiras inativas ou sem animal associado
      if (!coleira.ativo || !coleira.bubalino || !coleira.bubalino.ativo) {
        return;
      }

      const bubalino = coleira.bubalino;
      const historicoEstresse = bubalino.historico_estresse || [];

      if (historicoEstresse.length === 0) {
        return;
      }

      // Pega o último evento de estresse registrado
      const ultimoEstresse = historicoEstresse[historicoEstresse.length - 1];

      // Se o último estado registrado for de atenção/estresse, adiciona ao payload de alertas
      if (estadosDeAtencao.includes(ultimoEstresse.estado_estresse)) {
        const dadosBiometricos = bubalino.dados || [];
        const ultimosDados = dadosBiometricos.length > 0 ? dadosBiometricos[dadosBiometricos.length - 1] : null;

        const localizacoes = bubalino.localizacao || [];
        const ultimaLocalizacao = localizacoes.length > 0 ? localizacoes[localizacoes.length - 1] : null;

        // Define prioridade visual para a UI (Badge / Cores)
        let prioridade = 'MEDIA';
        if (ultimoEstresse.estado_estresse === 'Estresse Crítico') {
          prioridade = 'ALTA';
        } else if (ultimoEstresse.estado_estresse === 'Estresse Térmico') {
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
            batimento_cardiaco: ultimosDados ? ultimosDados.batimento_cardiaco : null,
            temperatura: ultimosDados ? ultimosDados.temperatura : null,
            data_leitura: ultimosDados ? ultimosDados.data : null
          },
          localizacao_atual: {
            latitude: ultimaLocalizacao ? ultimaLocalizacao.latitude : null,
            longitude: ultimaLocalizacao ? ultimaLocalizacao.longitude : null
          }
        });
      }
    });

    return alertas;
  }
}

module.exports = new ColeiraService();