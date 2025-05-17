// src/Magasin/service/MagasinService.js
import axios from 'axios';

export class MagasinService {
  async getProduits() {
    try {
      const response = await axios.get('/produits');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des produits :", error);
      return [];
    }
  }

  async acheterProduit(idProduit) {
    try {
      const response = await axios.post(`/acheter/${idProduit}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'achat :", error);
    }
  }
}
