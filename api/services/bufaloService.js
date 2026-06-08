import pool from "../db.js";

class bufaloService {
  // Função para listar os búfalos
  async getAll() {
    try {
      const [rows] = await pool.query("SELECT * FROM bubalinos WHERE ativo = 1");
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Função para cadastrar búfalos
  async Create(nome, raca, n_etiqueta, dt_nasc, sexo, idcoleira, idusuario) {
    try {
      const [result] = await pool.query(
        "INSERT INTO bubalinos (nome, raca, n_etiqueta, dt_nasc, sexo, idcoleira, idusuario) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [nome, raca, n_etiqueta, dt_nasc, sexo, idcoleira || null, idusuario || null]
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Função para deletar (soft delete) búfalos
  async Delete(id) {
    try {
      await pool.query("UPDATE bubalinos SET ativo = 0 WHERE idbubalino = ?", [id]);
      console.log(`Búfalo com a id: ${id} foi excluído (lógico).`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Função para alterar búfalos
  async Update(id, nome, raca, n_etiqueta, dt_nasc, sexo, idcoleira) {
    try {
      await pool.query(
        "UPDATE bubalinos SET nome = ?, raca = ?, n_etiqueta = ?, dt_nasc = ?, sexo = ?, idcoleira = ? WHERE idbubalino = ?",
        [nome, raca, n_etiqueta, dt_nasc, sexo, idcoleira || null, id]
      );
      console.log(`Dados do búfalo com a id: ${id} alterados com sucesso.`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Função para listar um único búfalo
  async getOne(id) {
    try {
      const [rows] = await pool.query("SELECT * FROM bubalinos WHERE idbubalino = ? AND ativo = 1", [id]);
      return rows.length > 0 ? rows[0] : undefined;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new bufaloService();
