import User from "../models/Users.js";

class userService {
  // Método para cadastrar um usuário
  async Create(name, email, password) {  
    try {
      const newUser = new User({
        name,
        email,
        password,
      });
      await newUser.save();
    } catch (error) {
      console.log(error);
    }
  }
  // Método para listar um usuário
  async getOne(email) {
    try {
      const user = await User.findOne({ email: email });
      return user;
    } catch (error) {
      console.log(error);
    }
  }
}
export default new userService();
