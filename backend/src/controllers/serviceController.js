import ServiceRequest from '../models/ServiceRequest.js';
import Booking from '../models/Booking.js';

/**
 * @desc    Create a new service request
 * @route   POST /api/services
 * @access  Private
 */
export const createServiceRequest = async (req, res, next) => {
    try {
        const { type, description, priority } = req.body;

        // Find active booking for user
        const booking = await Booking.findOne({
            user: req.user.id,
            status: { $in: ['checked-in', 'confirmed'] }
        });

        if (!booking) {
            return res.status(400).json({
                success: false,
                message: 'You must have an active booking to request services'
            });
        }

        const serviceRequest = await ServiceRequest.create({
            user: req.user.id,
            room: booking.room,
            booking: booking._id,
            type,
            description,
            priority: priority || 'medium',
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: serviceRequest
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get my service requests
 * @route   GET /api/services/my
 * @access  Private
 */
export const getMyServiceRequests = async (req, res, next) => {
    try {
        const requests = await ServiceRequest.find({ user: req.user.id })
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all service requests (Staff/Admin)
 * @route   GET /api/services
 * @access  Private (Staff/Admin)
 */
export const getAllServiceRequests = async (req, res, next) => {
    try {
        const requests = await ServiceRequest.find()
            .populate('user', 'name email')
            .populate('room', 'name')
            .populate('assignedTo', 'name')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update service request status
 * @route   PUT /api/services/:id
 * @access  Private (Staff/Admin)
 */
export const updateServiceRequest = async (req, res, next) => {
    try {
        let request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        request = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (err) {
        next(err);
    }
};
