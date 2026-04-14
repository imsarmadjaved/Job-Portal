import api from './axios.js';

// Apply for a job (Job Seeker only)
export const applyForJob = async (applicationData) => {
    try {
        const response = await api.post('/applications', applicationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to submit application' };
    }
};

// Get my applications (Job Seeker only)
export const getMyApplications = async () => {
    try {
        const response = await api.get('/applications/my-applications');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch applications' };
    }
};

// Get applications for a job (Employer only)
export const getJobApplications = async (jobId, status = null) => {
    try {
        let url = `/applications/job/${jobId}`;
        if (status) {
            url += `?status=${status}`;
        }
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch applications' };
    }
};

// Update application status (Employer only)
export const updateApplicationStatus = async (applicationId, statusData) => {
    try {
        const response = await api.put(`/applications/${applicationId}`, statusData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update application' };
    }
};