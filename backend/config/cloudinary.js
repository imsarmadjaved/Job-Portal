// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Resume storage configuration
const resumeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'job-portal/resumes',
        allowed_formats: ['pdf', 'doc', 'docx'],
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true
    }
});

// Profile image storage configuration
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'job-portal/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' }
        ],
        resource_type: 'image'
    }
});

// Company logo storage
const logoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'job-portal/logos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'svg'],
        transformation: [
            { width: 200, height: 200, crop: 'fit' },
            { quality: 'auto' }
        ],
        resource_type: 'image'
    }
});

export { cloudinary, resumeStorage, imageStorage, logoStorage };