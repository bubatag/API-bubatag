import coleiraService from '../services/coleiraService.js';

const getAll = async (req, res) => {
  try {
    const results = await coleiraService.getAll();
    res.status(200).json({ data: results });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const create = async (req, res) => {
  try {
    const { n_coleira, IP, idusuario } = req.body;
    await coleiraService.Create(n_coleira, IP, idusuario);
    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      await coleiraService.Delete(id);
      res.sendStatus(204);
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      const { n_coleira, IP, idusuario } = req.body;
      await coleiraService.Update(id, n_coleira, IP, idusuario);
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      const result = await coleiraService.getOne(id);
      if (!result) res.sendStatus(404);
      else res.status(200).json({ data: result });
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export default { getAll, create, remove, update, getOne };
