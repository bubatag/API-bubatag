const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Acesso negado. Token não fornecido.'
    });
  }

  const partes = authHeader.split(' ');

  if (partes.length !== 2) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Erro no formato do token. Formato esperado: Bearer <token>.'
    });
  }

  const [esquema, token] = partes;

  if (!/^Bearer$/i.test(esquema)) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token malformatado. Deve iniciar com Bearer.'
    });
  }

  try {
    const payloadDecodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payloadDecodificado;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token expirado. Por favor, realize o login novamente.'
      });
    }

    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido ou corrompido.'
    });
  }
};