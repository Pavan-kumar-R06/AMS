import dbPromise from "../db.js";

// Model for the "parking_slot" collection.
export default async function ParkingSlot() {
    const db = await dbPromise;
    return db.collection("parking_slot");
}
