import express from 'express';
import { getNextSequence } from '../db.js';
import ParkingSlot from '../models/ParkingSlot.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const parkingCol = await ParkingSlot();
        const rows = await parkingCol.aggregate([
            { $sort: { parking_id: -1 } },
            {
                $lookup: {
                    from: 'flat',
                    localField: 'flat_id',
                    foreignField: 'flat_id',
                    as: 'flatInfo'
                }
            },
            {
                $addFields: {
                    flat_number: { $arrayElemAt: ['$flatInfo.flat_number', 0] }
                }
            },
            { $project: { flatInfo: 0, _id: 0 } }
        ]).toArray();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch parking slots' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const parkingCol = await ParkingSlot();
        const slot = await parkingCol.findOne(
            { parking_id: Number(id) },
            { projection: { _id: 0 } }
        );
        if (!slot) return res.status(404).json({ error: 'Parking slot not found' });
        res.json(slot);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch parking slot' });
    }
});

router.post('/', async (req, res) => {

    const { slot_number, flat_id, apartment_id, vehicle_no, vehicle_type, is_allocated } = req.body;
    try {
        const parkingCol = await ParkingSlot();
        const parking_id = await getNextSequence('parking_id');

        await parkingCol.insertOne({
            parking_id,
            slot_number,
            flat_id: flat_id ? Number(flat_id) : null,
            apartment_id: apartment_id || null,
            vehicle_no: vehicle_no || null,
            vehicle_type: vehicle_type || null,
            is_allocated: is_allocated ? 1 : 0
        });
        res.json({ parking_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create parking slot' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;

    const { slot_number, flat_id, apartment_id, vehicle_no, vehicle_type, is_allocated } = req.body;
    try {
        const parkingCol = await ParkingSlot();
        await parkingCol.updateOne(
            { parking_id: Number(id) },
            {
                $set: {
                    slot_number,
                    flat_id: flat_id ? Number(flat_id) : null,
                    apartment_id: apartment_id || null,
                    vehicle_no: vehicle_no || null,
                    vehicle_type: vehicle_type || null,
                    is_allocated: is_allocated ? 1 : 0
                }
            }
        );
        res.json({ message: 'Parking slot updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update parking slot' });
    }
});


router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const parkingCol = await ParkingSlot();
        await parkingCol.deleteOne({ parking_id: Number(id) });
        res.json({ message: 'Parking slot deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete parking slot' });
    }
});

export default router;
