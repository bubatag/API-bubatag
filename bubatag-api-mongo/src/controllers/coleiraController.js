const coleiraService = require('../services/coleiraService');

exports.listarPorUsuario = async (req, res, next) => {
  try {
    const coleiras = await coleiraService.listarPorUsuario(req.params.usuarioId);
    res.status(200).json(coleiras);
  } catch (error) {
    next(error);
  }
};

exports.obterAlertas = async (req, res, next) => {
  try {
    const alertas = await coleiraService.buscarAlertas(req.params.usuarioId);
    res.status(200).json(alertas);
  } catch (error) {
    next(error);
  }
};