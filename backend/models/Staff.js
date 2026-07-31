import dbPromise from "../db.js";

// Model for the "staff" collection.
export default async function Staff() {
    const db = await dbPromise;
    return db.collection("staff");
}
