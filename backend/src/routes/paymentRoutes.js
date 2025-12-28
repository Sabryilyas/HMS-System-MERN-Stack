import express from 'express';
import {
    createMockPaymentIntent,
    createMockPaymentIntentWithBooking,
    confirmMockPayment,
    getMyPayments
} from '../controllers/mockPaymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route for simple payment intent (checkout page) - MOCK VERSION
router.post('/create-payment-intent', createMockPaymentIntent);

// Protected routes
router.use(protect);

router.post('/create-intent', createMockPaymentIntentWithBooking);
router.post('/confirm', confirmMockPayment);
router.get('/my', getMyPayments);

export default router;
