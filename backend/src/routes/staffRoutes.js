import express from 'express';
import {
    getMyTasks,
    updateTaskStatus
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
// Allow only matching roles
router.use(authorize('staff', 'admin'));

router.get('/tasks', getMyTasks);
router.put('/tasks/:id', updateTaskStatus);

export default router;
