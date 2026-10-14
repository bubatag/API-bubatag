const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

class UsuarioService {
  async listarTodos() {
    return await Usuario.find().select('-senha');
  }

  async buscarPorId(id) {
    const usuario = await Usuario.findById(id).select('-senha');
    if (!usuario) {
      const erro = new Error('Usuário não encontrado.');
      erro.status = 404;
      throw erro;
    }
    return usuario;
  }

  async criarUsuario(dados) {
    const emailExiste = await Usuario.findOne({ email: dados.email });
    if (emailExiste) {
      const erro = new Error('E-mail já cadastrado.');
      erro.status = 400;
      throw erro;
    }

    const novoUsuario = new Usuario(dados);
    await novoUsuario.save();

    const resposta = novoUsuario.toObject();
    delete resposta.senha;
    return resposta;
  }

  async autenticar(email, senha) {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      const erro = new Error('Credenciais inválidas.');
      erro.status = 401;
      throw erro;
    }

    if (usuario.senha !== senha) {
      const erro = new Error('Credenciais inválidas.');
      erro.status = 401;
      throw erro;
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email
      },
      token
    };
  }
}

module.exports = new UsuarioService();