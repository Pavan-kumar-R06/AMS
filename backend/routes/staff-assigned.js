import express from 'express';
import ServiceRequest from '../models/ServiceRequest.js';

const router = express.Router();

router.get('/assigned-requests', async (req, res) => {
    try {
        const staffId = req.query.staffId;
        const status = req.query.status || '';

        if (!staffId) return res.status(401).json({ error: 'Unauthorized: Staff ID required.' });

        const serviceRequestCol = await ServiceRequest();

        const match = { assigned_staff_id: Number(staffId) };
        if (status) {
            match.status = status;
        }

        const docs = await serviceRequestCol
            .find(match)
            .sort({ request_date: -1 })
            .toArray();

        const requests = docs.map(r => ({
            id: r.request_id,
            title: r.title,
            description: r.description,
            status: r.status,
            priority: r.priority,
            request_date: r.request_date
        }));

        res.json(requests);

    } catch (err) {
        console.error('FETCH ASSIGNED REQUESTS ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

export default router;
