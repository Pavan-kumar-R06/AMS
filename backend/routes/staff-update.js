import express from 'express';
import ServiceRequest from '../models/ServiceRequest.js';
import Owner from '../models/Owner.js';
import Flat from '../models/Flat.js';

const router = express.Router();

router.get('/assigned-list', async (req, res) => {
    try {
        const staffId = Number(req.query.staffId);
        if (!staffId) return res.status(401).json({ error: 'Unauthorized: Staff ID required.' });

        const serviceRequestCol = await ServiceRequest();

        const docs = await serviceRequestCol
            .find({
                assigned_staff_id: staffId,
                status: { $in: ['Pending', 'Working'] }
            })
            .sort({ request_date: -1 })
            .toArray();

        const requests = docs.map(r => ({
            id: r.request_id,
            title: r.title,
            description: r.description,
            status: r.status,
            request_date: r.request_date
        }));

        res.json(requests);

    } catch (err) {
        console.error('FETCH ASSIGNED LIST ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

router.get('/details/:requestId', async (req, res) => {
    try {
        const staffId = Number(req.query.staffId);
        const requestId = Number(req.params.requestId);

        if (!staffId || !requestId) return res.status(401).json({ error: 'IDs required.' });

        const serviceRequestCol = await ServiceRequest();
        const ownerCol = await Owner();
        const flatCol = await Flat();

        const request = await serviceRequestCol.findOne({
            request_id: requestId,
            assigned_staff_id: staffId
        });

        if (!request) return res.status(404).json({ error: 'Request not found or not assigned to you.' });

        const owner = await ownerCol.findOne({ owner_id: request.owner_id });
        if (!owner) return res.status(404).json({ error: 'Request not found or not assigned to you.' });

        const flat = await flatCol.findOne({ flat_id: owner.flat_id });
        if (!flat) return res.status(404).json({ error: 'Request not found or not assigned to you.' });

        res.json({
            id: request.request_id,
            serviceType: request.title,
            status: request.status,
            description: request.description,
           ownerName: owner.ownerName,
            flatNumber: flat.flat_number
        });
    } catch (err) {
        console.error('FETCH REQUEST DETAILS ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

router.put('/update-request/:requestId', async (req, res) => {
    try {
        const requestId = Number(req.params.requestId);
        const staffId = Number(req.body.staffId);
        const { status, notes } = req.body;

        if (!staffId) return res.status(401).json({ error: 'Unauthorized: Staff ID required.' });
        if (!['Pending', 'Working', 'Completed', 'Cancelled'].includes(status))
            return res.status(400).json({ error: 'Invalid status.' });

        const serviceRequestCol = await ServiceRequest();

        const existing = await serviceRequestCol.findOne({
            request_id: requestId,
            assigned_staff_id: staffId
        });

        if (!existing) {
            return res.status(403).json({ error: 'Not authorized to update this request.' });
        }

        const resolvedDate = (status === 'Completed') ? new Date() : null;
        const finalDescription = notes || existing.description;

        await serviceRequestCol.updateOne(
            { request_id: requestId },
            {
                $set: {
                    status,
                    description: finalDescription,
                    resolved_date: resolvedDate
                }
            }
        );

        res.json({ message: 'Request updated successfully' });
    } catch (err) {
        console.error('UPDATE STATUS ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

export default router;
