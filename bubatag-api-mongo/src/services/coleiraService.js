
const Usuario = require('../models/Usuario');

function criarErro(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

class ColeiraService {
  // Cadastra uma coleira sem exigir um bubalino associado.
  async cadastrarParaUsuario(usuarioId, dadosColeira) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const nColeira = String(dadosColeira?.n_coleira || '').trim();
    const localizacao = String(
      dadosColeira?.coleira_localizacao || ''
    ).trim();
    const ip = String(dadosColeira?.IP || '').trim();

    if (!nColeira || !localizacao || !ip) {
      throw criarErro(
        'Informe o número da coleira, a localização e o IP.',
        400
      );
    }

    const numeroExistente = (usuario.coleiras || []).some(
      (coleira) =>
        String(coleira.n_coleira || '').trim().toLowerCase() ===
        nColeira.toLowerCase()
    );

    if (numeroExistente) {
      throw criarErro(
        'Já existe uma coleira com esse número.',
        409
      );
    }

    usuario.coleiras.push({
      n_coleira: nColeira,
      coleira_localizacao: localizacao,
      IP: ip,
      ativo: true,
      excluido_em: null,
      bubalino_id: null,
      historico_vinculos: [],
    });

    await usuario.save();

    return usuario.coleiras[usuario.coleiras.length - 1];
  }

  // Lista todas as coleiras, ativas e inativas,
  // incluindo os dados do bubalino associado.
  async listarPorUsuario(usuarioId) {
    const usuario = await Usuario.findById(usuarioId)
      .select('coleiras bubalinos');

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const bubalinos = usuario.bubalinos || [];

    return (usuario.coleiras || []).map((coleira) => {
      const bubalino = coleira.bubalino_id
        ? bubalinos.id(coleira.bubalino_id)
        : null;

      return {
        ...coleira.toObject(),
        bubalino: bubalino ? bubalino.toObject() : null,
      };
    });
  }

  // Lista coleiras ativas e sem bubalino associado.
  async listarDisponiveisParaUsuario(usuarioId) {
    const usuario = await Usuario.findById(usuarioId)
      .select('coleiras');

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    return (usuario.coleiras || []).filter(
      (coleira) =>
        coleira.ativo !== false &&
        !coleira.excluido_em &&
        !coleira.bubalino_id
    );
  }

  // Cadastra um bubalino independente e associa à coleira.
  async associarBubalino(usuarioId, coleiraId, dadosBubalino) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const coleira = usuario.coleiras.id(coleiraId);

    if (!coleira) {
      throw criarErro('Coleira não encontrada.', 404);
    }

    if (coleira.excluido_em) {
      throw criarErro('Esta coleira foi excluída.', 400);
    }

    if (coleira.ativo === false) {
      throw criarErro('A coleira está inativa.', 400);
    }

    if (coleira.bubalino_id) {
      throw criarErro(
        'Esta coleira já está associada a um bubalino.',
        409
      );
    }

    const raca = String(dadosBubalino?.raca || '').trim();
    const etiqueta = String(dadosBubalino?.n_etiqueta || '').trim();
    const dtNasc = dadosBubalino?.dt_nasc;
    const sexo = dadosBubalino?.sexo;

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

    const etiquetaExistente = (usuario.bubalinos || []).some(
      (bubalino) =>
        !bubalino.excluido_em &&
        String(bubalino.n_etiqueta || '').trim().toLowerCase() ===
          etiqueta.toLowerCase()
    );

    if (etiquetaExistente) {
      throw criarErro(
        'Já existe um bubalino com essa etiqueta.',
        409
      );
    }

    usuario.bubalinos.push({
      raca,
      n_etiqueta: etiqueta,
      dt_nasc: dataNascimento,
      sexo,
      ativo: dadosBubalino.ativo ?? true,
      excluido_em: null,
      dados: [],
      historico_estresse: [],
      localizacao: [],
    });

    const bubalino =
      usuario.bubalinos[usuario.bubalinos.length - 1];

    coleira.bubalino_id = bubalino._id;

    coleira.historico_vinculos.push({
      bubalino_id: bubalino._id,
      data_inicio: new Date(),
      data_fim: null,
      ativo: true,
    });

    await usuario.save();

    return {
      coleira,
      bubalino,
    };
  }

  // Edita os dados cadastrais da coleira.
  async editar(usuarioId, coleiraId, dadosAtualizados) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const coleira = usuario.coleiras.id(coleiraId);

    if (!coleira) {
      throw criarErro('Coleira não encontrada.', 404);
    }

    if (coleira.excluido_em) {
      throw criarErro('Esta coleira foi excluída.', 400);
    }

    const nColeira = String(
      dadosAtualizados?.n_coleira ?? coleira.n_coleira
    ).trim();

    const localizacao = String(
      dadosAtualizados?.coleira_localizacao ??
        coleira.coleira_localizacao
    ).trim();

    const ip = String(
      dadosAtualizados?.IP ?? coleira.IP
    ).trim();

    if (!nColeira || !localizacao || !ip) {
      throw criarErro(
        'Informe o número da coleira, a localização e o IP.',
        400
      );
    }

    const numeroExistente = (usuario.coleiras || []).some(
      (outraColeira) =>
        String(outraColeira._id) !== String(coleiraId) &&
        String(outraColeira.n_coleira || '').trim().toLowerCase() ===
          nColeira.toLowerCase()
    );

    if (numeroExistente) {
      throw criarErro(
        'Já existe outra coleira com esse número.',
        409
      );
    }

    coleira.n_coleira = nColeira;
    coleira.coleira_localizacao = localizacao;
    coleira.IP = ip;

    await usuario.save();

    return coleira;
  }

  // Desativa sem desvincular o bubalino.
  async excluir(usuarioId, coleiraId) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const coleira = usuario.coleiras.id(coleiraId);

    if (!coleira) {
      throw criarErro('Coleira não encontrada.', 404);
    }

    if (coleira.excluido_em) {
      throw criarErro('Esta coleira foi excluída.', 400);
    }

    if (coleira.ativo === false) {
      throw criarErro('Esta coleira já está inativa.', 400);
    }

    coleira.ativo = false;

    await usuario.save();

    return {
      mensagem: 'Coleira desativada com sucesso.',
      coleira,
    };
  }

  // Reativa a coleira mantendo o vínculo existente.
  async reativar(usuarioId, coleiraId) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const coleira = usuario.coleiras.id(coleiraId);

    if (!coleira) {
      throw criarErro('Coleira não encontrada.', 404);
    }

    if (coleira.excluido_em) {
      throw criarErro('Esta coleira foi excluída.', 400);
    }

    if (coleira.ativo !== false) {
      throw criarErro('Esta coleira já está ativa.', 400);
    }

    coleira.ativo = true;

    await usuario.save();

    return {
      mensagem: 'Coleira reativada com sucesso.',
      coleira,
    };
  }

  // Desvincula o bubalino sem apagar seu cadastro ou histórico.
  async desvincularBubalino(usuarioId, coleiraId) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const coleira = usuario.coleiras.id(coleiraId);

    if (!coleira) {
      throw criarErro('Coleira não encontrada.', 404);
    }

    if (!coleira.bubalino_id) {
      throw criarErro(
        'Esta coleira não possui bubalino associado.',
        400
      );
    }

    const vinculoAtivo = [...(coleira.historico_vinculos || [])]
      .reverse()
      .find(
        (vinculo) =>
          vinculo.ativo === true &&
          String(vinculo.bubalino_id) ===
            String(coleira.bubalino_id)
      );

    if (vinculoAtivo) {
      vinculoAtivo.ativo = false;
      vinculoAtivo.data_fim = new Date();
    }

    coleira.bubalino_id = null;

    await usuario.save();

    return {
      mensagem: 'Bubalino desvinculado com sucesso.',
      coleira,
    };
  }

  // Busca alertas usando a nova estrutura independente.
  async buscarAlertas(usuarioId) {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      throw criarErro('Usuário não encontrado.', 404);
    }

    const alertas = [];

    const estadosDeAtencao = [
      'Alerta',
      'Estresse Térmico',
      'Estresse Crítico',
    ];

    (usuario.coleiras || []).forEach((coleira) => {
      if (
        coleira.ativo === false ||
        coleira.excluido_em ||
        !coleira.bubalino_id
      ) {
        return;
      }

      const bubalino = (usuario.bubalinos || []).id(
        coleira.bubalino_id
      );

      if (!bubalino || bubalino.ativo === false || bubalino.excluido_em) {
        return;
      }

      const historicoEstresse = bubalino.historico_estresse || [];

      const ultimoEstresse = [...historicoEstresse]
        .reverse()
        .find((item) => item.ativo !== false);

      if (
        !ultimoEstresse ||
        !estadosDeAtencao.includes(ultimoEstresse.estado_estresse)
      ) {
        return;
      }

      const ultimosDados = [...(bubalino.dados || [])]
        .reverse()
        .find((item) => item.ativo !== false);

      const ultimaLocalizacao = [...(bubalino.localizacao || [])]
        .reverse()
        .find((item) => item.ativo !== false);

      const prioridade =
        ultimoEstresse.estado_estresse === 'Estresse Crítico' ||
        ultimoEstresse.estado_estresse === 'Estresse Térmico'
          ? 'ALTA'
          : 'MEDIA';

      alertas.push({
        coleira_id: coleira._id,
        n_coleira: coleira.n_coleira,
        coleira_localizacao: coleira.coleira_localizacao,
        bubalino_id: bubalino._id,
        n_etiqueta: bubalino.n_etiqueta,
        raca: bubalino.raca,
        sexo: bubalino.sexo,

        alerta: {
          estado: ultimoEstresse.estado_estresse,
          prioridade,
          data: ultimoEstresse.data_estresse,
        },

        telemetria_atual: {
          batimento_cardiaco: ultimosDados
            ? ultimosDados.batimento_cardiaco
            : null,
          temperatura: ultimosDados
            ? ultimosDados.temperatura
            : null,
          data_leitura: ultimosDados
            ? ultimosDados.data
            : null,
        },

        localizacao_atual: {
          latitude: ultimaLocalizacao
            ? ultimaLocalizacao.latitude
            : null,
          longitude: ultimaLocalizacao
            ? ultimaLocalizacao.longitude
            : null,
          data: ultimaLocalizacao
            ? ultimaLocalizacao.data
            : null,
        },
      });
    });

    return alertas;
  }
}

module.exports = new ColeiraService();
