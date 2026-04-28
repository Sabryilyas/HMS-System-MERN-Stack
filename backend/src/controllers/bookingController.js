import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Payment from '../models/Payment.js';
import { io } from '../../server.js';
import { createNotification } from './notificationController.js';

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

        // 2. Date validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkIn = new Date(checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        const checkOut = new Date(checkOutDate);
        checkOut.setHours(0, 0, 0, 0);

        if (checkIn < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book past dates. Please select today or a future date.'
            });
        }

        if (checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date.'
            });
        }

        // 3. Check availability (Basic overlap check)
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
            status: req.body.status || 'pending',
            paymentStatus: req.body.paymentStatus || 'pending',
            paymentIntentId: req.body.paymentIntentId,
            paymentLast4: req.body.paymentLast4
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('room', 'name type price')
            .populate('user', 'name email');

        if (io) {
            io.emit('booking_created', populatedBooking);
        }

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
        }).populate('room', 'name')
            .populate('user', 'name');

        if (io) {
            io.emit('booking_updated', booking);
            io.to(booking.user._id.toString()).emit('my_booking_updated', booking);
        }

        // Create db notification
        if (req.body.status && req.body.status !== booking.status) {
            await createNotification(
                booking.user._id,
                'Booking Status Updated',
                `Your booking for ${booking.room?.name} is now ${req.body.status}.`,
                'info',
                '/user'
            );
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

/**
 * @desc    Check-in guest (mark arrival)
 * @route   PUT /api/bookings/:id/checkin
 * @access  Private (Admin/Staff)
 */
export const checkInBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('room');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Validate booking can be checked in
        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot check-in booking with status: ${booking.status}. Booking must be pending or confirmed.`
            });
        }

        // Update booking status and record actual check-in time
        booking.status = 'checked-in';
        booking.actualCheckInTime = new Date();
        await booking.save();

        // Update room status to occupied
        await Room.findByIdAndUpdate(booking.room._id || booking.room, {
            status: 'occupied'
        });

        // Fetch updated booking with populated data
        const updatedBooking = await Booking.findById(req.params.id)
            .populate('room', 'name type price')
            .populate('user', 'name email');

        res.status(200).json({
            success: true,
            message: 'Guest checked in successfully',
            data: updatedBooking
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Check-out guest and generate final bill
 * @route   PUT /api/bookings/:id/checkout
 * @access  Private (Admin/Staff)
 */
export const checkOutBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('room');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Validate booking is checked-in (cannot checkout before check-in)
        if (booking.status !== 'checked-in') {
            return res.status(400).json({
                success: false,
                message: `Cannot check-out booking with status: ${booking.status}. Guest must be checked-in first.`
            });
        }

        // Check if payment is completed
        if (booking.paymentStatus !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment must be completed before checkout. Please process payment first.'
            });
        }

        // Calculate room charges based on standard NIGHTS (Difference between dates)
        const checkInDateObj = new Date(booking.actualCheckInTime || booking.checkInDate);
        checkInDateObj.setHours(0, 0, 0, 0);
        const checkOutDateObj = new Date();
        checkOutDateObj.setHours(0, 0, 0, 0);

        // Standard hotel practice: calculate nights between check-in and check-out
        const diffTime = Math.abs(checkOutDateObj - checkInDateObj);
        const nightsStayed = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const roomPrice = booking.room?.price || (booking.totalPrice / Math.max(1, Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))));
        const roomCharges = nightsStayed * roomPrice;

        // Get all service requests for this booking
        let services = await ServiceRequest.find({ booking: booking._id });

        // Fallback: If no services found by ID, try user + room + current stay time (Safety for legacy data)
        if (services.length === 0) {
            services = await ServiceRequest.find({
                user: booking.user,
                room: booking.room._id || booking.room,
                status: { $ne: 'cancelled' },
                createdAt: { $gte: booking.actualCheckInTime || booking.checkInDate }
            });
        }

        const billableServices = services.filter(s => ['confirmed', 'in_progress', 'completed'].includes(s.status));
        const serviceCharges = billableServices.reduce((total, service) => total + (service.price || 0), 0);

        const subtotal = roomCharges + serviceCharges;
        const taxAmount = Math.round(subtotal * 0.1); // Standard 10% tax, rounded
        const totalAmount = subtotal + taxAmount;

        booking.status = 'checked-out';
        booking.actualCheckOutTime = checkOutDateObj;
        booking.serviceCharges = serviceCharges;
        booking.taxAmount = taxAmount;
        booking.totalAmount = totalAmount; // Update main totalAmount with tax
        booking.finalBill = {
            roomCharges: roomCharges,
            serviceCharges: serviceCharges,
            taxAmount: taxAmount,
            totalAmount: totalAmount,
            generatedAt: new Date()
        };
        await booking.save();

        // Update room status back to available
        await Room.findByIdAndUpdate(booking.room._id || booking.room, {
            status: 'available'
        });

        // Fetch updated booking with all details
        const updatedBooking = await Booking.findById(req.params.id)
            .populate('room', 'name type price')
            .populate('user', 'name email');

        res.status(200).json({
            success: true,
            message: 'Guest checked out successfully. Final bill generated.',
            data: updatedBooking,
            bill: {
                guestName: `${booking.guestDetails?.firstName || ''} ${booking.guestDetails?.lastName || ''}`.trim(),
                roomName: booking.room?.name || 'N/A',
                roomType: booking.room?.type || 'N/A',
                checkInDate: checkInDateObj,
                checkOutDate: checkOutDateObj,
                roomCharges: roomCharges,
                nightsStayed: nightsStayed,
                pricePerNight: roomPrice,
                services: services.map(s => ({
                    type: s.type,
                    description: s.description,
                    price: s.price || 0,
                    date: s.createdAt,
                    status: s.status
                })),
                serviceCharges: serviceCharges,
                totalAmount: totalAmount,
                paymentStatus: 'paid',
                bookingStatus: 'checked-out'
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get booking bill details
 * @route   GET /api/bookings/:id/bill
 * @access  Private
 */
export const getBookingBill = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('room', 'name type price')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Calculate nights accurately using calendar dates
        const checkInDateObj = new Date(booking.actualCheckInTime || booking.checkInDate);
        checkInDateObj.setHours(0, 0, 0, 0);
        const checkOutDateObj = new Date(booking.actualCheckOutTime || booking.checkOutDate || new Date());
        checkOutDateObj.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(checkOutDateObj - checkInDateObj);
        const nightsStayed = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const roomPrice = booking.room?.price || 0;
        const roomCharges = nightsStayed * roomPrice;

        // Get service requests
        let services = await ServiceRequest.find({ booking: booking._id });

        // Fallback: If no services found by ID, try user + room + current stay time
        if (services.length === 0) {
            services = await ServiceRequest.find({
                user: booking.user._id || booking.user,
                room: booking.room._id || booking.room,
                status: { $ne: 'cancelled' },
                createdAt: { $gte: booking.actualCheckInTime || booking.checkInDate }
            });
        }

        const billableServices = services.filter(s => ['confirmed', 'in_progress', 'completed'].includes(s.status));
        const serviceCharges = billableServices.reduce((total, service) => total + (service.price || 0), 0);
        const subtotal = roomCharges + serviceCharges;
        const taxAmount = Math.round(subtotal * 0.1);
        const totalAmount = subtotal + taxAmount;

        res.status(200).json({
            success: true,
            data: {
                bookingId: booking._id,
                guestName: `${booking.guestDetails?.firstName || ''} ${booking.guestDetails?.lastName || ''}`.trim(),
                roomName: booking.room?.name || 'N/A',
                roomType: booking.room?.type || 'N/A',
                checkInDate: checkInDateObj,
                checkOutDate: checkOutDateObj,
                actualCheckIn: booking.actualCheckInTime || booking.checkInDate,
                actualCheckOut: booking.actualCheckOutTime || booking.checkOutDate || new Date(),
                nightsStayed: nightsStayed,
                pricePerNight: roomPrice,
                roomCharges: roomCharges,
                services: services.map(s => ({
                    type: s.type,
                    description: s.description,
                    price: s.price || 0,
                    date: s.createdAt,
                    status: s.status
                })),
                serviceCharges: serviceCharges,
                subtotal: subtotal,
                taxAmount: taxAmount,
                totalAmount: totalAmount,
                paymentStatus: booking.paymentStatus,
                bookingStatus: booking.status,
                finalBill: booking.finalBill
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Process payment for a booking
 * @route   PUT /api/bookings/:id/payment
 * @access  Private (Admin/Staff)
 */
export const processPayment = async (req, res, next) => {
    try {
        const { paymentMethod = 'cash' } = req.body;

        const booking = await Booking.findById(req.params.id).populate('room');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Can only process payment for checked-in bookings
        if (booking.status !== 'checked-in') {
            return res.status(400).json({
                success: false,
                message: `Cannot process payment for booking with status: ${booking.status}. Guest must be checked-in first.`
            });
        }

        // Check if already paid
        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment has already been processed for this booking.'
            });
        }

        // Calculate total amount
        const checkInTime = booking.actualCheckInTime || booking.checkInDate;
        const checkOutTime = new Date();
        const nightsStayed = Math.max(1, Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)));
        const roomPrice = booking.room?.price || 0;
        const roomCharges = nightsStayed * roomPrice;

        // Get service charges
        let services = await ServiceRequest.find({ booking: booking._id });

        // Fallback: If no services found by ID, try user + room + current stay time
        if (services.length === 0) {
            services = await ServiceRequest.find({
                user: booking.user,
                room: booking.room._id || booking.room,
                status: { $ne: 'cancelled' },
                createdAt: { $gte: booking.actualCheckInTime || booking.checkInDate }
            });
        }

        const billableServices = services.filter(s => ['confirmed', 'in_progress', 'completed'].includes(s.status));
        const serviceCharges = billableServices.reduce((total, service) => total + (service.price || 0), 0);

        const subtotal = roomCharges + serviceCharges;
        const taxAmount = subtotal * 0.1;
        const totalAmount = subtotal + taxAmount;

        // Update booking payment status
        booking.paymentStatus = 'paid';
        booking.serviceCharges = serviceCharges;
        booking.taxAmount = taxAmount;
        booking.totalAmount = totalAmount;
        booking.paymentIntentId = req.body.paymentIntentId || booking.paymentIntentId;
        booking.paymentLast4 = req.body.paymentLast4 || booking.paymentLast4;
        await booking.save();

        // Create payment record
        await Payment.create({
            user: booking.user,
            booking: booking._id,
            amount: totalAmount,
            status: 'succeeded',
            paymentMethod: paymentMethod,
            stripePaymentIntentId: req.body.paymentIntentId || null
        });

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully. You can now proceed with checkout.',
            data: {
                bookingId: booking._id,
                paymentStatus: 'paid',
                subtotal: subtotal,
                taxAmount: taxAmount,
                totalAmount: totalAmount,
                roomCharges: roomCharges,
                serviceCharges: serviceCharges,
                nightsStayed: nightsStayed,
                paymentMethod: paymentMethod,
                services: services.map(s => ({
                    type: s.type,
                    description: s.description,
                    price: s.price || 0,
                    status: s.status
                }))
            }
        });
    } catch (err) {
        next(err);
    }
};
