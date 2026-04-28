import api from '../utils/api';

export const getMyNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        throw error;
    }
};

export const markAsRead = async (id) => {
    try {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw error;
    }
};

export const markAllAsRead = async () => {
    try {
        const response = await api.put('/notifications/read-all');
        return response.data;
    } catch (error) {
        console.error('Failed to mark all as read:', error);
        throw error;
    }
};
