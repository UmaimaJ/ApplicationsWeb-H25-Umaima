import axios from "axios";
import React from "react";

export class ServiceCours {
  constructor() {}

  async getLessons() {
    try {
      const response = await axios.get("getLessons", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching getLessons:", error);
      return [];
    }
  }

  async getCoursAchetes() {
    try {
      const response = await axios.get("getCoursAchetes", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching getCoursAchetes:", error);
      return [];
    }
  }

  async addTransactionCours(coursId)
  {
    try {
      await axios.post("addTransactionCours", {
        coursId: coursId
      }, {
        withCredentials: true,
      });
      return true;
    } catch (error) {
      console.error("Erreur dans addTransactionCours:", error);
      return false;
    }
    return true;
  }
}

export const ServiceCoursContext = React.createContext({
  service: new ServiceCours(),
});