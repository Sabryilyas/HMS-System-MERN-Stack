import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'usd'
    },
    paymentMethod: {
        type: String,
        default: 'card'
    },
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'refunded'],
        default: 'pending'
    },
    stripePaymentIntentId: {
        type: String,
        required: true
    },
    stripeClientSecret: {
        type: String
    },
    receiptUrl: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
