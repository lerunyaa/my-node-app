require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const client = new MongoClient(uri);
let db;

async function connectDB() {
  await client.connect();
  db = client.db(dbName);
  console.log(`[INFO] MongoDB подключена: ${dbName}`);
  return db;
}

function getDB() {
  if (!db) throw new Error('База данных не подключена');
  return db;
}

module.exports = { connectDB, getDB, client }; 
