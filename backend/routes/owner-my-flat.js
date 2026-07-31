import express from 'express';
import Owner from '../models/Owner.js';
import Flat from '../models/Flat.js';
import ParkingSlot from '../models/ParkingSlot.js';

const router = express.Router();

router.get('/:ownerId', async (req, res) => {
    const { ownerId } = req.params;
    console.log('Request received for ownerId:', ownerId);

    if (!ownerId || isNaN(ownerId)) {
        return res.status(400).json({ error: 'Valid ownerId is required' });
    }

    try {
        const ownerCol = await Owner();
        const flatCol = await Flat();
        const parkingCol = await ParkingSlot();

        const owner = await ownerCol.findOne({ owner_id: Number(ownerId) });
        if (!owner || !owner.flat_id) {
            return res.status(404).json({ error: 'No flat found for this owner' });
        }

        const flat = await flatCol.findOne({ flat_id: owner.flat_id });
        if (!flat) {
            return res.status(404).json({ error: 'No flat found for this owner' });
        }

        const flatInfo = {
            flat_id: flat.flat_id,
            flatNumber: flat.flat_number,
            floorNo: flat.floor_no,
            area: flat.area_sqft,
            ownerName: owner.ownerName,
            ownerContact: owner.phone,
            ownerEmail: owner.email
        };
        console.log('Flat query result:', flatInfo);

        const parkingDocs = await parkingCol
            .find({ flat_id: flatInfo.flat_id })
            .toArray();

        const parkingRows = parkingDocs.map(p => ({
            parking_id: p.parking_id,
            slotNumber: p.slot_number,
            vehicleNo: p.vehicle_no,
            vehicleType: p.vehicle_type,
            status: p.is_allocated === 1 ? 'Occupied' : 'Vacant'
        }));
        console.log('Parking query result:', parkingRows);

        flatInfo.parkingSlots = parkingRows || [];

        res.json(flatInfo);

    } catch (err) {
        console.error('FETCH FLAT ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

export default router;
