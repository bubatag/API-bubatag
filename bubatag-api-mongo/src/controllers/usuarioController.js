const usuarioService = require('../services/usuarioService');

exports.listar = async (req, res, next) => {
  try {
    const usuarios = await usuarioService.listarTodos();
    res.status(200).json(usuarios);
  } catch (error) {
    next(error);
  }
};

exports.obterPorId = async (req, res, next) => {
  try {
    const usuario = await usuarioService.buscarPorId(req.params.id);
    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
};

exports.criar = async (req, res, next) => {
  try {
    const novoUsuario = await usuarioService.criarUsuario(req.body);
    res.status(201).json(novoUsuario);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail e senha são obrigatórios.' });
    }

    const resultado = await usuarioService.autenticar(email, senha);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};