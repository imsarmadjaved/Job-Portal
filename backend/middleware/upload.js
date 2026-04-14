// backend/middleware/upload.js
import multer from 'multer';
import { resumeStorage, imageStorage, logoStorage } from '../config/cloudinary.js';

// File filter for resumes
const resumeFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'), false);
    }
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'), false);
    }
};

// Upload middlewares
export const uploadResume = multer({
    storage: resumeStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: resumeFileFilter
}).single('resume');

export const uploadProfileImage = multer({
    storage: imageStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: imageFileFilter
}).single('profileImage');

export const uploadCompanyLogo = multer({
    storage: logoStorage,
    limits: {
        fileSize: 1 * 1024 * 1024 // 1MB
    },
    fileFilter: imageFileFilter
}).single('logo');

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};