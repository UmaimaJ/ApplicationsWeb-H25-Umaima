import axios from "axios";
import React from "react";

export class ChargerService {
  constructor() {}

  async createCheckoutSession() {
    try {
      const response = await axios.post("CreateCheckoutSession", undefined , {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getFacture(factureId)
  {
    const params = new URLSearchParams();
    params.append("id", factureId);
    var result = null;
    await axios.get("getFacture", {
        params,
        withCredentials: true
    })
    .then(function (response) {
        //handle success
        console.log(response);
        result = response.data.result;
    })
    .catch(function (error) {
        //handle error
        console.log(error);
    })
    .finally(function () {
        //always executed
    });
    return result;
  }
}

export const ChargerServiceContext = React.createContext({
    chargerService: null,
});