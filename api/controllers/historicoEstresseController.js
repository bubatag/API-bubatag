import historicoEstresseService from '../services/historicoEstresseService.js';

const getAll = async (req, res) => {
  try {
    const results = await historicoEstresseService.getAll();
    res.status(200).json({ data: results });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const create = async (req, res) => {
  try {
    const { estado_estresse, idbubalino } = req.body;
    await historicoEstresseService.Create(estado_estresse, idbubalino);
    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      await historicoEstresseService.Delete(id);
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
      const { estado_estresse, dt_fim, idbubalino } = req.body;
      await historicoEstresseService.Update(id, estado_estresse, dt_fim, idbubalino);
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
      const result = await historicoEstresseService.getOne(id);
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