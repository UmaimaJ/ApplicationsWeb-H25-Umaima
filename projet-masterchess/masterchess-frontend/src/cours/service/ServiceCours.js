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
      console.error("Error fetching lessons:", error);
      return [];
    }
  }
}

export const ServiceCoursContext = React.createContext({
  service: new ServiceCours(),
});