
const reportService = require('../services/reportServices');

class ReportController {
  async gerarPorColeira(req, res, next) {
    try {
      const { n_coleira } = req.params;

      const resultado = await reportService.gerarRelatorioPorColeira(
        n_coleira
      );

      if (!resultado.sucesso) {
        return res.status(422).json(resultado);
      }

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = new ReportController();
