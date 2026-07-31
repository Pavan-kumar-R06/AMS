import express from "express";
import bcrypt from "bcrypt";
import Owner from "../models/Owner.js";
import Staff from "../models/Staff.js";
import User from "../models/User.js";

const router = express.Router();


   // Get Profile //

router.get("/profile/:id/:role", async (req, res) => {
    try {

        const { id, role } = req.params;

        let doc;

        if (role === "owner") {

            const ownerCol = await Owner();
            const owner = await ownerCol.findOne({ owner_id: Number(id) });
            doc = owner ? { name: owner.ownerName, email: owner.email } : null;

        } else if (role === "staff") {

            const staffCol = await Staff();
            const staff = await staffCol.findOne({ staff_id: Number(id) });
            doc = staff ? { name: staff.staffName, email: staff.email } : null;

        } else {

            return res.status(400).json({
                message: "Invalid role"
            });

        }

        if (!doc) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(doc);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }
});



   //Update Profile//

router.put("/profile", async (req, res) => {

    try {

        const { id, role, name, email } = req.body;

        if (role === "owner") {

            const ownerCol = await Owner();
            const userCol = await User();

            await ownerCol.updateOne(
                { owner_id: Number(id) },
                { $set: { ownerName: name, email } }
            );

            await userCol.updateOne(
                { owner_id: Number(id) },
                { $set: { username: name } }
            );

        } else if (role === "staff") {

            const staffCol = await Staff();
            const userCol = await User();

            await staffCol.updateOne(
                { staff_id: Number(id) },
                { $set: { staffName: name, email } }
            );

            await userCol.updateOne(
                { staff_id: Number(id) },
                { $set: { username: name } }
            );

        } else {

            return res.status(400).json({
                message: "Invalid role"
            });

        }

        return res.json({
            success: true,
            message: "Profile updated successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});



   //Change Password//

router.put("/password", async (req, res) => {

    try {

        const { id, role, currentPassword, newPassword } = req.body;
        const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{6,}$/;

if (!passwordRegex.test(newPassword)) {

    return res.status(400).json({

        success: false,

        message:
            "Password must contain at least 6 characters, one uppercase letter, one lowercase letter, one number and one special character."

    });

}

        let filter;

        if (role === "owner") {

            filter = { owner_id: Number(id) };

        } else if (role === "staff") {

            filter = { staff_id: Number(id) };

        } else {

            return res.status(400).json({
                message: "Invalid role"
            });

        }

        const userCol = await User();
        const user = await userCol.findOne(filter);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        const match = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!match) {

            return res.status(400).json({
                success: false,
                message: "Current password is incorrect."
            });

        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await userCol.updateOne(
            { user_id: user.user_id },
            { $set: { password: hashed } }
        );

        return res.json({
            success: true,
            message: "Password updated successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

});

export default router;
