const { test } = require('node:test');
const assert = require('node:assert/strict');
const validarTelemetria = require('../src/middlewares/validarTelemetria');

function executarMiddleware(body) {
  let status;
  let resposta;
  let chamouNext = false;

  const req = { body };
  const res = {
    status(codigo) {
      status = codigo;
      return this;
    },
    json(dados) {
      resposta = dados;
      return this;
    },
  };
  const next = () => {
    chamouNext = true;
  };

  validarTelemetria(req, res, next);

  return { status, resposta, chamouNext };
}

test('rejeita requisição sem número de coleira', () => {
  const resultado = executarMiddleware({ temperatura: 38, batimento_cardiaco: 70 });

  assert.equal(resultado.status, 400);
  assert.equal(resultado.chamouNext, false);
});

test('rejeita batimento abaixo do limite', () => {
  const resultado = executarMiddleware({
    n_coleira: 'COL-TESTE-001',
    batimento_cardiaco: 19,
    temperatura: 38,
  });

  assert.equal(resultado.status, 400);
});

test('rejeita batimento acima do limite', () => {
  const resultado = executarMiddleware({
    n_coleira: 'COL-TESTE-001',
    batimento_cardiaco: 221,
    temperatura: 38,
  });

  assert.equal(resultado.status, 400);
});

test('rejeita temperatura abaixo do limite', () => {
  const resultado = executarMiddleware({
    n_coleira: 'COL-TESTE-001',
    batimento_cardiaco: 70,
    temperatura: 33,
  });

  assert.equal(resultado.status, 400);
});

test('rejeita temperatura acima do limite', () => {
  const resultado = executarMiddleware({
    n_coleira: 'COL-TESTE-001',
    batimento_cardiaco: 70,
    temperatura: 45,
  });

  assert.equal(resultado.status, 400);
});

test('rejeita estado de estresse desconhecido', () => {
  const resultado = executarMiddleware({
    n_coleira: 'COL-TESTE-001',
    estado_estresse: 'Estado Inventado',
  });

  assert.equal(resultado.status, 400);
});

test('aceita telemetria com valores dentro dos limites', () => {
  const resultado = executarMiddleware({
    n_coleira: 'COL-TESTE-001',
    batimento_cardiaco: 70,
    temperatura: 38,
    estado_estresse: 'Normal',
  });

  assert.equal(resultado.chamouNext, true);
  assert.equal(resultado.status, undefined);
});