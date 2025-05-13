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
}

export const ChargerServiceContext = React.createContext({
    service: null,
});