import api from '../utils/api';

// Get all rooms with filters
export const getAllRooms = async (filters = {}) => {
  // Convert filters object to query string
  const params = new URLSearchParams();

  if (filters.type) params.append('type', filters.type);
  if (filters.branch) params.append('branch', filters.branch);
  if (filters.minPrice) params.append('price[gte]', filters.minPrice);
  if (filters.maxPrice) params.append('price[lte]', filters.maxPrice);
  // Support both key names
  if (filters.guests) params.append('maxOccupancy[gte]', filters.guests);
  if (filters.minOccupancy) params.append('maxOccupancy[gte]', filters.minOccupancy);

  if (filters.checkIn) params.append('checkIn', filters.checkIn);
  if (filters.checkOut) params.append('checkOut', filters.checkOut);

  const response = await api.get(`/rooms?${params.toString()}`);
  return response.data.data;
};

// Get single room by ID
export const getRoomById = async (id) => {
  const response = await api.get(`/rooms/${id}`);
  return response.data.data;
};

// Get available rooms (simplified)
export const getAvailableRooms = async (checkIn, checkOut) => {
  const response = await api.get('/rooms/available');
  return response.data.data;
};

// Create room (Admin)
export const createRoom = async (roomData) => {
  const response = await api.post('/rooms', roomData);
  return response.data.data;
};

// Update room (Admin)
export const updateRoom = async (id, roomData) => {
  const response = await api.put(`/rooms/${id}`, roomData);
  return response.data.data;
};

// Delete room (Admin)
export const deleteRoom = async (id) => {
  const response = await api.delete(`/rooms/${id}`);
  return response.data;
};
