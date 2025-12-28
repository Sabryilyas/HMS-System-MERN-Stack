import Room from '../models/Room.js';
import StaffTask from '../models/StaffTask.js';

/**
 * @desc    Get rooms needing housekeeping
 * @route   GET /api/housekeeping/rooms
 * @access  Private (Housekeeping/Admin)
 */
export const getHousekeepingRooms = async (req, res, next) => {
    try {
        // Rooms that are occupied or need cleaning (status logic can be expanded)
        // For now, let's assume we want to see all rooms and their status
        const rooms = await Room.find().select('name type status floor');

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update room cleaning status
 * @route   PUT /api/housekeeping/rooms/:id/status
 * @access  Private (Housekeeping/Admin)
 */
export const updateRoomStatus = async (req, res, next) => {
    try {
        const { status } = req.body; // e.g., 'available', 'cleaning', 'maintenance'

        if (!['available', 'occupied', 'maintenance', 'cleaning'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get housekeeping tasks
 * @route   GET /api/housekeeping/tasks
 * @access  Private (Housekeeping)
 */
export const getHousekeepingTasks = async (req, res, next) => {
    try {
        // Get tasks assigned to current user or unassigned housekeeping tasks
        const tasks = await StaffTask.find({
            $or: [
                { assignedTo: req.user.id },
                { title: { $regex: 'clean', $options: 'i' } } // Simple regex for cleaning tasks
            ]
        }).sort('priority');

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (err) {
        next(err);
    }
};
