// backend/routes/jobRoutes.js
import express from 'express';
import {
    createJob,
    getJobs,
    getJob,
    updateJob,
    deleteJob,
    getMyJobs
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Employer routes (protected)
router.get('/employer/my-jobs', protect, authorize('employer', 'admin'), getMyJobs);
router.post('/', protect, authorize('employer', 'admin'), createJob);
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

export default router;