import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

// Initialize Stripe
// Note: Make sure STRIPE_SECRET_KEY is set in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * @desc    Create Simple Payment Intent (for checkout)
 * @route   POST /api/payments/create-payment-intent
 * @access  Public/Private
 */
export const createSimplePaymentIntent = async (req, res, next) => {
    try {
        const { amount, currency = 'usd' } = req.body;

        // Validate amount
        if (!amount || amount < 50) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount. Minimum is $0.50'
            });
        }

        // Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        });
    } catch (err) {
        console.error('❌ Error creating payment intent:', err);
        res.status(500).json({
            success: false,
            error: err.message || 'Failed to create payment intent'
        });
    }
};

/**
 * @desc    Create Payment Intent (with booking)
 * @route   POST /api/payments/create-intent
 * @access  Private
 */
export const createPaymentIntent = async (req, res, next) => {
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

        // 2. Create Stripe Payment Intent
        // Amount must be in cents/smallest currency unit
        const amount = Math.round(booking.totalPrice * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: {
                bookingId: booking._id.toString(),
                userId: req.user.id
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // 3. Create Payment Record (Pending)
        await Payment.create({
            user: req.user.id,
            booking: booking._id,
            amount: booking.totalPrice,
            stripePaymentIntentId: paymentIntent.id,
            stripeClientSecret: paymentIntent.client_secret,
            status: 'pending'
        });

        // 4. Update Booking with Payment Intent ID
        booking.paymentIntentId = paymentIntent.id;
        await booking.save();

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Confirm Payment (Webhook or Manual)
 * @route   POST /api/payments/confirm
 * @access  Private
 */
export const confirmPayment = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment Intent ID is required'
            });
        }

        // 1. Retrieve Payment Intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent) {
            return res.status(404).json({
                success: false,
                message: 'Payment Intent not found'
            });
        }

        // 2. Update Payment Record
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

        if (payment) {
            payment.status = paymentIntent.status;
            await payment.save();
        }

        // 3. Update Booking Status if succeeded
        if (paymentIntent.status === 'succeeded') {
            const booking = await Booking.findOne({ paymentIntentId: paymentIntentId });
            if (booking) {
                booking.paymentStatus = 'paid';
                booking.status = 'confirmed';
                await booking.save();
            }
        }

        res.status(200).json({
            success: true,
            status: paymentIntent.status
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
