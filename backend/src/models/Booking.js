import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    checkInDate: {
        type: Date,
        required: [true, 'Please provide check-in date']
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Please provide check-out date']
    },
    guests: {
        adults: {
            type: Number,
            required: true,
            default: 1,
            min: 1
        },
        children: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    paymentIntentId: {
        type: String
    },
    guestDetails: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        specialRequests: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Prevent booking if room is already booked for dates
// Note: This is a basic check, a more robust one would be in the controller
bookingSchema.pre('save', async function (next) {
    if (this.isNew) {
        const Room = mongoose.model('Room');
        const room = await Room.findById(this.room);

        if (!room) {
            throw new Error('Room not found');
        }

        // Check dates (basic validation)
        if (this.checkInDate >= this.checkOutDate) {
            throw new Error('Check-out date must be after check-in date');
        }
    }
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
