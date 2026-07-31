import express from 'express';
import Staff from '../models/Staff.js';
import ServiceRequest from '../models/ServiceRequest.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        const staffId = req.query.staffId;
        if (!staffId || isNaN(staffId)) return res.status(401).json({ error: 'Unauthorized: Staff ID required.' });

        const staffCol = await Staff();
        const serviceRequestCol = await ServiceRequest();

        const staffDoc = await staffCol.findOne(
            { staff_id: Number(staffId) },
            { projection: { staffName: 1 } }
        );
        const staffName = staffDoc?.staffName || 'Staff';

        const requestRows = await serviceRequestCol.aggregate([
            { $match: { assigned_staff_id: Number(staffId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();

        let requests = { pending: 0, working: 0, completed: 0, cancelled: 0 };
        let totalRequests = 0;

        requestRows.forEach(r => {
            const count = Number(r.count);
            totalRequests += count;

            if (r._id === 'Pending') requests.pending = count;
            if (r._id === 'Working') requests.working = count;
            if (r._id === 'Completed') requests.completed = count;
            if (r._id === 'Cancelled') requests.cancelled = count;
        });

        res.json({
            name: staffName,
            totalRequests,
            requests
        });

    } catch (err) {
        console.error('STAFF DASHBOARD ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
