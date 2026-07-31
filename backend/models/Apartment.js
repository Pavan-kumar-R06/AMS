import dbPromise from "../db.js";

// Model for the "apartment" collection.
export default async function Apartment() {
    const db = await dbPromise;
    return db.collection("apartment");
}
