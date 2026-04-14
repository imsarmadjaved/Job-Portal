import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Job from '../models/job.js';
import { cloudinary } from '../config/cloudinary.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role, companyName } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'job_seeker',
            companyName: role === 'employer' ? companyName : null
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || "",
                location: user.location || "",
                headline: user.headline || "",
                bio: user.bio || "",
                skills: user.skills || [],
                experience: user.experience || [],
                education: user.education || [],
                resume: user.resume || "",
                companyName: user.companyName || null,
                profileImage: user.profileImage || null,
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is blocked
        if (user.status === 'blocked') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked. Please contact support.'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                phone: user.phone || "",
                location: user.location || "",
                headline: user.headline || "",
                bio: user.bio || "",
                skills: user.skills || [],
                experience: user.experience || [],
                education: user.education || [],
                resume: user.resume || "",
                companyName: user.companyName || null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || "",
                location: user.location || "",
                headline: user.headline || "",
                bio: user.bio || "",
                skills: user.skills || [],
                experience: user.experience || [],
                education: user.education || [],
                resume: user.resume || "",
                resumeFileName: user.resumeFileName || null,
                profileImage: user.profileImage || null, // Make sure this is included!
                companyName: user.companyName || null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user profile (for job seekers)
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, location, headline, bio, skills, experience, education } = req.body;

        // Check if email already exists (if changing email)
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: name || req.user.name,
                email: email || req.user.email,
                phone: phone || req.user.phone,
                location: location || req.user.location,
                headline: headline || req.user.headline,
                bio: bio || req.user.bio,
                skills: skills || req.user.skills,
                experience: experience || req.user.experience,
                education: education || req.user.education,
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Check new password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Save a job
// @route   POST /api/auth/save-job/:jobId
// @access  Private
export const saveJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if already saved
        const user = await User.findById(req.user.id);
        if (user.savedJobs.includes(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Job already saved'
            });
        }

        // Add to saved jobs
        await User.findByIdAndUpdate(req.user.id, {
            $push: { savedJobs: jobId }
        });

        res.json({
            success: true,
            message: 'Job saved successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Unsave a job
// @route   DELETE /api/auth/save-job/:jobId
// @access  Private
export const unsaveJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Remove from saved jobs
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { savedJobs: jobId }
        });

        res.json({
            success: true,
            message: 'Job removed from saved'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get saved jobs
// @route   GET /api/auth/saved-jobs
// @access  Private
export const getSavedJobs = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('savedJobs');

        res.json({
            success: true,
            savedJobs: user.savedJobs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Upload resume
// @route   POST /api/auth/upload-resume
// @access  Private
export const uploadResumeFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const user = await User.findById(req.user.id);

        if (user.resumePublicId) {
            try {
                await cloudinary.uploader.destroy(user.resumePublicId, {
                    resource_type: 'raw'
                });
            } catch (error) {
                console.log('Error deleting old resume:', error);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                resume: req.file.path,
                resumePublicId: req.file.filename,
                resumeFileName: req.file.originalname,
                resumeUploadedAt: new Date()
            },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Resume uploaded successfully',
            resume: {
                url: req.file.path,
                fileName: req.file.originalname,
                uploadedAt: new Date()
            },
            user: updatedUser
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload resume'
        });
    }
};

// @desc    Delete resume
// @route   DELETE /api/auth/delete-resume
// @access  Private
export const deleteResume = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.resumePublicId) {
            return res.status(400).json({
                success: false,
                message: 'No resume to delete'
            });
        }

        try {
            await cloudinary.uploader.destroy(user.resumePublicId, {
                resource_type: 'raw'
            });
        } catch (error) {
            console.log('Cloudinary delete error:', error);
        }

        user.resume = null;
        user.resumePublicId = null;
        user.resumeFileName = null;
        user.resumeUploadedAt = null;
        await user.save();

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error('Resume deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete resume'
        });
    }
};

// @desc    Upload profile image
// @route   POST /api/auth/upload-profile-image
// @access  Private
export const uploadProfileImageFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        const user = await User.findById(req.user.id);

        if (user.profileImagePublicId) {
            try {
                await cloudinary.uploader.destroy(user.profileImagePublicId);
            } catch (error) {
                console.log('Error deleting old profile image:', error);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                profileImage: req.file.path,
                profileImagePublicId: req.file.filename
            },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile image uploaded successfully',
            profileImage: req.file.path,
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile image'
        });
    }
};