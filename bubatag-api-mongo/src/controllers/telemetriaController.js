const telemetriaService = require('../services/telemetriaService');

class TelemetriaController {
  async registrar(req, res, next) {
    try {
      const resultado = await telemetriaService.registrarLeitura(req.body);
      return res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TelemetriaController();