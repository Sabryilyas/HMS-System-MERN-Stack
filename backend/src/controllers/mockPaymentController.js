import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

/**
 * @desc    Create Mock Payment Intent (simulates Stripe)
 * @route   POST /api/payments/create-payment-intent
 * @access  Public
 */
export const createMockPaymentIntent = async (req, res, next) => {
    try {
        const { amount, currency = 'usd' } = req.body;

        // Validate amount
        if (!amount || amount < 50) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount. Minimum is $0.50'
            });
        }

        // Generate mock payment intent ID (simulates Stripe format)
        const mockPaymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substr(2, 16)}`;



        res.status(200).json({
            success: true,
            clientSecret: mockClientSecret,
            id: mockPaymentIntentId
        });
    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message || 'Failed to create payment intent'
        });
    }
};

/**
 * @desc    Create Payment Intent with Booking (simulates Stripe)
 * @route   POST /api/payments/create-intent
 * @access  Private
 */
export const createMockPaymentIntentWithBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.body;

        // 1. Get booking details
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns booking
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // 2. Create Mock Payment Intent
        const amount = Math.round(booking.totalPrice * 100);
        const mockPaymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substr(2, 16)}`;

        // 3. Create Payment Record (Pending)
        await Payment.create({
            user: req.user.id,
            booking: booking._id,
            amount: booking.totalPrice,
            stripePaymentIntentId: mockPaymentIntentId,
            stripeClientSecret: mockClientSecret,
            status: 'pending'
        });

        // 4. Update Booking with Payment Intent ID
        booking.paymentIntentId = mockPaymentIntentId;
        await booking.save();



        res.status(200).json({
            success: true,
            clientSecret: mockClientSecret,
            paymentIntentId: mockPaymentIntentId
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Confirm Mock Payment
 * @route   POST /api/payments/confirm
 * @access  Private
 */
export const confirmMockPayment = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment Intent ID is required'
            });
        }

        // 1. Update Payment Record
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

        if (payment) {
            payment.status = 'succeeded';
            await payment.save();
        }

        // 2. Update Booking Status
        const booking = await Booking.findOne({ paymentIntentId: paymentIntentId });
        if (booking) {
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            await booking.save();
        }



        res.status(200).json({
            success: true,
            status: 'succeeded'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get Payment History for User
 * @route   GET /api/payments/my
 * @access  Private
 */
export const getMyPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({ user: req.user.id })
            .populate('booking', 'checkInDate checkOutDate')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (err) {
        next(err);
    }
};
