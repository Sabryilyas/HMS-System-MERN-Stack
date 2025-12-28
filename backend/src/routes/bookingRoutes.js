import express from 'express';
import {
    createBooking,
    getMyBookings,
    getBooking,
    getAllBookings,
    updateBooking,
    cancelBooking
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All booking routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBooking);
router.delete('/:id', cancelBooking);

// Admin only routes
router.get('/', authorize('admin', 'receptionist'), getAllBookings);
router.put('/:id', authorize('admin', 'receptionist'), updateBooking);

export default router;
