import bufaloService from "../services/bufaloService.js";

// Função para listar os bufalos
const getAllBufalo = async (req, res) => {
  try {
    const bufalos = await bufaloService.getAll();
    // Requisição feita com sucesso - Cod. 200 (OK)
    res.status(200).json({ bufalos: bufalos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// Função para cadastrar bufalos
const createBufalo = async (req, res) => {
  try {
    // Desestruturação
    const { nome, raca, n_etiqueta, dt_nasc, sexo, idcoleira, idusuario } = req.body;
    
    // Cadastrando no banco
    await bufaloService.Create(nome, raca, n_etiqueta, dt_nasc, sexo, idcoleira, idusuario);
    res.sendStatus(201); // Código 201 (CREATED)
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// Função para deletar bufalos
const deleteBufalo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      await bufaloService.Delete(id); 
      res.sendStatus(204); // Código 204 (NO CONTENT)
    } else {
      res.sendStatus(400); // Código 400 (BAD REQUEST)
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// Função para alterar um bufalo
const updateBufalo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      const { nome, raca, n_etiqueta, dt_nasc, sexo, idcoleira } = req.body;
      await bufaloService.Update(id, nome, raca, n_etiqueta, dt_nasc, sexo, idcoleira);
      res.sendStatus(200); // Código 200 (OK): Requisição bem sucedida
    } else {
      res.sendStatus(400); // Código 400 (Bad Request): Requisição mal formada
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// Função para buscar um único bufalo
const getOneBufalo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      const bufalo = await bufaloService.getOne(id);
      if (!bufalo) {
        res.sendStatus(404); // Código 404: NOT FOUND - Não encontrado
      } else {
        res.status(200).json({ bufalo });
      }
    } else {
      res.sendStatus(400); // Código 400: Bad Request
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Erro interno do servidor
  }
};

export default { getAllBufalo, createBufalo, deleteBufalo, updateBufalo, getOneBufalo };

