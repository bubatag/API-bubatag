
const coleiraService = require('../services/coleiraService');

function validarUsuarioDaRota(req, res) {
  if (String(req.usuario.id) !== String(req.params.usuarioId)) {
    res.status(403).json({
      sucesso: false,
      mensagem: 'Você não tem permissão para acessar este usuário.'
    });

    return false;
  }

  return true;
}

// Cadastra uma coleira sem exigir um búfalo associado.
exports.cadastrarParaUsuario = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const coleira = await coleiraService.cadastrarParaUsuario(
      req.params.usuarioId,
      req.body
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Coleira cadastrada com sucesso.',
      coleira
    });
  } catch (error) {
    next(error);
  }
};

// Lista todas as coleiras do usuário.
exports.listarPorUsuario = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const coleiras = await coleiraService.listarPorUsuario(
      req.params.usuarioId
    );

    res.status(200).json(coleiras);
  } catch (error) {
    next(error);
  }
};

// Lista somente as coleiras ativas e sem búfalo associado.
exports.listarDisponiveisParaUsuario = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const coleiras =
      await coleiraService.listarDisponiveisParaUsuario(
        req.params.usuarioId
      );

    res.status(200).json({
      sucesso: true,
      coleiras
    });
  } catch (error) {
    next(error);
  }
};

// Associa um búfalo a uma coleira existente.
exports.associarBubalino = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const coleira = await coleiraService.associarBubalino(
      req.params.usuarioId,
      req.params.coleiraId,
      req.body
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Búfalo associado à coleira com sucesso.',
      coleira
    });
  } catch (error) {
    next(error);
  }
};

// Mantém a consulta de alertas existente.
exports.obterAlertas = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const alertas = await coleiraService.buscarAlertas(
      req.params.usuarioId
    );

    res.status(200).json(alertas);
  } catch (error) {
    next(error);
  }
};
