import api from './axios.js';

// Get all companies
export const getCompanies = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.search) params.append('search', filters.search);
        if (filters.industry) params.append('industry', filters.industry);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/companies?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch companies' };
    }
};

// Get single company by ID
export const getCompanyById = async (companyId) => {
    try {
        const response = await api.get(`/companies/${companyId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch company' };
    }
};

// Create company profile (Employer only)
export const createCompany = async (companyData) => {
    try {
        const response = await api.post('/companies', companyData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to create company' };
    }
};

// Get my company (Employer only)
export const getMyCompany = async () => {
    try {
        const response = await api.get('/companies/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch company' };
    }
};

// Update my company (Employer only)
export const updateMyCompany = async (companyData) => {
    try {
        const response = await api.put('/companies/me', companyData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update company' };
    }
};

// Upload company logo
export const uploadCompanyLogo = async (file) => {
    try {
        const formData = new FormData();
        formData.append('logo', file);

        const response = await api.post('/companies/upload-logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to upload logo' };
    }
};