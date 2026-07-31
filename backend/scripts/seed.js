// One-time helper to seed MongoDB with the same starter data the old MySQL
// schema had (an admin login + counters), and to make sure the "counters"
// collection used for auto-increment ids exists.
//
// Run with:  node backend/scripts/seed.js
import bcrypt from "bcryptjs";
import dbPromise, { getNextSequence } from "../db.js";

async function seed() {
    const db = await dbPromise;

    // Make sure the collections we rely on exist.
    const collections = [
        "users", "owner", "flat", "staff",
        "service_request", "parking_slot", "apartment", "counters"
    ];
    const existing = (await db.listCollections().toArray()).map(c => c.name);
    for (const name of collections) {
        if (!existing.includes(name)) {
            await db.createCollection(name);
            console.log(`Created collection: ${name}`);
        }
    }

    // Create a default admin user if one doesn't already exist.
    const existingAdmin = await db.collection("users").findOne({ username: "PavaN", role: "admin" });
    if (!existingAdmin) {
        const user_id = await getNextSequence("user_id");
        const hashed = await bcrypt.hash("PavaN@06", 10);
        await db.collection("users").insertOne({
            user_id,
            username: "PavaN",
            password: hashed,
            role: "admin",
            owner_id: null,
            staff_id: null
        });
        console.log("Default admin created -> username: PavaN / password: PavaN@06");
    } else {
        console.log("Admin user already exists, skipping.");
    }

    console.log("Seed complete.");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});
