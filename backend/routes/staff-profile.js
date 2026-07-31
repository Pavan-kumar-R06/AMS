import express from 'express';
import Staff from '../models/Staff.js';

const router = express.Router();
router.get('/profile', async (req, res) => {
    try {
        const staffId = req.query.staffId;

        if (!staffId) return res.status(400).json({ error: 'Staff ID required' });

        const staffCol = await Staff();
        const row = await staffCol.findOne({ staff_id: Number(staffId) });

        if (!row) return res.status(404).json({ error: 'Staff not found' });

        const staff = {
            id: row.staff_id,
            name: row.staffName,
            role: row.role,
            contact: row.phone,
            email: row.email,
            joinDate: row.created_at,
            status: row.is_active === 1 ? 'Active' : 'Inactive'
        };

        res.json(staff);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/profile/status', async (req, res) => {
    try {
        const { staffId, status } = req.body;

        if (!staffId) return res.status(400).json({ error: 'Staff ID required' });
        if (!['Active', 'Inactive'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

        const isActive = status === 'Active' ? 1 : 0;
        const staffCol = await Staff();
        await staffCol.updateOne(
            { staff_id: Number(staffId) },
            { $set: { is_active: isActive } }
        );

        res.json({ message: 'Status updated successfully', status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
