import axios from 'axios';

const api = axios.create({
    baseURL: '',  // Uses Vite proxy in development (see vite.config.js)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const loginUser = async (email, password) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    return response.data;
};

export const signupUser = async (userData) => {
    const response = await api.post('/api/v1/users/create', userData, {
        headers: {
            'Idempotency-Key': crypto.randomUUID(),
        },
    });
    return response.data;
};

export const verifyEmail = async (email, code) => {
    const response = await api.post('/api/v1/auth/signup/verify', { email, code });
    return response.data;
};

export const requestSignup = async (userData) => {
    const response = await api.post('/api/v1/auth/signup/request', userData);
    return response.data;
};

// User API
export const getUserProfile = async () => {
    const response = await api.get('/api/v1/users/me');
    return response.data;
};

export const checkUserExists = async (email) => {
    const response = await api.post('/api/v1/users/check-user', { email });
    return response.data;
};

// Sessions API
export const getMySessions = async () => {
    const response = await api.get('/api/v1/sessions/my-sessions');
    return response.data;
};

export const createSession = async (sessionData) => {
    const response = await api.post('/api/v1/sessions', sessionData);
    return response.data;
};

export const getCurrencies = async () => {
    const response = await api.get('/api/v1/currency/all');
    return response.data;
};

export const joinSession = async (joinCode) => {
    const response = await api.post('/api/v1/sessions/join', { joinCode });
    return response.data;
};

export const getSessionById = async (id) => {
    const response = await api.get(`/api/v1/sessions/${id}`);
    return response.data;
};

export const regenerateJoinCode = async (id) => {
    const response = await api.post(`/api/v1/sessions/${id}/regenerate-code`);
    return response.data;
};

export const confirmPayment = async (id) => {
    const response = await api.post(`/api/v1/sessions/${id}/confirm-payment`);
    return response.data;
};

export const completeSession = async (id) => {
    const response = await api.post(`/api/v1/sessions/${id}/complete`);
    return response.data;
};

// Deliverables API
export const createDeliverable = async (formData) => {
    const response = await api.post('/api/v1/deliverables', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getSessionDeliverables = async (sessionId) => {
    const response = await api.get(`/api/v1/deliverables/session/${sessionId}`);
    return response.data;
};

export const getDeliverableById = async (id) => {
    const response = await api.get(`/api/v1/deliverables/${id}`);
    return response.data;
};

export const updateDeliverable = async (id, data) => {
    const response = await api.patch(`/api/v1/deliverables/${id}`, data);
    return response.data;
};

export const deleteDeliverable = async (id) => {
    const response = await api.delete(`/api/v1/deliverables/${id}`);
    return response.data;
};

export const approveDeliverable = async (id) => {
    const response = await api.post(`/api/v1/deliverables/${id}/approve`);
    return response.data;
};

export const requestRevision = async (id, revisionNotes) => {
    const response = await api.post(`/api/v1/deliverables/${id}/request-revision`, { revisionNotes });
    return response.data;
};

export const disputeDeliverable = async (id, reason) => {
    const response = await api.post(`/api/v1/deliverables/${id}/dispute`, { reason });
    return response.data;
};

// Wallet & Transactions API
export const getWalletOverview = async (currency = 'USD') => {
    const response = await api.get('/api/v1/wallet/overview', { params: { currency } });
    return response.data;
};

export const getMyTransactions = async (params = {}) => {
    const response = await api.get('/api/v1/transaction/my', { params });
    return response.data;
};

export const generatePaymentLink = async (paymentData) => {
    console.log("generatePaymentLink PAYLOAD:", paymentData);
    try {
        const response = await api.post('/api/v1/wallet/payments/generate-link', paymentData);
        return response.data;
    } catch (error) {
        console.error("AXIOS error generating payment link:", error.response?.data || error);
        throw error;
    }
};

// Admin API
export const getDashboardOverview = async () => {
    const response = await api.get('/api/v1/dashboard/user-overview');
    return response.data;
};

export const getAllUsers = async () => {
    const response = await api.get('/api/v1/users/all');
    return response.data;
};

export const getAllSessions = async () => {
    const response = await api.get('/api/v1/sessions/all');
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/api/v1/admin/users/${userId}`);
    return response.data;
};

export const deleteSession = async (sessionId) => {
    const response = await api.delete(`/api/v1/admin/sessions/${sessionId}`);
    return response.data;
};

// Hold API
export const createHold = async (holdData) => {
    const response = await api.post('/api/v1/hold/create', holdData);
    return response.data;
};

export const getAllHolds = async () => {
    const response = await api.get('/api/v1/hold/all');
    return response.data;
};

export const getHoldById = async (id) => {
    const response = await api.get(`/api/v1/hold/${id}`);
    return response.data;
};

export const updateHold = async (id, data) => {
    const response = await api.patch(`/api/v1/hold/${id}`, data);
    return response.data;
};

export const deleteHold = async (id) => {
    const response = await api.delete(`/api/v1/hold/${id}`);
    return response.data;
};

// Fee API
export const createFee = async (feeData) => {
    const response = await api.post('/api/v1/fee/create', feeData);
    return response.data;
};

export const getAllFees = async () => {
    const response = await api.get('/api/v1/fee/all');
    return response.data;
};

export const getFeeById = async (id) => {
    const response = await api.get(`/api/v1/fee/${id}`);
    return response.data;
};

export const updateFee = async (id, data) => {
    const response = await api.patch(`/api/v1/fee/${id}`, data);
    return response.data;
};

export const deleteFee = async (id) => {
    const response = await api.delete(`/api/v1/fee/${id}`);
    return response.data;
};

// Token helpers
export const storeTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => localStorage.getItem('accessToken');

export default api;
