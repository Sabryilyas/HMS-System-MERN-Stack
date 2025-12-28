import Notification from '../models/Notification.js';

/**
 * @desc    Get my notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort('-createdAt')
            .limit(50); // Limit to last 50

        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Verify ownership
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Mark ALL as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (err) {
        next(err);
    }
};

// Helper to create notification (internal use)
export const createNotification = async (recipientId, title, message, type = 'info', link = null) => {
    try {
        await Notification.create({
            recipient: recipientId,
            title,
            message,
            type,
            link
        });
    } catch (err) {
        console.error('Failed to create notification:', err);
    }
};
