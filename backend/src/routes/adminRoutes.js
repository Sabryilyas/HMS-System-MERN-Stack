import express from 'express';
import {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getDashboardStats,
    getRevenueAnalytics
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

// Analytics
router.get('/analytics/dashboard', getDashboardStats);
router.get('/analytics/revenue', getRevenueAnalytics);

export default router;
