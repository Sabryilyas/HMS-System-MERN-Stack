import express from 'express';
import {
    createServiceRequest,
    getMyServiceRequests,
    getAllServiceRequests,
    updateServiceRequest
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Guest routes
router.post('/', createServiceRequest);
router.get('/my', getMyServiceRequests);

// Staff/Admin routes
router.get('/', authorize('admin', 'receptionist', 'housekeeping', 'maintenance'), getAllServiceRequests);
router.put('/:id', authorize('admin', 'receptionist', 'housekeeping', 'maintenance'), updateServiceRequest);

export default router;
