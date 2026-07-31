import express from "express";
import bcrypt from "bcryptjs";
import { getNextSequence } from "../db.js";
import User from "../models/User.js";
import Owner from "../models/Owner.js";
import Staff from "../models/Staff.js";

const router = express.Router();

/* ==========================================================
   GET ALL USERS
========================================================== */
router.get("/", async (req, res) => {

    try {

        const userCol = await User();
        const ownerCol = await Owner();
        const staffCol = await Staff();

        const result = [];

        // ===========================
        // ADMIN USERS
        // ===========================

        const admins = await userCol
            .find({ role: "admin" })
            .project({
                _id: 0,
                username: 1
            })
            .toArray();

        admins.forEach(admin => {

            result.push({

                username: admin.username,

                role: "Admin",

                status: "System Account",

                canCreate: false,

                owner_id: null,

                staff_id: null

            });

        });

        // ===========================
        // OWNERS
        // ===========================

        const owners = await ownerCol.find().toArray();

        for (const owner of owners) {

            const login = await userCol.findOne({
                owner_id: owner.owner_id
            });

            result.push({

                username: login ? login.username : owner.ownerName,

                role: "Owner",

                status: login ? "Password Created" : "Create Password",

                canCreate: !login,

                owner_id: owner.owner_id,

                staff_id: null

            });

        }

        // ===========================
        // STAFF
        // ===========================

        const staff = await staffCol.find().toArray();

        for (const member of staff) {

            const login = await userCol.findOne({
                staff_id: member.staff_id
            });

            result.push({

                username: login ? login.username : member.staffName,

                role: "Staff",

                status: login ? "Password Created" : "Create Password",

                canCreate: !login,

                owner_id: null,

                staff_id: member.staff_id

            });

        }

        res.json(result);

    } catch (err) {

        console.error(err);

        res.status(500).json({

            error: "Failed to fetch users."

        });

    }

});

/* ==========================================================
   GET OWNERS WITHOUT LOGIN ACCOUNT
========================================================== */
router.get("/owners", async (req, res) => {
    try {
        const ownerCol = await Owner();
        const userCol = await User();

        const owners = await ownerCol.find().toArray();
        const users = await userCol.find(
            { role: "owner" }
        ).toArray();

        const usedOwnerIds = users.map(u => u.owner_id);

        const availableOwners = owners.filter(
            o => !usedOwnerIds.includes(o.owner_id)
        );

        res.json(
            availableOwners.map(o => ({
                owner_id: o.owner_id,
                ownerName: o.ownerName
            }))
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch owners" });
    }
});


/* ==========================================================
   GET STAFF WITHOUT LOGIN ACCOUNT
========================================================== */
router.get("/staff", async (req, res) => {
    try {
        const staffCol = await Staff();
        const userCol = await User();

        const staff = await staffCol.find().toArray();
        const users = await userCol.find(
            { role: "staff" }
        ).toArray();

        const usedStaffIds = users.map(u => u.staff_id);

        const availableStaff = staff.filter(
            s => !usedStaffIds.includes(s.staff_id)
        );

        res.json(
            availableStaff.map(s => ({
                staff_id: s.staff_id,
                staffName: s.staffName
            }))
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch staff" });
    }
});


/* ==========================================================
   CREATE USER
========================================================== */
router.post("/", async (req, res) => {

    try {

        const {
            username,
            password,
            role,
            owner_id,
            staff_id
        } = req.body;

        const userCol = await User();

        if (!username || !password || !role) {
            return res.status(400).json({
                error: "All fields are required."
            });
        }

        const existing = await userCol.findOne({
            username
        });

        if (existing) {
            return res.status(400).json({
                error: "Username already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user_id = await getNextSequence("user_id");

        await userCol.insertOne({

            user_id,

            username,

            password: hashedPassword,

            role,

            owner_id:
                role === "owner"
                    ? Number(owner_id)
                    : null,

            staff_id:
                role === "staff"
                    ? Number(staff_id)
                    : null
        });

        res.json({
            message: "User created successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to create user."
        });

    }

});


/* ==========================================================
   RESET PASSWORD
========================================================== */
router.put("/:id/reset-password", async (req, res) => {

    try {

        const userCol = await User();

        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                error: "Password required."
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        await userCol.updateOne(
            {
                user_id: Number(req.params.id)
            },
            {
                $set: {
                    password: hashed
                }
            }
        );

        res.json({
            message: "Password updated."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to reset password."
        });

    }

});


/* ==========================================================
   DELETE USER
========================================================== */
router.delete("/:id", async (req, res) => {

    try {

        const userCol = await User();

        await userCol.deleteOne({
            user_id: Number(req.params.id)
        });

        res.json({
            message: "User deleted."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to delete user."
        });

    }

});

export default router;
