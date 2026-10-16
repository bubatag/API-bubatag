const Usuario = require('../models/Usuario');
const stressAnalyzer = require('./stressAnalyzer');

class TelemetriaService {
  async registrarLeitura({ n_coleira, batimento_cardiaco, temperatura, latitude, longitude, estado_estresse }) {
    const usuario = await Usuario.findOne({ 'coleiras.n_coleira': n_coleira });
    if (!usuario) {
      const erro = new Error(`Coleira ${n_coleira} não encontrada.`);
      erro.status = 404;
      throw erro;
    }

    const coleira = usuario.coleiras.find((c) => c.n_coleira === n_coleira);
    if (!coleira || !coleira.bubalino) {
      const erro = new Error(`Nenhum bubalino associado à coleira ${n_coleira}.`);
      erro.status = 400;
      throw erro;
    }

    const agora = new Date();

    if (!coleira.bubalino.dados) coleira.bubalino.dados = [];
    if (!coleira.bubalino.localizacao) coleira.bubalino.localizacao = [];
    if (!coleira.bubalino.historico_estresse) coleira.bubalino.historico_estresse = [];

    if (batimento_cardiaco !== undefined && temperatura !== undefined) {
      coleira.bubalino.dados.push({
        batimento_cardiaco: Number(batimento_cardiaco),
        temperatura: Number(temperatura),
        ativo: true,
        data: agora
      });
    }

    if (latitude && longitude) {
      coleira.bubalino.localizacao.push({
        latitude: String(latitude),
        longitude: String(longitude),
        ativo: true
      });
    }

    let analiseResultado = null;

    if (estado_estresse) {
      coleira.bubalino.historico_estresse.push({
        estado_estresse,
        data_estresse: agora,
        ativo: true
      });
    } else if (batimento_cardiaco !== undefined && temperatura !== undefined) {
      analiseResultado = stressAnalyzer.avaliarEstresse(batimento_cardiaco, temperatura);
      
      coleira.bubalino.historico_estresse.push({
        estado_estresse: analiseResultado.estado,
        data_estresse: agora,
        ativo: true
      });
    }

    usuario.markModified('coleiras');
    await usuario.save();

    return {
      sucesso: true,
      n_coleira,
      n_etiqueta: coleira.bubalino.n_etiqueta,
      timestamp: agora,
      status_estresse: analiseResultado ? analiseResultado.estado : (estado_estresse || 'Não avaliado'),
      nivel_alerta: analiseResultado ? analiseResultado.nivelAlerta : 'NORMAL',
      mensagem: 'Telemetria persistida e avaliada com sucesso.'
    };
  }
}

module.exports = new TelemetriaService();