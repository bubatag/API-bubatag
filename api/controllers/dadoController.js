import dadoService from '../services/dadoService.js';

const getAll = async (req, res) => {
  try {
    const results = await dadoService.getAll();
    res.status(200).json({ data: results });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const create = async (req, res) => {
  try {
    const { batimento_cardiaco, temperatura, idbubalino, idcoleira } = req.body;
    await dadoService.Create(batimento_cardiaco, temperatura, idbubalino, idcoleira);
    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      await dadoService.Delete(id);
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
      const { batimento_cardiaco, temperatura, idbubalino, idcoleira } = req.body;
      await dadoService.Update(id, batimento_cardiaco, temperatura, idbubalino, idcoleira);
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
      const result = await dadoService.getOne(id);
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