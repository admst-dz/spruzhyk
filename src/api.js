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

// ─── Core API objects ─────────────────────────────────────────────────────────

export const userApi = {
    syncUser: async (userData) => apiClient.post('/users/', userData),
    getUserProfile: async (userId) => apiClient.get(`/users/${userId}`),
};

export const orderApi = {
    createOrder: async (orderData) => apiClient.post('/orders/', orderData),
    getAllOrders: async (page = 1, size = 200) => apiClient.get(`/orders/all?page=${page}&size=${size}`),
    getUserOrders: async (userId) => apiClient.get(`/orders/user/${userId}`),
    updateStatus: async (orderId, status) => apiClient.patch(`/orders/${orderId}/status`, { status }),
    claimGuest: async (uid, email) => apiClient.post('/orders/claim', { uid, email }),
};

export const productApi = {
    getAll: async () => apiClient.get('/products/'),
    getByDealer: async (dealerId) => apiClient.get(`/products/?dealer_id=${dealerId}`),
    create: async (data) => apiClient.post('/products/', data),
    update: async (id, data) => apiClient.put(`/products/${id}`, data),
    delete: async (id) => apiClient.delete(`/products/${id}`),
};

// ─── User helpers ─────────────────────────────────────────────────────────────

export const getUserRole = async (uid) => {
    try {
        const { data } = await userApi.getUserProfile(uid);
        return { role: data.role || null, subRole: data.sub_role || null };
    } catch {
        return { role: null, subRole: null };
    }
};

export const checkUserExists = async (uid) => {
    try {
        const { data } = await userApi.getUserProfile(uid);
        return { exists: true, role: data.role || null, data: { subRole: data.sub_role || null } };
    } catch (err) {
        if (err.response?.status === 404) {
            return { exists: false, role: null, data: null };
        }
        throw err;
    }
};

export const createUserProfile = async (user, role, subRole = null) => {
    return await userApi.syncUser({
        uid: user.uid,
        email: user.email,
        display_name: user.displayName || '',
        role,
        sub_role: subRole,
    });
};

export const claimGuestOrders = async (uid, email) => {
    try {
        await orderApi.claimGuest(uid, email);
    } catch {
        // non-critical
    }
};

// ─── Order helpers ────────────────────────────────────────────────────────────

const normalizeOrder = (o) => ({
    id: String(o.id),
    product: o.product_name || '',
    design: o.configuration?.productConfig?.coverColor || '',
    price: o.total_price || 0,
    status: o.status || 'new',
    date: o.created_at ? new Date(o.created_at).toLocaleDateString('ru-RU') : '',
    userEmail: o.user_email || '',
    role: o.configuration?.clientType || '',
    createdAt: o.created_at ? { seconds: new Date(o.created_at).getTime() / 1000 } : null,
});

export const createOrderInDB = async (orderData) => {
    const { data } = await orderApi.createOrder(orderData);
    return String(data?.id || data);
};

export const fetchUserOrders = async (uid) => {
    const { data } = await orderApi.getUserOrders(uid);
    return (data || []).map(normalizeOrder);
};

export const fetchAllOrders = async () => {
    const { data } = await orderApi.getAllOrders();
    const list = data?.items || data || [];
    return list.map(normalizeOrder);
};

export const updateOrderStatus = async (orderId, status) => {
    return await orderApi.updateStatus(orderId, status);
};

// ─── Product helpers ──────────────────────────────────────────────────────────

export const fetchAllProducts = async () => {
    const { data } = await productApi.getAll();
    return data || [];
};

export const fetchDealerProducts = async (dealerId) => {
    const { data } = await productApi.getByDealer(dealerId);
    return data || [];
};

export const saveProduct = async (productData) => {
    const { data } = await productApi.create(productData);
    return data;
};

export const updateProduct = async (id, productData) => {
    const { data } = await productApi.update(id, productData);
    return data;
};

export const deleteProduct = async (id) => {
    await productApi.delete(id);
};

export default apiClient;
