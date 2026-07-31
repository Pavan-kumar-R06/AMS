import express from 'express';
import { getNextSequence } from '../db.js';
import Staff from '../models/Staff.js';

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { search, status, role } = req.query;
        const staffCol = await Staff();

        const match = {};

        if (search) {
            match.$or = [
                { staffName: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } }
            ];
        }

        if (status !== undefined) {
            let isActiveValue;
            if (status === 'Active') {
                isActiveValue = 1;
            } else if (status === 'Inactive') {
                isActiveValue = 0;
            }

            if (isActiveValue !== undefined) {
                match.is_active = isActiveValue;
            }
        }

        if (role) {
            match.role = role;
        }

        const rows = await staffCol.find(match, { projection: { _id: 0 } }).toArray();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { staffName, role, phone, email, is_active } = req.body;
        const staffCol = await Staff();
        const staff_id = await getNextSequence('staff_id');

        await staffCol.insertOne({
            staff_id,
            staffName,
            role,
            phone: phone || null,
            email: email || null,
            is_active: is_active ?? 1,
            created_at: new Date()
        });
        res.json({ message: "Staff added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { staffName, role, phone, email, is_active } = req.body;
        const staffCol = await Staff();

        await staffCol.updateOne(
            { staff_id: Number(id) },
            { $set: { staffName, role, phone: phone || null, email: email || null, is_active: is_active ?? 1 } }
        );
        res.json({ message: "Staff updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const staffCol = await Staff();
        await staffCol.deleteOne({ staff_id: Number(id) });
        res.json({ message: "Staff deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
