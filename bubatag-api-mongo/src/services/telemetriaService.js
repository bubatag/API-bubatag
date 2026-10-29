
const Usuario = require('../models/Usuario');
const stressAnalyzer = require('./stressAnalyzer');

class TelemetriaService {
  async registrarLeitura({
    n_coleira,
    batimento_cardiaco,
    temperatura,
    latitude,
    longitude,
    estado_estresse,
  }) {
    const usuario = await Usuario.findOne({
      'coleiras.n_coleira': n_coleira,
    });

    if (!usuario) {
      const erro = new Error(`Coleira ${n_coleira} não encontrada.`);
      erro.status = 404;
      throw erro;
    }

    const coleira = usuario.coleiras.find(
      (c) => c.n_coleira === n_coleira
    );

    if (!coleira) {
      const erro = new Error(`Coleira ${n_coleira} não encontrada.`);
      erro.status = 404;
      throw erro;
    }

    // Impede o recebimento de telemetria de coleiras desativadas.
    if (coleira.ativo === false) {
      const erro = new Error(
        `A coleira ${n_coleira} está desativada e não pode enviar telemetria.`
      );
      erro.status = 400;
      throw erro;
    }

    if (!coleira.bubalino) {
      const erro = new Error(
        `Nenhum bubalino associado à coleira ${n_coleira}.`
      );
      erro.status = 400;
      throw erro;
    }

    const agora = new Date();
    const bubalino = coleira.bubalino;

    if (!bubalino.dados) {
      bubalino.dados = [];
    }

    if (!bubalino.localizacao) {
      bubalino.localizacao = [];
    }

    if (!bubalino.historico_estresse) {
      bubalino.historico_estresse = [];
    }

    const possuiTemperatura = temperatura !== undefined;
    const possuiBatimentos = batimento_cardiaco !== undefined;

    // Salva as medições quando ambos os valores foram enviados.
    if (possuiBatimentos && possuiTemperatura) {
      bubalino.dados.push({
        batimento_cardiaco: Number(batimento_cardiaco),
        temperatura: Number(temperatura),
        ativo: true,
        data: agora,
      });
    }

    // Salva a localização quando as duas coordenadas foram enviadas.
    if (latitude !== undefined && longitude !== undefined) {
      bubalino.localizacao.push({
        latitude: String(latitude),
        longitude: String(longitude),
        ativo: true,
      });
    }

    let analiseResultado = null;
    let erroClassificacao = false;

    // Se o estado foi informado manualmente, mantém esse comportamento.
    if (estado_estresse) {
      bubalino.historico_estresse.push({
        estado_estresse,
        data_estresse: agora,
        ativo: true,
      });
    } else if (possuiBatimentos && possuiTemperatura) {
      // Solicita a classificação ao serviço de IA em Python.
      try {
        analiseResultado = await stressAnalyzer.avaliarEstresse(
          batimento_cardiaco,
          temperatura
        );

        bubalino.historico_estresse.push({
          estado_estresse: analiseResultado.estado,
          data_estresse: agora,
          ativo: true,
        });
      } catch (erro) {
        // A leitura será salva mesmo se a IA estiver indisponível.
        erroClassificacao = true;
        console.error(
          'Falha ao classificar telemetria com a IA:',
          erro.message
        );
      }
    }

    // Persiste a telemetria e o histórico disponível.
    usuario.markModified('coleiras');
    await usuario.save();

    const estadoFinal = analiseResultado
      ? analiseResultado.estado
      : estado_estresse || 'Não avaliado';

    const nivelAlerta = analiseResultado
      ? analiseResultado.nivelAlerta
      : estado_estresse
        ? 'NAO_AVALIADO'
        : 'NAO_AVALIADO';

    return {
      sucesso: true,
      n_coleira,
      n_etiqueta: bubalino.n_etiqueta,
      timestamp: agora,
      status_estresse: estadoFinal,
      nivel_alerta: nivelAlerta,
      classificacao_disponivel: !erroClassificacao && (
        Boolean(analiseResultado) || Boolean(estado_estresse)
      ),
      mensagem: erroClassificacao
        ? 'Telemetria salva, mas não foi possível classificar os dados. Verifique o serviço de IA.'
        : 'Telemetria salva com sucesso.',
    };
  }
}

module.exports = new TelemetriaService();
