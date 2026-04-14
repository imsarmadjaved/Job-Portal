import api from './axios.js';

// Get employer analytics data
export const getEmployerAnalytics = async () => {
    try {
        const response = await api.get('/analytics/employer');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch analytics' };
    }
};

// Get job-specific analytics
export const getJobAnalytics = async (jobId) => {
    try {
        const response = await api.get(`/analytics/job/${jobId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch job analytics' };
    }
};