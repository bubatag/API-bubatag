import mongoose from "mongoose";

// Documento aninhado
const descriptionSchema = new mongoose.Schema({ //VERIFICAR CAMPOS NO BANCO******
  genre: String,
  platform: String,
  rating: String,
});

const bufaloSchema = new mongoose.Schema({ //VERIFICAR CAMPOS NO BANCO******
  title: String,
  year: Number,
  price: Number,
  descriptions: descriptionSchema
});

// Aqui está sendo criado a coleção bufalos no banco de dados
const Bufalo = mongoose.model("Bufalo", bufaloSchema);

export default Bufalo;
