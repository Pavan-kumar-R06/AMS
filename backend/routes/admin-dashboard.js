import express from 'express';
import Flat from '../models/Flat.js';
import Staff from '../models/Staff.js';
import Owner from '../models/Owner.js';
import ParkingSlot from '../models/ParkingSlot.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Apartment from '../models/Apartment.js';

const router = express.Router();
const toInt = (val) => val ? parseInt(val) : 0;

router.get('/', async (req, res) => {
    try {
        const flatCol = await Flat();
        const staffCol = await Staff();
        const ownerCol = await Owner();
        const parkingCol = await ParkingSlot();
        const serviceRequestCol = await ServiceRequest();
        const apartmentCol = await Apartment();

        const flatStatsAgg = await flatCol.aggregate([
            {
                $group: {
                    _id: null,
                    totalFlats: { $sum: 1 },
                    occupiedFlats: { $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] } },
                    vacantFlats: { $sum: { $cond: [{ $eq: ['$status', 'Vacant'] }, 1, 0] } }
                }
            }
        ]).toArray();
        const flatsRow = flatStatsAgg[0] || { totalFlats: 0, occupiedFlats: 0, vacantFlats: 0 };

        const staffList = await staffCol.find({}, { projection: { _id: 0 } }).toArray();
        const staffOverviewRows = staffList.map(s => ({
            staff_id: s.staff_id,
            staffName: s.staffName,
            role: s.role,
            status: s.is_active === 1 ? 'Active' : 'Inactive'
        }));

        const totalOwners = await ownerCol.countDocuments();
        const totalParkingSlots = await parkingCol.countDocuments();

        const workloadRows = await staffCol.aggregate([
            {
                $lookup: {
                    from: 'service_request',
                    localField: 'staff_id',
                    foreignField: 'assigned_staff_id',
                    as: 'requests'
                }
            },
            {
                $project: {
                    _id: 0,
                    staffId: '$staff_id',
                    staffName: 1,
                    role: 1,
                    status: { $cond: [{ $eq: ['$is_active', 1] }, 'Active', 'Inactive'] },
                    totalRequests: { $size: '$requests' },
                    completedRequests: {
                        $size: {
                            $filter: {
                                input: '$requests',
                                cond: { $eq: ['$$this.status', 'Completed'] }
                            }
                        }
                    },
                    pendingRequests: {
                        $size: {
                            $filter: {
                                input: '$requests',
                                cond: { $in: ['$$this.status', ['Pending', 'Working']] }
                            }
                        }
                    }
                }
            }
        ]).toArray();

        const recentRequestsRows = await serviceRequestCol.aggregate([
            {
                $lookup: {
                    from: 'owner',
                    localField: 'owner_id',
                    foreignField: 'owner_id',
                    as: 'ownerInfo'
                }
            },
            { $unwind: { path: '$ownerInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'staff',
                    localField: 'assigned_staff_id',
                    foreignField: 'staff_id',
                    as: 'staffInfo'
                }
            },
            { $unwind: { path: '$staffInfo', preserveNullAndEmptyArrays: true } },
            { $sort: { created_at: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    requestId: '$request_id',
                    serviceType: '$title',
                    status: 1,
                    requestDate: '$created_at',
                    ownerName: '$ownerInfo.ownerName',
                    assignedStaff: '$staffInfo.staffName'
                }
            }
        ]).toArray();

        const apartmentsRows = await apartmentCol.aggregate([
            {
                $lookup: {
                    from: 'flat',
                    localField: 'apartment_id',
                    foreignField: 'apartment_id',
                    as: 'flats'
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    address: 1,
                    totalFloors: '$total_floors',
                    totalFlats: { $size: '$flats' },
                    occupiedFlats: {
                        $size: { $filter: { input: '$flats', cond: { $eq: ['$$this.status', 'Occupied'] } } }
                    },
                    vacantFlats: {
                        $size: { $filter: { input: '$flats', cond: { $eq: ['$$this.status', 'Vacant'] } } }
                    }
                }
            }
        ]).toArray();

        res.json({

            totalFlats: toInt(flatsRow.totalFlats),
            occupiedFlats: toInt(flatsRow.occupiedFlats),
            vacantFlats: toInt(flatsRow.vacantFlats),
            totalStaff: staffOverviewRows.length,
            activeStaff: staffOverviewRows.filter(s => s.status === 'Active').length,
            inactiveStaff: staffOverviewRows.filter(s => s.status === 'Inactive').length,
            totalOwners: toInt(totalOwners),
            totalParkingSlots: toInt(totalParkingSlots),

            // Tables
            staffWorkload: workloadRows,
            recentRequests: recentRequestsRows,
            apartments: apartmentsRows
        });

    } catch (err) {
        console.error('ADMIN DASHBOARD SERVER ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

export default router;
