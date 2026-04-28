import api from '../utils/api';

/**
 * Analytics Service
 * Fetches real-time chart data from MongoDB aggregations
 */

// Get monthly bookings chart data (last 6 months)
export const getBookingsChartData = async () => {
    const response = await api.get('/admin/analytics/bookings-chart');
    return response.data.data;
};

// Get monthly revenue chart data (last 6 months)
export const getRevenueChartData = async () => {
    const response = await api.get('/admin/analytics/revenue-chart');
    return response.data.data;
};

// Get room occupancy distribution
export const getOccupancyChartData = async () => {
    const response = await api.get('/admin/analytics/occupancy-chart');
    return response.data.data;
};

// Get most used services chart data
export const getServicesChartData = async () => {
    const response = await api.get('/admin/analytics/services-chart');
    return response.data.data;
};

// Get dashboard stats with period filter
export const getDashboardStats = async (period = 'month') => {
    const response = await api.get(`/admin/analytics/dashboard/${period}`);
    return response.data.data;
};
