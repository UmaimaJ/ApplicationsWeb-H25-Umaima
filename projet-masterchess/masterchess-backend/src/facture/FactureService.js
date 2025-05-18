import mongo from "mongodb";

export default class FactureService {
  constructor(db) {
    this.db = db;
    this.collection = this.db.collection("factures");
  }

  async insertFacture(userId, quantite, total)
  {
    const transactionCharger = {
      id_usager: userId,
      quantite: quantite,
      total: total,
      dateCreation: new Date(Date.now())
    }

    try
    {
      const result = await this.collection.insertOne(transactionCharger);
      const docCurs = await this.collection.find({_id: result.insertedId});
      const doc = (await docCurs.toArray())[0] ?? null;
      return doc;
    }
    catch(error)
    {
        console.log("MongoDB: Ajout facture a echoué");
        throw error;
    }
    return null;
  }

  async selectFacture(factureId)
  {
    try
    {
      console.log(factureId);
      const docCurs = await this.collection.find({_id: new mongo.ObjectId(factureId)});
      const doc = (await docCurs.toArray())[0] ?? null;
      return doc;
    }
    catch(error)
    {
        throw error;
    }
    return null;
  }

}