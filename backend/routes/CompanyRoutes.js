// backend/routes/companyRoutes.js
import express from 'express';
import {
    createCompany,
    getMyCompany,
    getCompanies,
    getCompany,
    updateCompany,
    deleteCompany,
    uploadCompanyLogo
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadCompanyLogo as uploadLogoMiddleware, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// PUBLIC ROUTES 
router.get('/', getCompanies);

// PROTECTED ROUTES (authentication required)
router.post('/upload-logo', protect, authorize('employer', 'admin'), uploadLogoMiddleware, handleMulterError, uploadCompanyLogo);
router.get('/me', protect, authorize('employer', 'admin'), getMyCompany);
router.put('/me', protect, authorize('employer', 'admin'), updateCompany);
router.post('/', protect, authorize('employer', 'admin'), createCompany);

// ADMIN ONLY ROUTES
router.delete('/:id', protect, authorize('admin'), deleteCompany);

// PUBLIC ROUTES WITH PARAMETERS
router.get('/:id', getCompany);

export default router;