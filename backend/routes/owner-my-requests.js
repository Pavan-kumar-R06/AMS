import express from 'express';
import ServiceRequest from '../models/ServiceRequest.js';
import Staff from '../models/Staff.js';

const router = express.Router();
router.get('/:ownerId', async (req, res) => {
    const ownerId = req.params.ownerId;
    const { status } = req.query;

    if (!ownerId || isNaN(ownerId)) {
        return res.status(400).json({ error: 'Valid Owner ID is required' });
    }

    try {
        const serviceRequestCol = await ServiceRequest();
        const staffCol = await Staff();

        const match = { owner_id: Number(ownerId) };
        if (status) {
            match.status = status;
        }

        const docs = await serviceRequestCol
            .find(match)
            .sort({ request_date: -1 })
            .toArray();

        const staffIds = [...new Set(docs.map(d => d.assigned_staff_id).filter(id => id != null))];
        const staffDocs = staffIds.length
            ? await staffCol.find({ staff_id: { $in: staffIds } }).toArray()
            : [];
        const staffMap = new Map(staffDocs.map(s => [s.staff_id, s.staffName]));

        const formatDate = (d) => {
            if (!d) return null;
            const date = new Date(d);
            const pad = (n) => String(n).padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
                   `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        const rows = docs.map(sr => ({
            request_id: sr.request_id,
            title: sr.title,
            description: sr.description,
            status: sr.status,
            request_date: formatDate(sr.request_date),
            priority: sr.priority,
            contact_phone: sr.contact_phone,
            staffName: sr.assigned_staff_id ? (staffMap.get(sr.assigned_staff_id) || null) : null
        }));

        res.json(rows || []);

    } catch (err) {
        console.error("FETCH SERVICE REQUESTS ERROR:", err);
        res.status(500).json({
            error: 'Failed to fetch service requests',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

export default router;
