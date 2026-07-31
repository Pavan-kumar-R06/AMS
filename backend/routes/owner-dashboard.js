import express from 'express';
import Owner from '../models/Owner.js';
import Flat from '../models/Flat.js';
import ParkingSlot from '../models/ParkingSlot.js';
import ServiceRequest from '../models/ServiceRequest.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        const ownerId = req.query.ownerId;

        if (!ownerId || isNaN(ownerId)) {
             return res.status(401).json({ error: 'Unauthorized: owner ID required.' });
        }

        const ownerCol = await Owner();
        const flatCol = await Flat();
        const parkingCol = await ParkingSlot();
        const serviceRequestCol = await ServiceRequest();

        const owner = await ownerCol.findOne({ owner_id: Number(ownerId) });
        if (!owner || !owner.flat_id) {
            return res.status(404).json({ error: 'owner data not found.' });
        }

        const flat = await flatCol.findOne({ flat_id: owner.flat_id });
        if (!flat) {
            return res.status(404).json({ error: 'owner data not found.' });
        }

        const ownerData = {
            name: owner.ownerName,
            number: flat.flat_number,
            floor: flat.floor_no,
            area: flat.area_sqft
        };

        const parkingRows = await parkingCol
            .find({ flat_id: owner.flat_id })
            .toArray();

        const requestsRows = await serviceRequestCol.aggregate([
            { $match: { owner_id: Number(ownerId), status: { $in: ['Pending', 'Working', 'Assigned'] } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();

        let activeRequests = { total: 0, pending: 0, working: 0 };
        requestsRows.forEach(r => {
            activeRequests.total += r.count;
            if (r._id === 'Pending') activeRequests.pending = r.count;
            if (r._id === 'Working' || r._id === 'Assigned') activeRequests.working += r.count;
        });

        const parking = parkingRows.length
            ? { slotNumber: parkingRows[0].slot_number, vehicle: parkingRows[0].vehicle_no, vehicleType: parkingRows[0].vehicle_type }
            : null;

        res.json({
            name: ownerData.name,
            flat: {
                number: ownerData.number,
                floor: ownerData.floor,
                area: ownerData.area,
            },
            parking,
            activeRequests
        });

    } catch (err) {
        console.error('DASHBOARD FETCH ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
