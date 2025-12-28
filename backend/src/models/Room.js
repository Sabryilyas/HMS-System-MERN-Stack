import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a room name'],
        trim: true,
        maxlength: [100, 'Room name cannot be more than 100 characters']
    },
    type: {
        type: String,
        required: [true, 'Please select a room type'],
        enum: {
            values: ['standard', 'deluxe', 'suite', 'penthouse', 'family'],
            message: 'Please select a valid room type'
        }
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price per night'],
        min: [0, 'Price cannot be negative']
    },
    discountPrice: {
        type: Number,
        min: [0, 'Discount price cannot be negative'],
        min: [0, 'Discount price cannot be negative']
    },
    maxOccupancy: {
        type: Number,
        required: [true, 'Please provide maximum occupancy'],
        min: [1, 'Occupancy must be at least 1']
    },
    size: {
        type: Number,
        required: [true, 'Please provide room size in sq ft']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    amenities: {
        type: [String],
        default: []
    },
    images: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance', 'reserved'],
        default: 'available'
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create index for faster queries
roomSchema.index({ type: 1, price: 1, status: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;
