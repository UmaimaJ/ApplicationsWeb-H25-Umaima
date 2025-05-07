import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017"; 
const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("projet_chess"); // ton nom correct de BD
  }
  return db;
}

export default connectDB;
