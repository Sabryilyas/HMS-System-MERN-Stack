import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

/**
 * @desc    Get all rooms with filtering, sorting and pagination
 * @route   GET /api/rooms
 * @access  Public
 */
export const getAllRooms = async (req, res, next) => {
    try {
        // 1. Filtering
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'checkIn', 'checkOut'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Date overlap filtering OR General Availability exclusion
        let roomIdsToExclude = [];

        // 1. If dates are provided, exclude conflicting bookings
        if (req.query.checkIn && req.query.checkOut) {
            const checkIn = new Date(req.query.checkIn);
            const checkOut = new Date(req.query.checkOut);

            const conflictingBookings = await Booking.find({
                status: { $in: ['confirmed', 'checked-in', 'pending'] },
                $or: [
                    {
                        checkInDate: { $lt: checkOut },
                        checkOutDate: { $gt: checkIn }
                    }
                ]
            }).select('room');

            roomIdsToExclude = conflictingBookings.map(b => b.room);
        } else {
            // 2. If no dates are provided, exclude rooms that are CURRENTLY occupied or booked for today
            const today = new Date();
            const tonight = new Date();
            tonight.setHours(23, 59, 59, 999);

            const currentBookings = await Booking.find({
                status: { $in: ['confirmed', 'checked-in'] },
                checkInDate: { $lte: tonight },
                checkOutDate: { $gte: today }
            }).select('room');

            roomIdsToExclude = currentBookings.map(b => b.room);

            // Also exclude rooms marked as 'occupied' or 'maintenance' in the Room model itself
            queryObj.status = { $nin: ['occupied', 'maintenance'] };
        }

        if (roomIdsToExclude.length > 0) {
            queryObj._id = { $nin: roomIdsToExclude };
        }

        // Advanced filtering (gt, gte, lt, lte)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Room.find(JSON.parse(queryStr));

        // 2. Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // 3. Field Limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // 4. Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Execute query
        const rooms = await query;

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get single room
 * @route   GET /api/rooms/:id
 * @access  Public
 */
export const getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: `Room not found with id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create new room
 * @route   POST /api/rooms
 * @access  Private (Admin only)
 */
export const createRoom = async (req, res, next) => {
    try {
        const { price, discountPrice } = req.body;

        if (discountPrice && Number(discountPrice) >= Number(price)) {
            return res.status(400).json({
                success: false,
                message: 'Discount price must be less than regular price'
            });
        }

        const room = await Room.create(req.body);

        res.status(201).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update room
 * @route   PUT /api/rooms/:id
 * @access  Private (Admin only)
 */
export const updateRoom = async (req, res, next) => {
    try {
        let room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: `Room not found with id of ${req.params.id}`
            });
        }

        // Validate Price Logic
        const newPrice = req.body.price !== undefined ? Number(req.body.price) : room.price;
        const newDiscount = req.body.discountPrice !== undefined ? Number(req.body.discountPrice) : room.discountPrice;

        if (newDiscount && newDiscount >= newPrice) {
            return res.status(400).json({
                success: false,
                message: `Discount price (${newDiscount}) must be less than regular price (${newPrice})`
            });
        }

        room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete room
 * @route   DELETE /api/rooms/:id
 * @access  Private (Admin only)
 */
export const deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: `Room not found with id of ${req.params.id}`
            });
        }

        await room.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get available rooms
 * @route   GET /api/rooms/available
 * @access  Public
 */
export const getAvailableRooms = async (req, res, next) => {
    try {
        // This is a simplified availability check
        // In a real app, you'd check against bookings for the given date range
        const rooms = await Room.find({ status: 'available' });

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (err) {
        next(err);
    }
};
