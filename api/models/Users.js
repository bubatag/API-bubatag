import mongoose from "mongoose";

const userSchema = new mongoose.Schema({  //VERIFICAR CAMPOS NO BANCO******
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

export default User;
