import express from 'express';
import { getNextSequence } from '../db.js';
import ServiceRequest from '../models/ServiceRequest.js';

const router = express.Router();
router.post('/service-requests', async (req, res) => {
    try {
        const { ownerId, title, description, priority, requestDate, contactPhone } = req.body;

        console.log("Incoming Data:", req.body);

        if (!ownerId || isNaN(ownerId)) {
            return res.status(400).json({ error: 'Owner ID required' });
        }

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const finalRequestDate = requestDate
            ? new Date(requestDate)
            : new Date();

        const serviceRequestCol = await ServiceRequest();
        const request_id = await getNextSequence('request_id');

        await serviceRequestCol.insertOne({
            request_id,
            title,
            description,
            owner_id: Number(ownerId),
            priority: priority || null,
            contact_phone: contactPhone || null,
            status: 'Pending',
            assigned_staff_id: null,
            request_date: finalRequestDate,
            resolved_date: null,
            created_at: new Date()
        });

        res.json({ message: 'Service request submitted successfully', id: request_id });

    } catch (err) {
        console.error("SERVICE REQUEST INSERT ERROR:", err);
        res.status(500).json({ error: 'Server error on service request' });
    }
});

export default router;
