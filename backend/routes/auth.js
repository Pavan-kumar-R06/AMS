import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Owner from "../models/Owner.js";
import Staff from "../models/Staff.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ message: "All fields required" });
        }

        const userCol = await User();
        const user = await userCol.findOne({ username, role });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials or role mismatch" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

       if (role === "owner" && !user.owner_id) {
    return res.status(400).json({ message: "User role not linked to owner record" });
}
        
        if (role === "staff" && !user.staff_id) {
            return res.status(400).json({ message: "User role not linked to staff record" });
        }

        let loginId;
        let name = "";

        if (role === "owner") {

            loginId = user.owner_id;

            const ownerCol = await Owner();
            const owner = await ownerCol.findOne(
                { owner_id: user.owner_id },
                { projection: { ownerName: 1 } }
            );

            name = owner ? owner.ownerName : "";

        }

        else if (role === "staff") {

            loginId = user.staff_id;

            const staffCol = await Staff();
            const staff = await staffCol.findOne(
                { staff_id: user.staff_id },
                { projection: { staffName: 1 } }
            );

            name = staff ? staff.staffName : "";

        }

        else {

            loginId = user.user_id;

            name = user.username;

        }

        res.json({

            message: "Login successful",

            user: {

                id: loginId,
                username: user.username,
                role: user.role,
                name: name

            }

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
