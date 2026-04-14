import express from 'express';
import {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
    deleteApplication
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Job Seeker routes
router.post('/', protect, authorize('job_seeker'), applyForJob);
router.get('/my-applications', protect, authorize('job_seeker'), getMyApplications);

// Employer routes
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getJobApplications);
router.put('/:id', protect, authorize('employer', 'admin'), updateApplicationStatus);

// Admin only route
router.delete('/:id', protect, authorize('admin'), deleteApplication);

export default router;