import api from '../utils/api';

// Create a new booking
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data.data;
};

// Get current user's bookings
export const getMyBookings = async () => {
  const response = await api.get('/bookings/my');
  return response.data.data;
};

// Get single booking by ID
export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data.data;
};

// Cancel booking
export const cancelBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

// Get all bookings (Admin)
export const getAllBookings = async () => {
  const response = await api.get('/bookings');
  return response.data.data;
};

// Update booking status (Admin)
export const updateBookingStatus = async (id, status) => {
  const response = await api.put(`/bookings/${id}`, { status });
  return response.data.data;
};

// Check-in guest (Admin/Staff)
export const checkInBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/checkin`);
  return response.data;
};

// Check-out guest (Admin/Staff)
export const checkOutBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/checkout`);
  return response.data;
};

// Get booking bill details
export const getBookingBill = async (id) => {
  const response = await api.get(`/bookings/${id}/bill`);
  return response.data.data;
};

// Process payment for booking (Admin/Staff)
export const processPayment = async (id, paymentMethod = 'cash') => {
  const response = await api.put(`/bookings/${id}/payment`, { paymentMethod });
  return response.data;
};
