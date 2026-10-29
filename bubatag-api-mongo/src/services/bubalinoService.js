
const Usuario = require('../models/Usuario');
const coleiraService = require('./coleiraService');

function criarErro(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

function validarDados(dados) {
  const raca = String(dados?.raca || '').trim();
  const etiqueta = String(dados?.n_etiqueta || '').trim();
  const sexo = dados?.sexo;
  const dtNasc = dados?.dt_nasc;

  if (!raca || !etiqueta || !dtNasc || !sexo) {
    throw criarErro(
      'Informe raça, número da etiqueta, data de nascimento e sexo.',
      400
    );
  }

  const dataNascimento = new Date(dtNasc);

  if (Number.isNaN(dataNascimento.getTime())) {
    throw criarErro('A data de nascimento é inválida.', 400);
  }

  if (dataNascimento > new Date()) {
    throw criarErro(
      'A data de nascimento não pode estar no futuro.',
      400
    );
  }

  if (!['Macho', 'Fêmea'].includes(sexo)) {
    throw criarErro('O sexo deve ser Macho ou Fêmea.', 400);
  }

  return { raca, etiqueta, sexo, dataNascimento };
}

function localizarBubalino(usuario, bubalinoId) {
  for (const coleira of usuario.coleiras || []) {
    if (
      coleira.bubalino &&
      String(coleira.bubalino._id) === String(bubalinoId)
    ) {
      return { coleira, bubalino: coleira.bubalino };
    }
  }

  throw criarErro('Bubalino não encontrado.', 404);
}

function validarEtiquetaUnica(usuario, etiqueta, bubalinoAtual) {
  const duplicada = (usuario.coleiras || []).some((coleira) => {
    const animal = coleira.bubalino;

    return (
      animal &&
      String(animal._id) !== String(bubalinoAtual || '') &&
      String(animal.n_etiqueta || '').trim().toLowerCase() ===
        etiqueta.toLowerCase()
    );
  });

  if (duplicada) {
    throw criarErro('Já existe um bubalino com essa etiqueta.', 409);
  }
}

class BubalinoService {
  async cadastrar(usuarioId, dados) {
    const coleiraId = String(dados?.coleira_id || '').trim();

    if (!coleiraId) {
      throw criarErro('Selecione uma coleira para o bubalino.', 400);
    }

    // O service existente valida a coleira, os dados e a etiqueta.
    return coleiraService.associarBubalino(
      usuarioId,
      coleiraId,
      dados
    );
  }

  async atualizar(usuarioId, bubalinoId, dados) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const atual = localizarBubalino(usuario, bubalinoId);
    const { coleira, bubalino } = atual;
    const campos = validarDados(dados);

    validarEtiquetaUnica(
      usuario,
      campos.etiqueta,
      bubalino._id
    );

    const coleiraDestinoId = String(
      dados?.coleira_id || coleira._id
    ).trim();

    const destino = usuario.coleiras.id(coleiraDestinoId);

    if (!destino) {
      throw criarErro('Coleira não encontrada.', 404);
    }

    if (destino.ativo === false) {
      throw criarErro('A coleira está inativa.', 400);
    }

    // Se a coleira mudou, transfere o bubalino para a nova.
    if (String(destino._id) !== String(coleira._id)) {
      if (destino.bubalino) {
        throw criarErro(
          'A coleira selecionada já está associada a um bubalino.',
          409
        );
      }

      destino.bubalino = bubalino.toObject();
      coleira.bubalino = undefined;
    }

    const bubalinoAtualizado = destino.bubalino;

    bubalinoAtualizado.raca = campos.raca;
    bubalinoAtualizado.n_etiqueta = campos.etiqueta;
    bubalinoAtualizado.dt_nasc = campos.dataNascimento;
    bubalinoAtualizado.sexo = campos.sexo;

    if (dados.ativo !== undefined) {
      bubalinoAtualizado.ativo = dados.ativo;
    }

    await usuario.save();

    return destino;
  }

  async excluir(usuarioId, bubalinoId) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const { coleira } = localizarBubalino(usuario, bubalinoId);

    // Remove somente o bubalino; a coleira continua cadastrada.
    coleira.bubalino = undefined;

    await usuario.save();

    return { mensagem: 'Bubalino excluído com sucesso.' };
  }
}

module.exports = new BubalinoService();
