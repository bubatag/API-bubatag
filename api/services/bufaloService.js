import Bufalo from "../models/Bufalos.js";

class bufaloService {
  // Game.find().then(games => {
  // //sucesso
  // }).catch(error => {
  // // falha
  // })

  // async / await
  // Função para listar os jogos
  async getAll() {
    try {
      const bufalos = await Bufalo.find();
      return bufalos;
    } catch (error) {
      console.log(error);
    }
  }

  // Função para cadastrar jogos
  async Create(title, year, price, descriptions) {
    try {
      const newBufalo = new Bufalo({ //VERIFICAR CAMPOS NO BANCO******
        // title : title
        title,
        year,
        price,
        descriptions
      });
      // Método do mongoose para cadastrar .save()
      await newBufalo.save();
    } catch (error) {
      console.log(error);
    }
  }

  // Função para deletar jogos
  async Delete(id) {
    try {
      await Bufalo.findByIdAndDelete(id);
      console.log(`Bufalo com a id: ${id} foi excluído.`);
    } catch (error) {
      console.log(error);
    }
  }

  // Função para alterar jogos
  async Update(id, title, year, price, descriptions) { //VERIFICAR CAMPOS NO BANCO******
    try {
      await Bufalo.findByIdAndUpdate(id, {
        // title : title
        title,
        year,
        price,
        descriptions
      });
      console.log(`Dados do búfalo com a id: ${id} alterados com sucesso.`);
    } catch (error) {
      console.log(error);
    }
  }

  // Função para listar um único jogo
  async getOne(id) {
    try {
      const bufalo = await Bufalo.findOne({ _id: id });
      return bufalo;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new bufaloService();
