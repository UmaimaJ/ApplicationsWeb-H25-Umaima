// backend/src/cours/ServiceCours.js
import connectDB from "../mongodb.js";

class ServiceCours {
  constructor() {
    
  }

  async getAllLessons() {
    const db = await connectDB();
    const coursCollection = db.collection("cours");
    const cours = await coursCollection.find().toArray();
    return cours;
  }
}

export default ServiceCours;
