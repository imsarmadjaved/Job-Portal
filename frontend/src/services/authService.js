import api from './axios.js';

// Register user
export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Registration failed' };
    }
};

// Login user
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        // If blocked, the backend returns 403
        if (error.response?.status === 403) {
            throw { message: 'Your account has been blocked. Please contact support.' };
        }
        throw error.response?.data || { message: 'Login failed' };
    }
};

// Get current user
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to get user' };
    }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
    try {
        const response = await api.put('/auth/update-profile', profileData);
        if (response.data.success && response.data.user) {
            // Update localStorage with new user data
            const storedUser = getStoredUser();
            const updatedUser = { ...storedUser, ...response.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update profile' };
    }
};

// Change password
export const changePassword = async (passwordData) => {
    try {
        const response = await api.put('/auth/change-password', passwordData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to change password' };
    }
};

// Logout user
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
};

// Get stored user
export const getStoredUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Get stored token
export const getStoredToken = () => {
    return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

// Save a job
export const saveJob = async (jobId) => {
    try {
        const response = await api.post(`/auth/save-job/${jobId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to save job' };
    }
};

// Unsave a job
export const unsaveJob = async (jobId) => {
    try {
        const response = await api.delete(`/auth/save-job/${jobId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to unsave job' };
    }
};

// Get saved jobs
export const getSavedJobs = async () => {
    try {
        const response = await api.get('/auth/saved-jobs');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch saved jobs' };
    }
};

// Upload resume
export const uploadResume = async (file) => {
    try {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await api.post('/auth/upload-resume', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.user) {
            const storedUser = getStoredUser();
            const updatedUser = { ...storedUser, ...response.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to upload resume' };
    }
};

// Delete resume
export const deleteResumeFile = async () => {
    try {
        const response = await api.delete('/auth/delete-resume');

        const storedUser = getStoredUser();
        if (storedUser) {
            const updatedUser = {
                ...storedUser,
                resume: null,
                resumeFileName: null,
                resumeUploadedAt: null
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete resume' };
    }
};

// Upload profile image
export const uploadProfileImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await api.post('/auth/upload-profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.user) {
            const storedUser = getStoredUser();
            const updatedUser = { ...storedUser, ...response.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to upload profile image' };
    }
};

// Get user role helpers
export const getUserRole = () => {
    const user = getStoredUser();
    return user?.role || null;
};

export const isAdmin = () => getUserRole() === 'admin';
export const isEmployer = () => getUserRole() === 'employer';
export const isJobSeeker = () => getUserRole() === 'job_seeker';

// Add this helper for blocked status check
export const isBlocked = () => {
    const user = getStoredUser();
    return user?.status === 'blocked';
};
