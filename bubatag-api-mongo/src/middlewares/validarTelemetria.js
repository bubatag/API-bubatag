module.exports = (req, res, next) => {
  const { n_coleira, batimento_cardiaco, temperatura, estado_estresse } = req.body;

  if (!n_coleira) {
    return res.status(400).json({ sucesso: false, mensagem: 'O campo n_coleira é obrigatório.' });
  }

  if (batimento_cardiaco !== undefined && (batimento_cardiaco < 20 || batimento_cardiaco > 220)) {
    return res.status(400).json({ sucesso: false, mensagem: 'Batimento cardíaco fora dos limites fisiológicos aceitáveis.' });
  }

  if (temperatura !== undefined && (temperatura < 34 || temperatura > 44)) {
    return res.status(400).json({ sucesso: false, mensagem: 'Temperatura fora dos limites aceitáveis.' });
  }

  const estadosValidos = ['Normal', 'Ocioso', 'Alerta', 'Estresse Térmico', 'Estresse Crítico', 'Estressado'];
  if (estado_estresse && !estadosValidos.includes(estado_estresse)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: `estado_estresse inválido. Valores aceitos: ${estadosValidos.join(', ')}.`
    });
  }

  next();
};