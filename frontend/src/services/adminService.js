import api from './axios.js';

// Get admin stats
export const getAdminStats = async () => {
    try {
        const response = await api.get('/admin/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch stats' };
    }
};

// User management
export const getAdminUsers = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.role) params.append('role', filters.role);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/admin/users?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch users' };
    }
};

export const updateAdminUser = async (userId, userData) => {
    try {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update user' };
    }
};

export const deleteAdminUser = async (userId) => {
    try {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete user' };
    }
};

// Job management
export const getAdminJobs = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/admin/jobs?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch jobs' };
    }
};

export const updateAdminJobStatus = async (jobId, status) => {
    try {
        const response = await api.put(`/admin/jobs/${jobId}`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update job status' };
    }
};

export const deleteAdminJob = async (jobId) => {
    try {
        const response = await api.delete(`/admin/jobs/${jobId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete job' };
    }
};

// Company management
export const getAdminCompanies = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.verified) params.append('verified', filters.verified);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/admin/companies?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch companies' };
    }
};

export const verifyAdminCompany = async (companyId) => {
    try {
        const response = await api.put(`/admin/companies/${companyId}/verify`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to verify company' };
    }
};

export const unverifyAdminCompany = async (companyId) => {
    try {
        const response = await api.put(`/admin/companies/${companyId}/unverify`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to unverify company' };
    }
};

export const deleteAdminCompany = async (companyId) => {
    try {
        const response = await api.delete(`/admin/companies/${companyId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete company' };
    }
};

export const getAdminApplications = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/admin/applications?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch applications' };
    }
};

export const deleteAdminApplication = async (applicationId) => {
    try {
        const response = await api.delete(`/admin/applications/${applicationId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete application' };
    }
};

// Block user
export const blockUser = async (userId) => {
    try {
        const response = await api.put(`/admin/users/${userId}/block`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to block user' };
    }
};

// Unblock user
export const unblockUser = async (userId) => {
    try {
        const response = await api.put(`/admin/users/${userId}/unblock`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to unblock user' };
    }
};