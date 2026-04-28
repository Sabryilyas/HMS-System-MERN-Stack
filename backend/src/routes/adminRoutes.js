import express from 'express';
import {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getDashboardStats,
    getRevenueAnalytics,
    getAllStaff,
    createStaff,
    assignTask,
    getBookingsChartData,
    getRevenueChartData,
    getOccupancyChartData,
    getServicesChartData
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Staff Management
router.route('/staff')
    .get(getAllStaff)
    .post(createStaff);

router.post('/staff/assign-task', assignTask);

// Analytics
router.get('/analytics/dashboard/:period?', getDashboardStats);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/bookings-chart', getBookingsChartData);
router.get('/analytics/revenue-chart', getRevenueChartData);
router.get('/analytics/occupancy-chart', getOccupancyChartData);
router.get('/analytics/services-chart', getServicesChartData);

export default router;

