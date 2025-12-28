import express from 'express';
import {
    getHousekeepingRooms,
    updateRoomStatus,
    getHousekeepingTasks
} from '../controllers/housekeepingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'housekeeping', 'manager'));

router.get('/rooms', getHousekeepingRooms);
router.put('/rooms/:id/status', updateRoomStatus);
router.get('/tasks', getHousekeepingTasks);

export default router;
