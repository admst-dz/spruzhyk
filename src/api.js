import axios from 'axios';
import { auth } from './firebase';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));



export const userApi = {
    syncUser: async (userData) => {
        return await apiClient.post('/users/', userData);
    },
    getUserProfile: async (userId) => {
        return await apiClient.get(`/users/${userId}`);
    }
};

export const orderApi = {
    createOrder: async (orderData) => {
        return await apiClient.post('/orders/', orderData);
    },
    getAllOrders: async (page = 1, size = 50) => {
        return await apiClient.get(`/orders/all?page=${page}&size=${size}`);
    },
    getUserOrders: async (userId) => {
        return await apiClient.get(`/orders/user/${userId}`);
    }
};



export default apiClient;