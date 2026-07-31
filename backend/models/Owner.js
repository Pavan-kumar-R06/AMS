import dbPromise from "../db.js";

// Model for the "owner" collection.
export default async function Owner() {
    const db = await dbPromise;
    return db.collection("owner");
}
