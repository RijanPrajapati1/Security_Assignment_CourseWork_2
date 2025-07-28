// src/utils/axios.js

import axios from 'axios';

const axiosInstance = axios.create({
    // FIX: Change the baseURL to just the domain and port
    baseURL: 'http://localhost:3001/api',
    timeout: 5000,
});

// Add a "request interceptor"
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;