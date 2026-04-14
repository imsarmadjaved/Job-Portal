import express from 'express';
import { getEmployerAnalytics, getJobAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All analytics routes require authentication and employer role
router.use(protect, authorize('employer'));

router.get('/employer', getEmployerAnalytics);
router.get('/job/:jobId', getJobAnalytics);

export default router;