// src/cours/ServiceCours.js
class ServiceCours {
    constructor(mysql) {
      this.mysql = mysql;
    }
  
    async getAllLessons() {
      const [results] = await this.mysql.query(`
        SELECT * FROM cours
      `);
      return results;
    }
  }
  
  export default ServiceCours;
  