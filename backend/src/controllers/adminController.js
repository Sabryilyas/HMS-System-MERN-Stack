import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Payment from '../models/Payment.js';

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin)
 */
export const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['guest', 'receptionist', 'housekeeping', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting self
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete yourself'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get Dashboard Stats
 * @route   GET /api/admin/analytics/dashboard
 * @access  Private (Admin)
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        // 1. Get counts
        const totalUsers = await User.countDocuments();
        const totalRooms = await Room.countDocuments();
        const totalBookings = await Booking.countDocuments();

        // 2. Calculate Revenue (Sum of paid bookings)
        const revenueResult = await Payment.aggregate([
            { $match: { status: 'succeeded' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // 3. Get recent bookings
        const recentBookings = await Booking.find()
            .sort('-createdAt')
            .limit(5)
            .populate('user', 'name email')
            .populate('room', 'name');

        // 4. Calculate Occupancy Rate
        const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalRooms,
                totalBookings,
                totalRevenue,
                occupancyRate,
                recentBookings
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get Revenue Analytics (Monthly)
 * @route   GET /api/admin/analytics/revenue
 * @access  Private (Admin)
 */
export const getRevenueAnalytics = async (req, res, next) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const revenueData = await Payment.aggregate([
            {
                $match: {
                    status: 'succeeded',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: revenueData
        });
    } catch (err) {
        next(err);
    }
};
