import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized (token expired)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth';
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            const message = error.response?.data?.message || 'You do not have permission to perform this action';
            console.error(message);
            // If it's a blocked user message, redirect to login
            if (message.includes('blocked')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth?blocked=true';
            }
        }

        // Handle 500 Server Error
        if (error.response?.status === 500) {
            console.error('Server error. Please try again later.');
        }

        return Promise.reject(error);
    }
);

export default api;