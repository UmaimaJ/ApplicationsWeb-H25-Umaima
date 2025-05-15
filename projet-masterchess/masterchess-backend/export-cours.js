import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient("mongodb://localhost:27017");

const run = async () => {
  // Connexion MySQL
  const mysqlConn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projet_chess'
  });

  // Lecture des cours depuis MySQL
  const [rows] = await mysqlConn.execute("SELECT * FROM cours");

  // Connexion MongoDB
  await mongoClient.connect();
  const db = mongoClient.db("projet_chess");
  const collectionCours = db.collection("cours");
  const collectionTransactionsCours = db.collection("transactionsCours");
  const indexTransactionsCours = collectionTransactionsCours.createIndex({ id_cours: 1, id_usager: 1 }, { unique: true });

  // Insertion dans MongoDB
  if (rows.length > 0) {
    await collectionCours.insertMany(rows);
    console.log(`✅ ${rows.length} cours transférés vers MongoDB.`);
  } else {
    console.log("Aucun cours trouvé dans MySQL.");
  }

  await mysqlConn.end();
  await mongoClient.close();
};

run().catch(console.error);
