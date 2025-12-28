import StaffTask from '../models/StaffTask.js';
import User from '../models/User.js';

/**
 * @desc    Create a new task for staff
 * @route   POST /api/staff/tasks
 * @access  Private (Admin/Manager)
 */
export const createTask = async (req, res, next) => {
    try {
        const { title, description, assignedTo, priority, dueDate } = req.body;

        const task = await StaffTask.create({
            title,
            description,
            assignedTo,
            assignedBy: req.user.id,
            priority,
            dueDate,
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
 * @desc    Get my tasks
 * @route   GET /api/staff/tasks/my
 * @access  Private (Staff)
 */
export const getMyTasks = async (req, res, next) => {
    try {
        const tasks = await StaffTask.find({ assignedTo: req.user.id })
            .populate('assignedBy', 'name')
            .sort('dueDate -createdAt');

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
 * @access  Private (Staff/Admin)
 */
export const updateTaskStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        let task = await StaffTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Verify ownership or admin
        if (task.assignedTo.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this task'
            });
        }

        task.status = status;
        if (status === 'completed') {
            task.completedAt = Date.now();
        }
        await task.save();

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all staff members
 * @route   GET /api/staff/members
 * @access  Private (Admin)
 */
export const getAllStaff = async (req, res, next) => {
    try {
        const staff = await User.find({
            role: { $in: ['receptionist', 'housekeeping', 'maintenance', 'manager'] }
        }).select('-password');

        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (err) {
        next(err);
    }
};
