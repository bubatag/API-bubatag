import pool from '../db.js';

class localizacaoService {
  async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM localizacao WHERE ativo = 1');
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Create(latitude, longitude, idbubalino, idcoleira) {
    try {
      const [result] = await pool.query(
        'INSERT INTO localizacao (latitude, longitude, idbubalino, idcoleira) VALUES (?, ?, ?, ?)',
        [latitude, longitude, idbubalino, idcoleira]
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Delete(id) {
    try {
      await pool.query('UPDATE localizacao SET ativo = 0 WHERE idlocalizacao = ?', [id]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Update(id, latitude, longitude, idbubalino, idcoleira) {
    try {
      await pool.query(
        'UPDATE localizacao SET latitude = ?, longitude = ?, idbubalino = ?, idcoleira = ? WHERE idlocalizacao = ?',
        [latitude, longitude, idbubalino, idcoleira, id]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOne(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM localizacao WHERE idlocalizacao = ? AND ativo = 1', [id]);
      return rows.length > 0 ? rows[0] : undefined;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new localizacaoService();