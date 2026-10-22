
const Usuario = require('../models/Usuario');

class ReportService {
  async gerarRelatorioPorColeira(n_coleira) {
    const usuario = await Usuario.findOne({
      'coleiras.n_coleira': n_coleira,
    });

    if (!usuario) {
      const erro = new Error(`Coleira ${n_coleira} não encontrada.`);
      erro.status = 404;
      throw erro;
    }

    const coleira = usuario.coleiras.find(
      (item) => item.n_coleira === n_coleira
    );

    if (!coleira || !coleira.bubalino) {
      const erro = new Error(
        `Nenhum bubalino associado à coleira ${n_coleira}.`
      );
      erro.status = 400;
      throw erro;
    }

    const bubalino = coleira.bubalino;
    const ultimosDados = (bubalino.dados || []).slice(-20);
    const ultimosEstresses = (bubalino.historico_estresse || []).slice(-20);

    if (ultimosDados.length === 0) {
      return {
        sucesso: false,
        mensagem: 'Dados de telemetria insuficientes para gerar o relatório.',
      };
    }

    const totalRegistros = ultimosDados.length;

    const contagemStatus = ultimosEstresses.reduce((acc, item) => {
      acc[item.estado_estresse] = (acc[item.estado_estresse] || 0) + 1;
      return acc;
    }, {});

    const mediaBpm = Number(
      (
        ultimosDados.reduce(
          (acc, dado) => acc + dado.batimento_cardiaco,
          0
        ) / totalRegistros
      ).toFixed(1)
    );

    const mediaTemp = Number(
      (
        ultimosDados.reduce(
          (acc, dado) => acc + dado.temperatura,
          0
        ) / totalRegistros
      ).toFixed(1)
    );

    const quantidadeEstresse = Object.entries(contagemStatus)
      .filter(([estado]) =>
        ['Estressado', 'Estresse Térmico', 'Estresse Crítico'].includes(estado)
      )
      .reduce((total, [, quantidade]) => total + quantidade, 0);

    let parecer;
    if (quantidadeEstresse > 0) {
      parecer =
        'Há registros classificados como possíveis sinais de estresse. ' +
        'Recomenda-se verificar as condições ambientais e acompanhar novas leituras.';
    } else if (mediaTemp > 39.2 || mediaBpm > 80) {
      parecer =
        'Uma ou mais médias estão acima das referências configuradas no sistema. ' +
        'É recomendável acompanhar novas leituras e verificar as condições do animal.';
    } else {
      parecer =
        'As médias estão dentro das referências configuradas no sistema. ' +
        'Isso, isoladamente, não confirma a ausência de estresse.';
    }

    const alertas = [];

    if (mediaTemp > 39.2) {
      alertas.push(
        'A temperatura média está acima da referência configurada. Verifique sombra, água disponível e possibilidade de exposição ao calor.'
      );
    }

    if (mediaBpm > 80) {
      alertas.push(
        'A frequência cardíaca média está acima da referência configurada. Considere fatores como atividade física, calor e manejo.'
      );
    }

    if (quantidadeEstresse > 0) {
      alertas.push(
        `Foram encontrados ${quantidadeEstresse} registros de estresse entre os estados considerados no relatório.`
      );
    }

    if (alertas.length === 0) {
      alertas.push(
        'Não foram identificados alertas pelas regras configuradas. Continue monitorando o animal e as condições ambientais.'
      );
    }

    const orientacoes = [
      'Disponibilizar água limpa e acesso à sombra.',
      'Observar o comportamento do animal e possíveis mudanças no ambiente.',
      'Se os sinais persistirem ou houver alteração importante, procurar orientação de um médico-veterinário.',
    ];

    const relatorio = [
      '# Relatório de monitoramento Bubatag',
      '',
      '## 1. Parecer geral',
      parecer,
      '',
      '## 2. Métricas consolidadas',
      `- Leituras avaliadas: ${totalRegistros}`,
      `- Frequência cardíaca média: ${mediaBpm} bpm`,
      `- Temperatura média: ${mediaTemp} °C`,
      `- Distribuição dos estados: ${JSON.stringify(contagemStatus)}`,
      '',
      '## 3. Alertas e possíveis fatores',
      ...alertas.map((alerta) => `- ${alerta}`),
      '',
      '## 4. Orientações de manejo',
      ...orientacoes.map((orientacao) => `- ${orientacao}`),
      '',
      '> Relatório experimental baseado em regras e dados registrados. ' +
        'Não constitui diagnóstico veterinário. As referências configuradas ' +
        'não substituem uma avaliação profissional.',
    ].join('\n');

    return {
      sucesso: true,
      animal: {
        nome: bubalino.nome || 'Não informado',
        etiqueta: bubalino.n_etiqueta,
        raca: bubalino.raca,
        localizacao: coleira.coleira_localizacao,
      },
      metricas: {
        amostras_avaliadas: totalRegistros,
        bpm_medio: mediaBpm,
        temperatura_media: mediaTemp,
        distribuicao_estados: contagemStatus,
      },
      relatorio_clinico: relatorio,
      metodo_geracao: 'regras locais experimentais',
    };
  }
}

module.exports = new ReportService();
