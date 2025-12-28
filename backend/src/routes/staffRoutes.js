import express from 'express';
import {
    createTask,
    getMyTasks,
    updateTaskStatus,
    getAllStaff
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Task routes
router.get('/tasks/my', getMyTasks);
router.put('/tasks/:id', updateTaskStatus);

// Admin/Manager routes
router.post('/tasks', authorize('admin', 'manager'), createTask);
router.get('/members', authorize('admin', 'manager'), getAllStaff);

export default router;
