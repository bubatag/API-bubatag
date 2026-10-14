const telemetriaService = require('../services/telemetriaService');

exports.registrar = async (req, res, next) => {
  try {
    const resultado = await telemetriaService.registrarLeitura(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};