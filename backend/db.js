import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || "Apartment";

if (!uri) {
    console.error("MONGO_URI is not set in .env");
}

const client = new MongoClient(uri);

let dbInstance = null;
let connectPromise = null;

// Lazily connect once and reuse the same connection (pool) for every request,
// same idea as the old mysql2 createPool() but for MongoDB.
async function connectDB() {
    if (dbInstance) return dbInstance;
    if (!connectPromise) {
        connectPromise = client.connect().then(() => {
            dbInstance = client.db(dbName);
            console.log("MongoDB Connected");
            return dbInstance;
        });
    }
    return connectPromise;
}

// Resolves to the connected Db instance. Usage in routes:
//   import dbPromise from "../db.js";
//   const db = await dbPromise;
//   const rows = await db.collection("flat").find({}).toArray();
const dbPromise = connectDB();

export default dbPromise;

// Simple auto-increment helper so existing numeric ids (flat_id, owner_id, ...)
// keep working the same way they did with MySQL AUTO_INCREMENT, since the
// frontend already relies on these being plain numbers.
export async function getNextSequence(name) {
    const db = await dbPromise;
    const result = await db.collection("counters").findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
    );
    return result.value ? result.value.seq : result.seq;
}
