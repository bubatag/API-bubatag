import userService from "../services/userService.js";
import jwt from "jsonwebtoken";
// JWTSecret
const JWTSecret = "apigamessecret";

// Cadastrando um usuário
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body; // INSERIR CCIR ASSIM COMO NO MOBILE *****
    // AQUI SERIA FEITO O PROCESSO DE HASH DE SENHA
    await userService.Create(name, email, password);  // INSERIR CCIR ASSIM COMO NO MOBILE *****
    res.sendStatus(201); // Cod. 201 (CREATED)
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Erro interno do servidor
  }
};

// Autenticando um usuário
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; 
    // Se o e-mail não está vazio
    if (email != undefined) {
      // Busca o usuário no banco
      const user = await userService.getOne(email);
      // Usuário encontrado
      if (user != undefined) {
        // Senha correta
        if (user.password == password) {
          // Gerando o token
          jwt.sign(
            { id: user._id, email: user.email },
            JWTSecret,
            { expiresIn: "48h" },
            (error, token) => {
              if (error) {
                res.status(400).json({ error: "Erro ao gerar o token." }); // Bad request
              } else {
                res.status(200).json({ token: token });
              }
            });
          // Senha incorreta
        } else {
          res.status(401).json({ error: "Credenciais inválidas" }); // Unauthorized
        }
    // Usuário não encontrado
      } else {
        res.status(404).json({error: "Usuário não encontrado."}) //Not found
      }
      // E-mail inválido ou vazio
    } else {
        res.status(400).json({error: "O e-mail enviado é inválido."}) // Bad request
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Erro interno do servidor
  }
};

export default { createUser, loginUser, JWTSecret };
