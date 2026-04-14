import api from './axios.js';

// Get all jobs with filters
export const getJobs = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.search) params.append('search', filters.search);
        if (filters.location) params.append('location', filters.location);
        if (filters.type) params.append('type', filters.type);
        if (filters.experience) params.append('experience', filters.experience);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/jobs?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch jobs' };
    }
};

// Get single job by ID
export const getJobById = async (jobId) => {
    try {
        const response = await api.get(`/jobs/${jobId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch job' };
    }
};

// Create new job (Employer only)
export const createJob = async (jobData) => {
    try {
        const response = await api.post('/jobs', jobData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to create job' };
    }
};

// Update job (Employer who posted)
export const updateJob = async (jobId, jobData) => {
    try {
        const response = await api.put(`/jobs/${jobId}`, jobData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update job' };
    }
};

// Delete job (Employer who posted)
export const deleteJob = async (jobId) => {
    try {
        const response = await api.delete(`/jobs/${jobId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete job' };
    }
};

// Get my jobs (Employer only)
export const getMyJobs = async () => {
    try {
        const response = await api.get('/jobs/employer/my-jobs');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch your jobs' };
    }
};