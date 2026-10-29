
const bubalinoService = require('../services/bubalinoService');

exports.cadastrar = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id || req.usuario._id;

    const coleira = await bubalinoService.cadastrar(
      usuarioId,
      req.body
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Bubalino cadastrado com sucesso.',
      bubalino: coleira.bubalino,
      coleira
    });
  } catch (error) {
    next(error);
  }
};

exports.atualizar = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id || req.usuario._id;

    const coleira = await bubalinoService.atualizar(
      usuarioId,
      req.params.id,
      req.body
    );

    res.status(200).json({
      sucesso: true,
      mensagem: 'Bubalino atualizado com sucesso.',
      bubalino: coleira.bubalino,
      coleira
    });
  } catch (error) {
    next(error);
  }
};

exports.excluir = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id || req.usuario._id;

    const resultado = await bubalinoService.excluir(
      usuarioId,
      req.params.id
    );

    res.status(200).json({
      sucesso: true,
      ...resultado
    });
  } catch (error) {
    next(error);
  }
};
