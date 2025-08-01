import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://localhost:3001/api',
    timeout: 5000,
});


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