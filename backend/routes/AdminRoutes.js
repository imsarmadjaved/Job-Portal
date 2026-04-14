// backend/routes/adminRoutes.js
import express from 'express';
import {
    getStats,
    getUsers,
    updateUser,
    deleteUser,
    getJobs,
    updateJobStatus,
    deleteJob,
    getCompanies,
    verifyCompany,
    unverifyCompany,
    deleteCompany,
    getApplications,
    deleteApplication,
    blockUser,
    unblockUser
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', getStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);

// Job management
router.get('/jobs', getJobs);
router.put('/jobs/:id', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

// Company management
router.get('/companies', getCompanies);
router.put('/companies/:id/verify', verifyCompany);
router.put('/companies/:id/unverify', unverifyCompany);
router.delete('/companies/:id', deleteCompany);

// Application management
router.get('/applications', getApplications);
router.delete('/applications/:id', deleteApplication);

export default router;