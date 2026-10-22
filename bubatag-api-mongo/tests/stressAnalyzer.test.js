const { test, mock } = require('node:test');
const assert = require('node:assert/strict');

const stressAnalyzer = require('../src/services/stressAnalyzer');

test('classifica estado Normal e retorna alerta NORMAL', async () => {
  const fetchMock = mock.method(global, 'fetch', async () => ({
    ok: true,
    json: async () => ({
      estado: 'Normal',
      modelo: 'bubatag-ml-v1',
      origem_dados: 'dados simulados',
    }),
  }));

  try {
    const resultado = await stressAnalyzer.avaliarEstresse(70, 38);

    assert.equal(resultado.estado, 'Normal');
    assert.equal(resultado.nivelAlerta, 'NORMAL');
    assert.equal(resultado.modelo, 'bubatag-ml-v1');
  } finally {
    fetchMock.mock.restore();
  }
});

test('classifica estado Estressado e retorna alerta MEDIO', async () => {
  const fetchMock = mock.method(global, 'fetch', async () => ({
    ok: true,
    json: async () => ({
      estado: 'Estressado',
      modelo: 'bubatag-ml-v1',
      origem_dados: 'dados simulados',
    }),
  }));

  try {
    const resultado = await stressAnalyzer.avaliarEstresse(90, 39);

    assert.equal(resultado.estado, 'Estressado');
    assert.equal(resultado.nivelAlerta, 'MEDIO');
  } finally {
    fetchMock.mock.restore();
  }
});

test('classifica Estresse Crítico e retorna alerta CRITICO', async () => {
  const fetchMock = mock.method(global, 'fetch', async () => ({
    ok: true,
    json: async () => ({
      estado: 'Estresse Crítico',
      modelo: 'bubatag-ml-v1',
      origem_dados: 'dados simulados',
    }),
  }));

  try {
    const resultado = await stressAnalyzer.avaliarEstresse(130, 40);

    assert.equal(resultado.estado, 'Estresse Crítico');
    assert.equal(resultado.nivelAlerta, 'CRITICO');
  } finally {
    fetchMock.mock.restore();
  }
});

test('retorna erro 503 quando o serviço de IA está indisponível', async () => {
  const fetchMock = mock.method(global, 'fetch', async () => {
    throw new Error('Falha de conexão simulada');
  });

  try {
    await assert.rejects(
      stressAnalyzer.avaliarEstresse(90, 39),
      (erro) => erro.status === 503
    );
  } finally {
    fetchMock.mock.restore();
  }
});

test('retorna erro 503 quando a IA responde com falha HTTP', async () => {
  const fetchMock = mock.method(global, 'fetch', async () => ({
    ok: false,
    status: 500,
  }));

  try {
    await assert.rejects(
      stressAnalyzer.avaliarEstresse(90, 39),
      (erro) => erro.status === 503
    );
  } finally {
    fetchMock.mock.restore();
  }
});

test('retorna erro 502 quando a IA devolve estado desconhecido', async () => {
  const fetchMock = mock.method(global, 'fetch', async () => ({
    ok: true,
    json: async () => ({
      estado: 'Estado Inventado',
    }),
  }));

  try {
    await assert.rejects(
      stressAnalyzer.avaliarEstresse(90, 39),
      (erro) => erro.status === 502
    );
  } finally {
    fetchMock.mock.restore();
  }
});