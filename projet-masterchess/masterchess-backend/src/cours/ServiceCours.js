export default class ServiceCours {
  constructor(db) {
    this.db = db;
    this.collection = this.db.collection("cours");
  }

  async getAllLessons() {
    const cours = await this.collection.find({}).toArray();
    return cours;
  }
}
