import api from '../utils/api';

// Register user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Login user
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data;
  } catch (error) {
    return null;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  // Optional: Call backend logout endpoint if needed
  // api.get('/auth/logout');
};