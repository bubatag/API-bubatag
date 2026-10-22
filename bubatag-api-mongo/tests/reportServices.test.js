const { test, mock } = require('node:test');
const assert = require('node:assert/strict');

const Usuario = require('../src/models/Usuario');
const reportService = require('../src/services/reportServices');

function criarUsuario(dados = [], historico_estresse = []) {
  return {
    coleiras: [
      {
        n_coleira: 'COL-TESTE-001',
        coleira_localizacao: 'Maquete Bubatag',
        bubalino: {
          n_etiqueta: 'ETQ-TESTE-001',
          raca: 'Murrah',
          dados,
          historico_estresse,
        },
      },
    ],
  };
}

test('gera relatório com médias corretas das leituras', async () => {
  const usuarioFake = criarUsuario([
    { batimento_cardiaco: 70, temperatura: 38 },
    { batimento_cardiaco: 90, temperatura: 40 },
  ]);

  const consulta = mock.method(Usuario, 'findOne', async () => usuarioFake);

  try {
    const resultado = await reportService.gerarRelatorioPorColeira(
      'COL-TESTE-001'
    );

    assert.equal(resultado.sucesso, true);
    assert.equal(resultado.metricas.amostras_avaliadas, 2);
    assert.equal(resultado.metricas.bpm_medio, 80);
    assert.equal(resultado.metricas.temperatura_media, 39);
    assert.equal(resultado.metodo_geracao, 'regras locais experimentais');
  } finally {
    consulta.mock.restore();
  }
});

test('conta os estados de estresse registrados', async () => {
  const usuarioFake = criarUsuario(
    [{ batimento_cardiaco: 70, temperatura: 38 }],
    [
      { estado_estresse: 'Estressado' },
      { estado_estresse: 'Normal' },
      { estado_estresse: 'Estressado' },
    ]
  );

  const consulta = mock.method(Usuario, 'findOne', async () => usuarioFake);

  try {
    const resultado = await reportService.gerarRelatorioPorColeira(
      'COL-TESTE-001'
    );

    assert.deepEqual(resultado.metricas.distribuicao_estados, {
      Estressado: 2,
      Normal: 1,
    });

    assert.match(resultado.relatorio_clinico, /possíveis sinais de estresse/);
  } finally {
    consulta.mock.restore();
  }
});

test('não gera relatório quando não há leituras biométricas', async () => {
  const usuarioFake = criarUsuario([]);

  const consulta = mock.method(Usuario, 'findOne', async () => usuarioFake);

  try {
    const resultado = await reportService.gerarRelatorioPorColeira(
      'COL-TESTE-001'
    );

    assert.equal(resultado.sucesso, false);
    assert.match(resultado.mensagem, /insuficientes/i);
  } finally {
    consulta.mock.restore();
  }
});

test('retorna erro 404 quando a coleira não pertence a nenhum usuário', async () => {
  const consulta = mock.method(Usuario, 'findOne', async () => null);

  try {
    await assert.rejects(
      reportService.gerarRelatorioPorColeira('COL-INEXISTENTE'),
      (erro) => erro.status === 404
    );
  } finally {
    consulta.mock.restore();
  }
});