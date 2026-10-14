module.exports = (err, req, res, next) => {
  console.error('[ERRO CAPTURADO]:', err.message);

  const status = err.status || 500;
  res.status(status).json({
    sucesso: false,
    mensagem: err.message || 'Erro interno no servidor.',
    ...(process.env.NODE_ENV === 'development' && { detalhes: err.stack })
  });
};