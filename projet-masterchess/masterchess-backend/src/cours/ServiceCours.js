export default class ServiceCours {
  constructor(db) {
    this.db = db;
    this.collection = this.db.collection("cours");
    this.collectionTransactionsCours = this.db.collection("transactionsCours");
  }

  async selectCoursById(coursId)
  {
    const found = await this.collection.find({
        id: coursId
      }).toArray();

    if(found.length > 0)
      return found[0];

    return null;

  }

  async selectCoursAcheteByIdAndUsager(coursId, usagerId)
  {
    const found = await this.collectionTransactionsCours.aggregate([
      {
        $match: {
          id_cours: coursId,
          id_usager: usagerId
        }
      },
      {
        $lookup: {
          from: "cours",
          localField: "id_cours",
          foreignField: "id",
          as: "cours"
        }
      },
      {
        $set: {
          "cours": { "$first": "$cours" }
        }
      }
    ]);

    const foundarr = await found.toArray();
    if(foundarr.length > 0)
      return foundarr[0].cours;

    return null;

  }

  async getAllLessons() {
    const cours = await this.collection.find({}).toArray();
    return cours;
  }

  async getAllCoursAchetesByUserId(userId) {
    const cours = await this.collectionTransactionsCours.aggregate([
      {
        $match: { "id_usager": userId }
      },
      {
        $lookup: {
          from: "cours",
          localField: "id_cours",
          foreignField: "id",
          as: "cours"
        }
      },
      {
        $set: {
          "cours": { "$first": "$cours" }
        }
      }
    ]);

    const unSelected = await cours.toArray();
    return unSelected.map((value) => {
      return value.cours;
    });
  }

  async insertTransaction(userId, coursId)
  {
    const transactionCours = {
      id_cours: coursId,
      id_usager: userId
    }

    try
    {
      await this.collectionTransactionsCours.insertOne(transactionCours);
      return true;
    }
    catch(error)
    {
      console.log(error);
      return false;
    }
    return true;
  }

  async deleteTransaction(userId, coursId)
  {
    
      try
      {
        await this.collectionTransactionsCours.deleteOne({
          $match: { id_usager: userId, id_cours: coursId}
        });

        return true;
      }
      catch(error)
      {
        return false;
      }
      return true;
  }
}