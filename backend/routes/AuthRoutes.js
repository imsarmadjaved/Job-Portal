import express from 'express';
import {
    register,
    login,
    getMe,
    updateProfile,
    getProfile,
    changePassword,
    saveJob,
    unsaveJob,
    getSavedJobs,
    uploadResumeFile,
    deleteResume,
    uploadProfileImageFile,
    forgotPassword,
    verifyResetToken,
    resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResume, uploadProfileImage, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/save-job/:jobId', protect, saveJob);
router.delete('/save-job/:jobId', protect, unsaveJob);
router.get('/saved-jobs', protect, getSavedJobs);

// File upload routes
router.post('/upload-resume', protect, uploadResume, handleMulterError, uploadResumeFile);
router.delete('/delete-resume', protect, deleteResume);
router.post('/upload-profile-image', protect, uploadProfileImage, handleMulterError, uploadProfileImageFile);

// password reset
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

export default router;