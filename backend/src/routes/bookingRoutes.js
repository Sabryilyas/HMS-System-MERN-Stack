import express from 'express';
import {
    createBooking,
    getMyBookings,
    getBooking,
    getAllBookings,
    updateBooking,
    cancelBooking,
    checkInBooking,
    checkOutBooking,
    getBookingBill,
    processPayment
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All booking routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBooking);
router.get('/:id/bill', getBookingBill);
router.delete('/:id', cancelBooking);

// Admin only routes
router.get('/', authorize('admin', 'receptionist'), getAllBookings);
router.put('/:id', authorize('admin', 'receptionist'), updateBooking);
router.put('/:id/checkin', authorize('admin', 'receptionist', 'staff'), checkInBooking);
router.put('/:id/payment', authorize('admin', 'receptionist', 'staff'), processPayment);
router.put('/:id/checkout', authorize('admin', 'receptionist', 'staff'), checkOutBooking);

export default router;
