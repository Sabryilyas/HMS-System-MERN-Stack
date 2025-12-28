import axios from 'axios';

// Create an axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Direct backend URL for now
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle global errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized (Token expired or invalid)
        if (error.response && error.response.status === 401) {
            // Only redirect if not already on login page to avoid loops
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
