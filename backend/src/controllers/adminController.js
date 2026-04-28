import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Payment from '../models/Payment.js';
import ServiceRequest from '../models/ServiceRequest.js';

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
 * @desc    Get Dashboard Stats with Period Filter
 * @route   GET /api/admin/analytics/dashboard/:period
 * @access  Private (Admin)
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const period = req.params.period || 'month'; // Default to month

        // Calculate date range based on period
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // 1. Get counts (filtered by period)
        const totalUsers = await User.countDocuments();
        const totalRooms = await Room.countDocuments();

        // Filter bookings by period
        const periodBookings = await Booking.find({
            createdAt: { $gte: startDate }
        });

        const totalBookings = periodBookings.length;
        const confirmedBookings = periodBookings.filter(b => b.status === 'confirmed').length;
        const pendingBookings = periodBookings.filter(b => b.status === 'pending').length;
        const cancelledBookings = periodBookings.filter(b => b.status === 'cancelled').length;

        // 2. Calculate Revenue (Sum of paid bookings in period)
        const revenueResult = await Payment.aggregate([
            {
                $match: {
                    status: 'succeeded',
                    createdAt: { $gte: startDate }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // 3. Get recent bookings (from period)
        const recentBookings = await Booking.find({
            createdAt: { $gte: startDate }
        })
            .sort('-createdAt')
            .limit(10)
            .populate('user', 'name email')
            .populate('room', 'name branch');

        // 4. Calculate Occupancy Rate
        const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        // 5. Get pending service requests count
        const pendingServices = await ServiceRequest.countDocuments({ status: 'pending' });

        res.status(200).json({
            success: true,
            period,
            data: {
                totalUsers,
                totalRooms,
                totalBookings,
                confirmedBookings,
                pendingBookings,
                cancelledBookings,
                totalRevenue,
                occupancyRate,
                recentBookings,
                pendingServices
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

/**
 * @desc    Get all staff members
 * @route   GET /api/admin/staff
 * @access  Private (Admin)
 */
export const getAllStaff = async (req, res, next) => {
    try {
        const staff = await User.find({ role: 'staff' }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create new staff member
 * @route   POST /api/admin/staff
 * @access  Private (Admin)
 */
export const createStaff = async (req, res, next) => {
    try {
        const { name, email, password, phone, address, hotelId, taskType } = req.body;

        // Check availability
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            address,
            role: 'staff',
            hotelId,
            taskType,
            isActive: true
        });

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Assign task to staff
 * @route   POST /api/admin/staff/assign-task
 * @access  Private (Admin)
 */
export const assignTask = async (req, res, next) => {
    try {
        const { staffId, description, type, priority } = req.body;

        const task = await ServiceRequest.create({
            assignedTo: staffId,
            description,
            type: type || 'other',
            priority: priority || 'medium',
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get monthly bookings chart data (last 6 months)
 * @route   GET /api/admin/analytics/bookings-chart
 * @access  Private (Admin)
 */
export const getBookingsChartData = async (req, res, next) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const bookingsData = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    confirmed: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    checkedIn: {
                        $sum: { $cond: [{ $eq: ['$status', 'checked-in'] }, 1, 0] }
                    },
                    checkedOut: {
                        $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format the data for the chart
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedData = bookingsData.map(item => ({
            name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            month: item._id.month,
            year: item._id.year,
            total: item.count,
            confirmed: item.confirmed,
            checkedIn: item.checkedIn,
            checkedOut: item.checkedOut,
            cancelled: item.cancelled
        }));

        res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get monthly revenue chart data (last 6 months)
 * @route   GET /api/admin/analytics/revenue-chart
 * @access  Private (Admin)
 */
export const getRevenueChartData = async (req, res, next) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Get revenue from successful payments
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
                    revenue: { $sum: '$amount' },
                    transactions: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Also get revenue from checked-out bookings with final bills
        const bookingRevenueData = await Booking.aggregate([
            {
                $match: {
                    status: 'checked-out',
                    'finalBill.generatedAt': { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$finalBill.generatedAt' },
                        year: { $year: '$finalBill.generatedAt' }
                    },
                    revenue: { $sum: '$finalBill.totalAmount' },
                    roomRevenue: { $sum: '$finalBill.roomCharges' },
                    serviceRevenue: { $sum: '$finalBill.serviceCharges' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format the data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Merge payment and booking revenue data
        const combinedData = {};

        revenueData.forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;
            combinedData[key] = {
                name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
                month: item._id.month,
                year: item._id.year,
                revenue: item.revenue,
                transactions: item.transactions,
                roomRevenue: 0,
                serviceRevenue: 0
            };
        });

        bookingRevenueData.forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;
            if (combinedData[key]) {
                combinedData[key].roomRevenue = item.roomRevenue;
                combinedData[key].serviceRevenue = item.serviceRevenue;
            } else {
                combinedData[key] = {
                    name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
                    month: item._id.month,
                    year: item._id.year,
                    revenue: item.revenue,
                    transactions: 0,
                    roomRevenue: item.roomRevenue,
                    serviceRevenue: item.serviceRevenue
                };
            }
        });

        const formattedData = Object.values(combinedData).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });

        res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get room occupancy distribution
 * @route   GET /api/admin/analytics/occupancy-chart
 * @access  Private (Admin)
 */
export const getOccupancyChartData = async (req, res, next) => {
    try {
        const occupancyData = await Room.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format for pie chart
        const statusColors = {
            'available': '#22c55e',
            'occupied': '#f59e0b',
            'maintenance': '#ef4444',
            'reserved': '#3b82f6'
        };

        const formattedData = occupancyData.map(item => ({
            name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            value: item.count,
            color: statusColors[item._id] || '#6b7280'
        }));

        // Also get distribution by room type
        const typeDistribution = await Room.aggregate([
            {
                $group: {
                    _id: '$type',
                    total: { $sum: 1 },
                    available: {
                        $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
                    },
                    occupied: {
                        $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                statusDistribution: formattedData,
                typeDistribution: typeDistribution.map(item => ({
                    type: item._id,
                    total: item.total,
                    available: item.available,
                    occupied: item.occupied,
                    occupancyRate: item.total > 0 ? Math.round((item.occupied / item.total) * 100) : 0
                }))
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get most used services chart data
 * @route   GET /api/admin/analytics/services-chart
 * @access  Private (Admin)
 */
export const getServicesChartData = async (req, res, next) => {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const servicesData = await ServiceRequest.aggregate([
            {
                $match: {
                    createdAt: { $gte: threeMonthsAgo }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$price' },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Format service types for display
        const serviceLabels = {
            'food': 'Food & Dining',
            'laundry': 'Laundry',
            'cleaning': 'Room Cleaning',
            'room_service': 'Room Service',
            'housekeeping': 'Housekeeping',
            'maintenance': 'Maintenance',
            'amenities': 'Amenities',
            'other': 'Other'
        };

        const formattedData = servicesData.map(item => ({
            name: serviceLabels[item._id] || item._id,
            type: item._id,
            requests: item.count,
            revenue: item.totalRevenue,
            completed: item.completed,
            pending: item.pending
        }));

        res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (err) {
        next(err);
    }
};
