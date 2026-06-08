import pool from "../db.js";

class userService {
  // Método para cadastrar um usuário
  async Create(nome, email, senha, CCIR) {
    try {
      const [result] = await pool.query(
        "INSERT INTO usuarios (nome, email, senha, CCIR) VALUES (?, ?, ?, ?)",
        [nome, email, senha, CCIR]
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Método para buscar um usuário pelo email
  async getOne(email) {
    try {
      const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ? AND ativo = 1", [email]);
      return rows.length > 0 ? rows[0] : undefined;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
export default new userService();
