
const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

class StressAnalyzer {
  async avaliarEstresse(batimento, temperatura) {
    let resposta;

    try {
      resposta = await fetch(`${ML_SERVICE_URL}/classificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperatura: Number(temperatura),
          batimento_cardiaco: Number(batimento),
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch (erro) {
      const erroServico = new Error(
        'O serviço de IA do Bubatag está indisponível.'
      );
      erroServico.status = 503;
      throw erroServico;
    }

    if (!resposta.ok) {
      const erroServico = new Error(
        'Não foi possível classificar os dados do animal.'
      );
      erroServico.status = 503;
      throw erroServico;
    }

    const resultado = await resposta.json();
    const estado = resultado.estado;

    const niveisAlerta = {
      Normal: 'NORMAL',
      Estressado: 'MEDIO',
      'Estresse Crítico': 'CRITICO',
    };

    if (!Object.hasOwn(niveisAlerta, estado)) {
      const erroServico = new Error(
        'O serviço de IA retornou um estado desconhecido.'
      );
      erroServico.status = 502;
      throw erroServico;
    }

    const descricoes = {
      Normal: 'O modelo não identificou sinais de estresse nos dados informados.',
      Estressado: 'O modelo identificou um possível estado de estresse.',
      'Estresse Crítico': 'O modelo identificou um possível estado de estresse crítico.',
    };

    return {
      estado,
      nivelAlerta: niveisAlerta[estado],
      descricao: descricoes[estado],
      modelo: resultado.modelo,
      origem_dados: resultado.origem_dados,
    };
  }
}

module.exports = new StressAnalyzer();
