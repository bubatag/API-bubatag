
const coleiraService = require('../services/coleiraService');

function validarUsuarioDaRota(req, res) {
  const usuarioAutenticado = req.usuario.id || req.usuario._id;

  if (String(usuarioAutenticado) !== String(req.params.usuarioId)) {
    res.status(403).json({
      sucesso: false,
      mensagem: 'Você não tem permissão para acessar este usuário.'
    });

    return false;
  }

  return true;
}

// Cadastra uma coleira sem exigir um bubalino associado.
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

// Lista todas as coleiras do usuário, ativas e inativas.
exports.listarPorUsuario = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const coleiras = await coleiraService.listarPorUsuario(
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

// Lista coleiras ativas, disponíveis e sem bubalino associado.
exports.listarDisponiveisParaUsuario = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const coleiras = await coleiraService.listarDisponiveisParaUsuario(
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

// Associa um bubalino a uma coleira existente.
exports.associarBubalino = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const resultado = await coleiraService.associarBubalino(
      req.params.usuarioId,
      req.params.coleiraId,
      req.body
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Bubalino associado à coleira com sucesso.',
      bubalino: resultado.bubalino,
      coleira: resultado.coleira
    });
  } catch (error) {
    next(error);
  }
};

// Edita os dados de uma coleira.
exports.editar = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const coleira = await coleiraService.editar(
      req.params.usuarioId,
      req.params.coleiraId,
      req.body
    );

    res.status(200).json({
      sucesso: true,
      mensagem: 'Coleira atualizada com sucesso.',
      coleira
    });
  } catch (error) {
    next(error);
  }
};

// Desativa uma coleira sem apagar seus dados ou desvincular o bubalino.
exports.excluir = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const resultado = await coleiraService.excluir(
      req.params.usuarioId,
      req.params.coleiraId
    );

    res.status(200).json({
      sucesso: true,
      ...resultado
    });
  } catch (error) {
    next(error);
  }
};

// Reativa uma coleira anteriormente desativada.
exports.reativar = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const resultado = await coleiraService.reativar(
      req.params.usuarioId,
      req.params.coleiraId
    );

    res.status(200).json({
      sucesso: true,
      ...resultado
    });
  } catch (error) {
    next(error);
  }
};

// Desvincula o bubalino sem apagar seu cadastro ou histórico.
exports.desvincularBubalino = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const resultado = await coleiraService.desvincularBubalino(
      req.params.usuarioId,
      req.params.coleiraId
    );

    res.status(200).json({
      sucesso: true,
      ...resultado
    });
  } catch (error) {
    next(error);
  }
};

// Consulta os alertas do usuário.
exports.obterAlertas = async (req, res, next) => {
  try {
    if (!validarUsuarioDaRota(req, res)) return;

    const alertas = await coleiraService.buscarAlertas(
      req.params.usuarioId
    );

    res.status(200).json({
      sucesso: true,
      alertas
    });
  } catch (error) {
    next(error);
  }
};
