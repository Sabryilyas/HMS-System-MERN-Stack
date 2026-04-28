import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/User.js';

/**
 * @desc    Get my assigned tasks (Service Requests)
 * @route   GET /api/staff/tasks
 * @access  Private (Staff)
 */
export const getMyTasks = async (req, res, next) => {
    try {
        const tasks = await ServiceRequest.find({ assignedTo: req.user.id })
            .populate('user', 'name') // Guest info
            .populate('room', 'name')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update task status
 * @route   PUT /api/staff/tasks/:id
 * @access  Private (Staff)
 */
export const updateTaskStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        let task = await ServiceRequest.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Verify assignment
        if (task.assignedTo.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this task'
            });
        }

        task.status = status;
        await task.save();

        if (status === 'completed') {
            console.log(`[AUDIT] Task Completed: Task ${task._id} by Staff ${req.user.email} at ${new Date().toISOString()}`);
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all staff members (Admin)
 * @route   GET /api/admin/staff (This is handled by adminController now, but keeping for compatibility if routes point here)
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
