import pool from '../db.js';

class historicoEstresseService {
  async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM historico_estresse WHERE ativo = 1');
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Create(estado_estresse, idbubalino) {
    try {
      const [result] = await pool.query(
        'INSERT INTO historico_estresse (estado_estresse, idbubalino) VALUES (?, ?)',
        [estado_estresse, idbubalino]
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Delete(id) {
    try {
      await pool.query('UPDATE historico_estresse SET ativo = 0 WHERE idhistorico_estresse = ?', [id]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Update(id, estado_estresse, dt_fim, idbubalino) {
    try {
      await pool.query(
        'UPDATE historico_estresse SET estado_estresse = ?, dt_fim = ?, idbubalino = ? WHERE idhistorico_estresse = ?',
        [estado_estresse, dt_fim, idbubalino, id]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOne(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM historico_estresse WHERE idhistorico_estresse = ? AND ativo = 1', [id]);
      return rows.length > 0 ? rows[0] : undefined;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new historicoEstresseService();