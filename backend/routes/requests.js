import express from 'express';
import { getNextSequence } from '../db.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Owner from '../models/Owner.js';
import Staff from '../models/Staff.js';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { status, staff, owner, search } = req.query;
    const serviceRequestCol = await ServiceRequest();

    const match = {};
    if (status) match.status = status;
    if (staff) match.assigned_staff_id = Number(staff);
    if (owner) match.owner_id = Number(owner);
    if (search) {
      match.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      // ownerName is only known after the $lookup below, so it is matched
      // separately once owner info has been joined in.
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'owner',
          localField: 'owner_id',
          foreignField: 'owner_id',
          as: 'ownerInfo'
        }
      },
      { $unwind: '$ownerInfo' }, // JOIN owner o ON r.owner_id = o.owner_id
      {
        $lookup: {
          from: 'staff',
          localField: 'assigned_staff_id',
          foreignField: 'staff_id',
          as: 'staffInfo'
        }
      },
      { $unwind: { path: '$staffInfo', preserveNullAndEmptyArrays: true } }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'ownerInfo.ownerName': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      { $sort: { request_date: -1 } },
      {
        $project: {
          _id: 0,
          id: '$request_id',
          requestType: '$title',
          description: 1,
          status: 1,
          requestDate: '$request_date',
          assignedStaffId: '$assigned_staff_id',
          ownerName: '$ownerInfo.ownerName',
          staffName: '$staffInfo.staffName'
        }
      }
    );

    const rows = await serviceRequestCol.aggregate(pipeline).toArray();
    res.json(rows);
  } catch (err) {
    console.error("GET REQUESTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {

    const { ownerId, requestType, description } = req.body;
    if (!ownerId || !requestType) {
      return res.status(400).json({ error: "ownerId and requestType are required" });
    }

    const serviceRequestCol = await ServiceRequest();
    const ownerCol = await Owner();
    const request_id = await getNextSequence('request_id');

    await serviceRequestCol.insertOne({
      request_id,
      owner_id: Number(ownerId),
      title: requestType,
      description: description || null,
      status: 'Pending',
      assigned_staff_id: null,
      request_date: new Date(),
      resolved_date: null,
      created_at: new Date()
    });

    const owner = await ownerCol.findOne({ owner_id: Number(ownerId) });

    res.status(201).json({
      id: request_id,
      requestType,
      ownerName: owner ? owner.ownerName : null
    });
  } catch (err) {
    console.error("POST REQUESTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { assignedStaffId, status } = req.body;
    const serviceRequestCol = await ServiceRequest();


    const update = {};
    let setResolvedDate = false;

    if (assignedStaffId !== undefined) {

      update.assigned_staff_id = assignedStaffId ? Number(assignedStaffId) : null;
    }
    if (status) {
      update.status = status;
      if (status === 'Completed' || status === 'Cancelled') {
        setResolvedDate = true;
      }
    }

    if (setResolvedDate) {
      update.resolved_date = new Date();
    } else {
      update.resolved_date = null;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    await serviceRequestCol.updateOne(
      { request_id: id },
      { $set: update }
    );

    const rows = await serviceRequestCol.aggregate([
      { $match: { request_id: id } },
      {
        $lookup: {
          from: 'owner',
          localField: 'owner_id',
          foreignField: 'owner_id',
          as: 'ownerInfo'
        }
      },
      { $unwind: '$ownerInfo' },
      {
        $lookup: {
          from: 'staff',
          localField: 'assigned_staff_id',
          foreignField: 'staff_id',
          as: 'staffInfo'
        }
      },
      { $unwind: { path: '$staffInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: '$request_id',
          requestType: '$title',
          description: 1,
          status: 1,
          requestDate: '$request_date',
          assignedStaffId: '$assigned_staff_id',
          ownerName: '$ownerInfo.ownerName',
          staffName: '$staffInfo.staffName'
        }
      }
    ]).toArray();

    res.json(rows[0]);
  } catch (err) {
    console.error("PUT REQUESTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const serviceRequestCol = await ServiceRequest();

    await serviceRequestCol.deleteOne({ request_id: id });
    res.json({ message: "Request deleted" });
  } catch (err) {
    console.error("DELETE REQUESTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/meta/staff", async (req, res) => {
  try {
    const staffCol = await Staff();

    const rows = await staffCol
      .find({}, { projection: { _id: 0, staff_id: 1, staffName: 1, role: 1 } })
      .toArray();

    const result = rows
      .map(s => ({ id: s.staff_id, name: s.staffName, role: s.role }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    res.json(result);
  } catch (err) {
    console.error("GET STAFF LIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/meta/owners", async (req, res) => {
  try {
    const ownerCol = await Owner();

    const rows = await ownerCol
      .find({}, { projection: { _id: 0, owner_id: 1, ownerName: 1, flat_id: 1 } })
      .toArray();

    const result = rows
      .map(o => ({ id: o.owner_id, name: o.ownerName, flat_id: o.flat_id }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    res.json(result);
  } catch (err) {
    console.error("GET OWNER LIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
