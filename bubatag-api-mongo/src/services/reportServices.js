const { GoogleGenAI } = require('@google/genai');
const Usuario = require('../models/Usuario');

const ai = new GoogleGenAI();

class ReportService {
  async gerarRelatorioPorColeira(n_coleira) {
    const usuario = await Usuario.findOne({ 'coleiras.n_coleira': n_coleira });
    if (!usuario) {
      const erro = new Error(`Coleira ${n_coleira} não encontrada.`);
      erro.status = 404;
      throw erro;
    }

    const coleira = usuario.coleiras.find((c) => c.n_coleira === n_coleira);
    const bubalino = coleira.bubalino;

    const ultimosDados = bubalino.dados.slice(-20);
    const ultimosEstresses = bubalino.historico_estresse.slice(-20);

    if (ultimosDados.length === 0) {
      return {
        sucesso: false,
        mensagem: 'Dados de telemetria insuficientes para gerar análise clínica.'
      };
    }

    const totalRegistros = ultimosDados.length;
    const contagemStatus = ultimosEstresses.reduce((acc, item) => {
      acc[item.estado_estresse] = (acc[item.estado_estresse] || 0) + 1;
      return acc;
    }, {});

    const mediaBpm = (
      ultimosDados.reduce((acc, d) => acc + d.batimento_cardiaco, 0) / totalRegistros
    ).toFixed(1);

    const mediaTemp = (
      ultimosDados.reduce((acc, d) => acc + d.temperatura, 0) / totalRegistros
    ).toFixed(1);

    const prompt = `
És um médico-veterinário e zootecnista especialista em bem-estar de bubalinos (búfalos) no projeto Bubatag.
Com base nos dados telemétricos recolhidos pelos sensores, elabora um parecer técnico sucinto e objetivo para o produtor rural.

Ficha do Animal:
- Identificação: ${bubalino.nome} (Brinco/Etiqueta: ${bubalino.n_etiqueta})
- Raça: ${bubalino.raca} | Sexo: ${bubalino.sexo}
- Piquete/Localização da Coleira: ${coleira.coleira_localizacao}

Métricas Consolidadas (Últimas ${totalRegistros} leituras):
- Frequência Cardíaca Média: ${mediaBpm} bpm (Referência segura: <= 80 bpm)
- Temperatura Média: ${mediaTemp} °C (Referência fisiológica: <= 39.2 °C)
- Distribuição de Estados: ${JSON.stringify(contagemStatus)}

Estrutura o relatório em Markdown com as seguintes secções:
1. **Parecer Geral do Animal**: Avaliação do conforto térmico e esforço físico.
2. **Alertas e Possíveis Causas**: Fatores ambientais (radiação solar direta, falta de poças/água para imersão) ou estresse de manejo.
3. **Orientações para o Manejo**: 2 a 3 ações práticas imediatas para o produtor aplicar no pasto.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return {
      sucesso: true,
      animal: {
        nome: bubalino.nome,
        etiqueta: bubalino.n_etiqueta,
        raca: bubalino.raca,
        localizacao: coleira.coleira_localizacao
      },
      metricas: {
        amostras_avaliadas: totalRegistros,
        bpm_medio: Number(mediaBpm),
        temperatura_media: Number(mediaTemp),
        distribuicao_estados: contagemStatus
      },
      relatorio_clinico: response.text
    };
  }
}

module.exports = new ReportService();