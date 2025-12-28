import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private
 */
export const createBooking = async (req, res, next) => {
    try {
        const {
            room: roomId,
            checkInDate,
            checkOutDate,
            guests,
            totalPrice,
            guestDetails
        } = req.body;

        // 1. Check if room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // 2. Check availability (Basic overlap check)
        // Find any booking for this room that overlaps with requested dates
        // (StartA <= EndB) and (EndA >= StartB)
        const existingBooking = await Booking.findOne({
            room: roomId,
            status: { $in: ['confirmed', 'checked-in', 'pending'] },
            $or: [
                {
                    checkInDate: { $lt: new Date(checkOutDate) },
                    checkOutDate: { $gt: new Date(checkInDate) }
                }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Room is already booked for these dates'
            });
        }

        // 3. Create booking
        const booking = await Booking.create({
            user: req.user.id,
            room: roomId,
            checkInDate,
            checkOutDate,
            guests,
            totalPrice,
            guestDetails,
            status: 'pending',
            paymentStatus: 'pending'
        });

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get my bookings
 * @route   GET /api/bookings/my
 * @access  Private
 */
export const getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('room', 'name type images')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
export const getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('room')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Make sure user owns booking or is admin
        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all bookings (Admin)
 * @route   GET /api/bookings
 * @access  Private (Admin)
 */
export const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate('room', 'name')
            .populate('user', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id
 * @access  Private (Admin/Staff)
 */
export const updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Cancel booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
export const cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Make sure user owns booking or is admin
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Only allow cancellation if status is pending or confirmed
        if (['checked-in', 'checked-out', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel booking with status: ${booking.status}`
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({
            success: true,
            data: booking,
            message: 'Booking cancelled successfully'
        });
    } catch (err) {
        next(err);
    }
};
