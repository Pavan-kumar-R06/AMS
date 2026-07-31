import express from 'express';
import { getNextSequence } from '../db.js';
import Owner from '../models/Owner.js';
import Flat from '../models/Flat.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const ownerCol = await Owner();
        const rows = await ownerCol.aggregate([
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
        res.status(500).json({ error: 'Failed to fetch owners' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const ownerCol = await Owner();
        const rows = await ownerCol.aggregate([
            { $match: { owner_id: Number(req.params.id) } },
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

        if (!rows.length) return res.status(404).json({ error: 'Owner not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch owner' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { ownerName, phone, email, flat_id } = req.body;
        const ownerCol = await Owner();
        const flatCol = await Flat();
        const owner_id = await getNextSequence('owner_id');

        await ownerCol.insertOne({
            owner_id,
            ownerName,
            phone: phone || null,
            email: email || null,
            flat_id: flat_id ? Number(flat_id) : null
        });


        if (flat_id) {
            await flatCol.updateOne(
                { flat_id: Number(flat_id) },
                { $set: { status: 'Occupied' } }
            );
        }

        res.json({ message: 'Owner created', owner_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create owner' });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { ownerName, phone, email, flat_id } = req.body;
        const ownerId = Number(req.params.id);
        const ownerCol = await Owner();
        const flatCol = await Flat();


        const prev = await ownerCol.findOne({ owner_id: ownerId });
        const prevFlatId = prev?.flat_id;

        await ownerCol.updateOne(
            { owner_id: ownerId },
            { $set: { ownerName, phone: phone || null, email: email || null, flat_id: flat_id ? Number(flat_id) : null } }
        );


        if (prevFlatId && prevFlatId != flat_id) {
            await flatCol.updateOne(
                { flat_id: prevFlatId },
                { $set: { status: 'Vacant' } }
            );
        }
        if (flat_id) {
            await flatCol.updateOne(
                { flat_id: Number(flat_id) },
                { $set: { status: 'Occupied' } }
            );
        }

        res.json({ message: 'Owner updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update owner' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const ownerId = Number(req.params.id);
        const ownerCol = await Owner();
        const userCol = await User();
        const flatCol = await Flat();

        // Find owner
        const owner = await ownerCol.findOne({ owner_id: ownerId });
        const flatId = owner?.flat_id;

        // Delete owner
        await ownerCol.deleteOne({ owner_id: ownerId });

        // NEW: Delete corresponding login user
        await userCol.deleteOne({ owner_id: ownerId });

        // Mark flat as vacant
        if (flatId) {
            await flatCol.updateOne(
                { flat_id: flatId },
                { $set: { status: 'Vacant' } }
            );
        }

        res.json({ message: 'Owner deleted successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete owner' });
    }
});
// router.delete('/:id', async (req, res) => {
//     try {
//         const ownerId = Number(req.params.id);
//         const db = await dbPromise;


//         const owner = await db.collection('owner').findOne({ owner_id: ownerId });
//         const flatId = owner?.flat_id;

//         await db.collection('owner').deleteOne({ owner_id: ownerId });


//         if (flatId) {
//             await db.collection('flat').updateOne(
//                 { flat_id: flatId },
//                 { $set: { status: 'Vacant' } }
//             );
//         }

//         res.json({ message: 'Owner deleted' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to delete owner' });
//     }
// });

export default router;
