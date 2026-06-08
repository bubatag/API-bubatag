import pool from '../db.js';

class coleiraService {
  async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM coleiras WHERE ativo = 1');
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Create(n_coleira, IP, idusuario) {
    try {
      const [result] = await pool.query(
        'INSERT INTO coleiras (n_coleira, IP, idusuario) VALUES (?, ?, ?)',
        [n_coleira, IP, idusuario]
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Delete(id) {
    try {
      await pool.query('UPDATE coleiras SET ativo = 0 WHERE idcoleira = ?', [id]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Update(id, n_coleira, IP, idusuario) {
    try {
      await pool.query(
        'UPDATE coleiras SET n_coleira = ?, IP = ?, idusuario = ? WHERE idcoleira = ?',
        [n_coleira, IP, idusuario, id]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOne(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM coleiras WHERE idcoleira = ? AND ativo = 1', [id]);
      return rows.length > 0 ? rows[0] : undefined;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new coleiraService();
