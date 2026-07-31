import dbPromise from "../db.js";

// Model for the "service_request" collection.
export default async function ServiceRequest() {
    const db = await dbPromise;
    return db.collection("service_request");
}
