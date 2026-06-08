import pool from '../db.js';

class dadoService {
  async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM dados WHERE ativo = 1');
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Create(batimento_cardiaco, temperatura, idbubalino, idcoleira) {
    try {
      const [result] = await pool.query(
        'INSERT INTO dados (batimento_cardiaco, temperatura, idbubalino, idcoleira) VALUES (?, ?, ?, ?)',
        [batimento_cardiaco, temperatura, idbubalino, idcoleira]
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Delete(id) {
    try {
      await pool.query('UPDATE dados SET ativo = 0 WHERE iddados = ?', [id]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Update(id, batimento_cardiaco, temperatura, idbubalino, idcoleira) {
    try {
      await pool.query(
        'UPDATE dados SET batimento_cardiaco = ?, temperatura = ?, idbubalino = ?, idcoleira = ? WHERE iddados = ?',
        [batimento_cardiaco, temperatura, idbubalino, idcoleira, id]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOne(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM dados WHERE iddados = ? AND ativo = 1', [id]);
      return rows.length > 0 ? rows[0] : undefined;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new dadoService();