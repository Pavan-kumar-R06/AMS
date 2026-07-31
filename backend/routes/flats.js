import express from 'express';
import { getNextSequence } from '../db.js';
import Flat from '../models/Flat.js';
import Owner from '../models/Owner.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { search, status, floor } = req.query;
        const flatCol = await Flat();

        const match = {};
        if (search) {
            match.$or = [
                { flat_number: { $regex: search, $options: 'i' } },
                { flat_type: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) {
            match.status = status;
        }
        if (floor) {
            match.floor_no = isNaN(floor) ? floor : Number(floor);
        }

        const rows = await flatCol.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'owner',
                    localField: 'flat_id',
                    foreignField: 'flat_id',
                    as: 'ownerInfo'
                }
            },
            {
                $addFields: {
                    ownerName: { $arrayElemAt: ['$ownerInfo.ownerName', 0] }
                }
            },
            { $project: { ownerInfo: 0, _id: 0 } }
        ]).toArray();

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch flats' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const flatCol = await Flat();
        const flat = await flatCol.findOne(
            { flat_id: Number(req.params.id) },
            { projection: { _id: 0 } }
        );
        if (!flat) return res.status(404).json({ error: 'Flat not found' });
        res.json(flat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch flat' });
    }
});


router.post('/', async (req, res) => {
    const {
        flat_number,
        floor_no,
        flat_type,
        status = 'Vacant',
        apartment_id,
        area_sqft = 0
    } = req.body;


    if (!flat_number || !floor_no || !flat_type || !apartment_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const flatCol = await Flat();
        const flat_id = await getNextSequence('flat_id');

        await flatCol.insertOne({
            flat_id,
            flat_number,
            floor_no,
            flat_type,
            status,
            apartment_id,
            area_sqft
        });

        res.json({ message: 'Flat created', flat_id });
    } catch (err) {
        console.error('Error saving flat:', err.message);
        res.status(500).json({ error: 'Failed to create flat' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { flat_number, floor_no, flat_type, status, apartment_id, area_sqft, owner_id } = req.body;
        const flatId = Number(req.params.id);
        const flatCol = await Flat();
        const ownerCol = await Owner();

        await flatCol.updateOne(
            { flat_id: flatId },
            { $set: { flat_number, floor_no, flat_type, status, apartment_id, area_sqft } }
        );


        await ownerCol.updateMany(
            { flat_id: flatId },
            { $set: { flat_id: null } }
        );


        if (owner_id) {
            await ownerCol.updateOne(
                { owner_id: Number(owner_id) },
                { $set: { flat_id: flatId } }
            );
        }

        res.json({ message: 'Flat updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update flat' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const flatCol = await Flat();
        await flatCol.deleteOne({ flat_id: Number(req.params.id) });
        res.json({ message: 'Flat deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete flat' });
    }
});

export default router;
