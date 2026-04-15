import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/user.js';
import Job from '../models/job.js';
import { cloudinary } from '../config/cloudinary.js';

console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass:', process.env.EMAIL_PASS ? 'Set' : 'Not Set');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use 'hotmail', 'yahoo', etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

// @desc    Forgot password - send reset link to email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        // For security, always return success even if user doesn't exist
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If your email is registered, you will receive a password reset link'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token and save to database (optional but more secure)
        // For simplicity, we'll store the plain token
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour from now
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Email HTML content
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Reset Your Password</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
                    <p style="font-size: 16px; color: #333;">You requested to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #667eea; 
                                  color: white; 
                                  padding: 12px 30px; 
                                  text-decoration: none; 
                                  border-radius: 5px;
                                  display: inline-block;
                                  font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Or copy this link to your browser:</p>
                    <p style="font-size: 14px; color: #667eea; word-break: break-all;">${resetUrl}</p>
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">This link will expire in <strong>1 hour</strong>.</p>
                    <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">JobPortal Team</p>
                </div>
            </div>
        `;

        // Send email
        await transporter.sendMail({
            from: `"JobPortal" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            html: emailHtml
        });

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email'
        });

    } catch (error) {
        console.error('Forgot password error:', error);

        // If email fails, clear the token
        if (error) {
            try {
                await User.findOneAndUpdate(
                    { email: req.body.email },
                    { $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } }
                );
            } catch (err) {
                console.error('Error clearing token:', err);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error sending reset email. Please try again later.'
        });
    }
};

// @desc    Verify reset token
// @route   GET /api/auth/verify-reset-token/:token
// @access  Public
export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid'
        });

    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying token'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide token and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Optional: Send confirmation email
        try {
            await transporter.sendMail({
                from: `"JobPortal" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Changed Successfully',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #4F46E5;">Password Changed</h2>
                        <p>Hello ${user.name},</p>
                        <p>Your password has been successfully changed.</p>
                        <p>If you did not make this change, please contact support immediately.</p>
                        <hr>
                        <p style="color: #666; font-size: 12px;">JobPortal Team</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.log('Could not send confirmation email:', emailError);
            // Don't fail the request if confirmation email fails
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successful! Please login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
};