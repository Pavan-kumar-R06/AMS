import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || "Apartment";

if (!uri) {
    throw new Error("MONGO_URI is not set");
}

const client = new MongoClient(uri, {
    tls: true,
    serverSelectionTimeoutMS: 10000
});

let dbInstance = null;
let connectPromise = null;

async function connectDB() {
    if (dbInstance) {
        return dbInstance;
    }

    if (!connectPromise) {
        connectPromise = (async () => {
            await client.connect();

            // Test that MongoDB is actually reachable
            await client.db("admin").command({ ping: 1 });

            dbInstance = client.db(dbName);

            console.log("MongoDB Connected Successfully");

            return dbInstance;
        })().catch((error) => {
            connectPromise = null;
            console.error("MongoDB Connection Error:", error);
            throw error;
        });
    }

    return connectPromise;
}

const dbPromise = connectDB();

export default dbPromise;

export async function getNextSequence(name) {
    const db = await dbPromise;

    const result = await db.collection("counters").findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        {
            upsert: true,
            returnDocument: "after"
        }
    );

    return result.value ? result.value.seq : result.seq;
}