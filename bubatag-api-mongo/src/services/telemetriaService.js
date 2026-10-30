
const Usuario = require('../models/Usuario');
const stressAnalyzer = require('./stressAnalyzer');

function criarErro(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

class TelemetriaService {
  async registrarLeitura({
    n_coleira,
    batimento_cardiaco,
    temperatura,
    latitude,
    longitude,
    estado_estresse,
  }) {
    const numeroColeira = String(n_coleira || '').trim();

    if (!numeroColeira) {
      throw criarErro('Informe o número da coleira.', 400);
    }

    const usuario = await Usuario.findOne({
      'coleiras.n_coleira': numeroColeira,
    });

    if (!usuario) {
      throw criarErro(
        `Coleira ${numeroColeira} não encontrada.`,
        404
      );
    }

    const coleira = usuario.coleiras.find(
      (item) => item.n_coleira === numeroColeira
    );

    if (!coleira || coleira.excluido_em) {
      throw criarErro(
        `Coleira ${numeroColeira} não encontrada.`,
        404
      );
    }

    // Impede leituras de coleiras inativas.
    if (coleira.ativo === false) {
      throw criarErro(
        `A coleira ${numeroColeira} está desativada e não pode enviar telemetria.`,
        400
      );
    }

    // Verifica se existe um bubalino associado.
    if (!coleira.bubalino_id) {
      throw criarErro(
        `Nenhum bubalino associado à coleira ${numeroColeira}.`,
        400
      );
    }

    // Localiza o animal no cadastro independente.
    const bubalino = usuario.bubalinos.id(
      coleira.bubalino_id
    );

    if (!bubalino || bubalino.excluido_em) {
      throw criarErro(
        `O bubalino associado à coleira ${numeroColeira} não foi encontrado.`,
        404
      );
    }

    // Impede leituras de animais inativos.
    if (bubalino.ativo === false) {
      throw criarErro(
        `O bubalino ${bubalino.n_etiqueta} está inativo e não pode receber telemetria.`,
        400
      );
    }

    const agora = new Date();

    const possuiTemperatura = temperatura !== undefined;
    const possuiBatimentos = batimento_cardiaco !== undefined;

    // Salva os dados biométricos quando ambos foram enviados.
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
        data: agora,
      });
    }

    let analiseResultado = null;
    let erroClassificacao = false;

    // Mantém a possibilidade de informar o estado manualmente.
    if (estado_estresse) {
      bubalino.historico_estresse.push({
        estado_estresse,
        data_estresse: agora,
        ativo: true,
      });
    } else if (possuiBatimentos && possuiTemperatura) {
      // Solicita a classificação ao serviço de IA.
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
        erroClassificacao = true;

        console.error(
          'Falha ao classificar telemetria com a IA:',
          erro.message
        );
      }
    }

    // Persiste os dados no cadastro independente do bubalino.
    usuario.markModified('bubalinos');
    await usuario.save();

    const estadoFinal = analiseResultado
      ? analiseResultado.estado
      : estado_estresse || 'Não avaliado';

    const nivelAlerta = analiseResultado
      ? analiseResultado.nivelAlerta
      : 'NAO_AVALIADO';

    return {
      sucesso: true,
      n_coleira: numeroColeira,
      coleira_id: coleira._id,
      bubalino_id: bubalino._id,
      n_etiqueta: bubalino.n_etiqueta,
      timestamp: agora,
      status_estresse: estadoFinal,
      nivel_alerta: nivelAlerta,
      classificacao_disponivel:
        !erroClassificacao &&
        (Boolean(analiseResultado) || Boolean(estado_estresse)),
      mensagem: erroClassificacao
        ? 'Telemetria salva, mas não foi possível classificar os dados. Verifique o serviço de IA.'
        : 'Telemetria salva com sucesso.',
    };
  }
}

module.exports = new TelemetriaService();
