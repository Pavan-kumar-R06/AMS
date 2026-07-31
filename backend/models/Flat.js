import dbPromise from "../db.js";

// Model for the "flat" collection.
// Reuses the single cached DB connection from db.js (same connection as
// before, just organized per-entity like a normal MongoDB project).
export default async function Flat() {
    const db = await dbPromise;
    return db.collection("flat");
}
