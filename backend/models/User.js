import dbPromise from "../db.js";

// Model for the "users" collection (login accounts).
export default async function User() {
    const db = await dbPromise;
    return db.collection("users");
}
