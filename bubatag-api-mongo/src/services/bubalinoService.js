
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

  return {
    raca,
    etiqueta,
    sexo,
    dataNascimento,
  };
}

function localizarBubalino(usuario, bubalinoId) {
  const bubalino = usuario.bubalinos.id(bubalinoId);

  if (!bubalino || bubalino.excluido_em) {
    throw criarErro('Bubalino não encontrado.', 404);
  }

  const coleira = (usuario.coleiras || []).find(
    (item) =>
      String(item.bubalino_id || '') === String(bubalino._id)
  );

  return {
    bubalino,
    coleira: coleira || null,
  };
}

function validarEtiquetaUnica(usuario, etiqueta, bubalinoAtual) {
  const duplicada = (usuario.bubalinos || []).some(
    (animal) =>
      String(animal._id) !== String(bubalinoAtual || '') &&
      !animal.excluido_em &&
      String(animal.n_etiqueta || '').trim().toLowerCase() ===
        etiqueta.toLowerCase()
  );

  if (duplicada) {
    throw criarErro(
      'Já existe um bubalino com essa etiqueta.',
      409
    );
  }
}

function encerrarVinculo(coleira, bubalinoId) {
  const vinculo = [...(coleira.historico_vinculos || [])]
    .reverse()
    .find(
      (item) =>
        item.ativo === true &&
        String(item.bubalino_id) === String(bubalinoId)
    );

  if (vinculo) {
    vinculo.ativo = false;
    vinculo.data_fim = new Date();
  }

  coleira.bubalino_id = null;
}

function iniciarVinculo(coleira, bubalinoId) {
  coleira.bubalino_id = bubalinoId;

  coleira.historico_vinculos.push({
    bubalino_id: bubalinoId,
    data_inicio: new Date(),
    data_fim: null,
    ativo: true,
  });
}

class BubalinoService {
  // Cadastra um bubalino e associa a uma coleira.
  async cadastrar(usuarioId, dados) {
    const coleiraId = String(dados?.coleira_id || '').trim();

    if (!coleiraId) {
      throw criarErro(
        'Selecione uma coleira para o bubalino.',
        400
      );
    }

    return coleiraService.associarBubalino(
      usuarioId,
      coleiraId,
      dados
    );
  }

  // Atualiza os dados do bubalino e, se necessário, troca sua coleira.
  async atualizar(usuarioId, bubalinoId, dados) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const { bubalino, coleira: coleiraAtual } =
      localizarBubalino(usuario, bubalinoId);

    const campos = validarDados(dados);

    validarEtiquetaUnica(
      usuario,
      campos.etiqueta,
      bubalino._id
    );

    const coleiraDestinoId = String(
      dados?.coleira_id || coleiraAtual?._id || ''
    ).trim();

    if (!coleiraDestinoId) {
      throw criarErro(
        'O bubalino não possui uma coleira associada. Selecione uma coleira.',
        400
      );
    }

    const coleiraDestino = usuario.coleiras.id(
      coleiraDestinoId
    );

    if (!coleiraDestino || coleiraDestino.excluido_em) {
      throw criarErro('Coleira não encontrada.', 404);
    }

    if (coleiraDestino.ativo === false) {
      throw criarErro('A coleira está inativa.', 400);
    }

    // Troca o vínculo somente quando a coleira de destino for diferente.
    if (
      !coleiraAtual ||
      String(coleiraDestino._id) !== String(coleiraAtual._id)
    ) {
      if (coleiraDestino.bubalino_id) {
        throw criarErro(
          'A coleira selecionada já está associada a um bubalino.',
          409
        );
      }

      if (coleiraAtual) {
        encerrarVinculo(coleiraAtual, bubalino._id);
      }

      iniciarVinculo(coleiraDestino, bubalino._id);
    }

    bubalino.raca = campos.raca;
    bubalino.n_etiqueta = campos.etiqueta;
    bubalino.dt_nasc = campos.dataNascimento;
    bubalino.sexo = campos.sexo;

    if (dados.ativo !== undefined) {
      bubalino.ativo = dados.ativo;
    }

    await usuario.save();

    return {
      bubalino,
      coleira: coleiraDestino,
    };
  }

  // Desativa o bubalino sem apagar seus dados ou seu vínculo.
  async excluir(usuarioId, bubalinoId) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const { bubalino } = localizarBubalino(
      usuario,
      bubalinoId
    );

    if (bubalino.ativo === false) {
      throw criarErro('Este bubalino já está inativo.', 400);
    }

    bubalino.ativo = false;

    await usuario.save();

    return {
      mensagem: 'Bubalino desativado com sucesso.',
      bubalino,
    };
  }

  // Reativa um bubalino anteriormente desativado.
  async reativar(usuarioId, bubalinoId) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const { bubalino } = localizarBubalino(
      usuario,
      bubalinoId
    );

    if (bubalino.ativo !== false) {
      throw criarErro('Este bubalino já está ativo.', 400);
    }

    bubalino.ativo = true;

    await usuario.save();

    return {
      mensagem: 'Bubalino reativado com sucesso.',
      bubalino,
    };
  }

  // Desvincula o bubalino sem apagar seu cadastro ou histórico.
  async desvincular(usuarioId, bubalinoId) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const { bubalino, coleira } = localizarBubalino(
      usuario,
      bubalinoId
    );

    if (!coleira) {
      throw criarErro(
        'Este bubalino não possui uma coleira associada.',
        400
      );
    }

    const resultado = await coleiraService.desvincularBubalino(
      usuarioId,
      coleira._id
    );

    return {
      mensagem: 'Bubalino desvinculado com sucesso.',
      bubalino,
      coleira: resultado.coleira,
    };
  }
}

module.exports = new BubalinoService();
