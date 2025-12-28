import express from 'express';
import {
    getAllRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    getAvailableRooms
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/available', getAvailableRooms);
router.get('/', getAllRooms);
router.get('/:id', getRoom);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;
