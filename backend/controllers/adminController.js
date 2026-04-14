import User from '../models/user.js';
import Job from '../models/job.js';
import Company from '../models/company.js';
import Application from '../models/applications.js';
import { cloudinary } from '../config/cloudinary.js';
import TokenBlacklist from '../models/tokenBlacklist.js';
import jwt from 'jsonwebtoken';

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getStats = async (req, res) => {
    try {
        // User stats
        const totalUsers = await User.countDocuments();
        const totalJobSeekers = await User.countDocuments({ role: 'job_seeker' });
        const totalEmployers = await User.countDocuments({ role: 'employer' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        // Job stats
        const totalJobs = await Job.countDocuments();
        const activeJobs = await Job.countDocuments({ status: 'active' });
        const pendingJobs = await Job.countDocuments({ status: 'pending' });
        const closedJobs = await Job.countDocuments({ status: 'closed' });

        // Application stats
        const totalApplications = await Application.countDocuments();
        const pendingApplications = await Application.countDocuments({ status: 'pending' });
        const reviewedApplications = await Application.countDocuments({ status: 'reviewed' });
        const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });
        const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
        const acceptedApplications = await Application.countDocuments({ status: 'accepted' });

        // Company stats
        const totalCompanies = await Company.countDocuments();
        const verifiedCompanies = await Company.countDocuments({ verified: true });

        // Recent users (last 5)
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('-password');

        // Recent jobs (last 5)
        const recentJobs = await Job.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('postedBy', 'name email');

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalJobSeekers,
                totalEmployers,
                totalAdmins,
                totalJobs,
                activeJobs,
                pendingJobs,
                closedJobs,
                totalApplications,
                pendingApplications,
                reviewedApplications,
                shortlistedApplications,
                rejectedApplications,
                acceptedApplications,
                totalCompanies,
                verifiedCompanies,
            },
            recentUsers,
            recentJobs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (role && role !== 'all') {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-password');

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user (role, etc.)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
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

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Don't allow deleting the last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete the last admin user'
                });
            }
        }

        // Get the token from the request
        const token = req.headers.authorization?.split(' ')[1];

        // Blacklist the deleted user's token (if it's not the admin's own token)
        if (token && user._id.toString() !== req.user.id) {
            try {
                const decoded = jwt.decode(token);
                if (decoded) {
                    await TokenBlacklist.create({
                        token: token,
                        userId: user._id,
                        expiresAt: new Date(decoded.exp * 1000)
                    });
                }
            } catch (error) {
                console.log('Error blacklisting token:', error);
            }
        }

        // If user is an employer, delete their company
        if (user.role === 'employer') {

            const company = await Company.findOne({ user: user._id });

            if (company) {
                // Delete company logo from Cloudinary
                if (company.logoPublicId) {
                    try {
                        await cloudinary.uploader.destroy(company.logoPublicId);
                    } catch (error) {
                        console.log('Error deleting company logo:', error);
                    }
                }



                // Get all jobs before deleting them
                const jobs = await Job.find({ postedBy: user._id });
                const jobIds = jobs.map(job => job._id);

                if (jobIds.length > 0) {
                    await Application.deleteMany({ job: { $in: jobIds } });
                }

                // Delete all jobs posted by this company
                await Job.deleteMany({ postedBy: user._id });

                // Delete the company
                await company.deleteOne();
            }
        }

        // If user is a job seeker, delete their applications
        if (user.role === 'job_seeker') {

            await Application.deleteMany({ applicant: user._id });
        }

        // Delete user's profile image from Cloudinary
        if (user.profileImagePublicId) {
            try {
                await cloudinary.uploader.destroy(user.profileImagePublicId);
            } catch (error) {
                console.log('Error deleting profile image:', error);
            }
        }

        // Delete user's resume from Cloudinary
        if (user.resumePublicId) {
            try {
                await cloudinary.uploader.destroy(user.resumePublicId, {
                    resource_type: 'raw'
                });
            } catch (error) {
                console.log('Error deleting resume:', error);
            }
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User and all associated data deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all jobs (admin view)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
export const getJobs = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('postedBy', 'name email');

        const total = await Job.countDocuments(query);

        res.json({
            success: true,
            jobs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update job status (approve/reject)
// @route   PUT /api/admin/jobs/:id
// @access  Private (Admin only)
export const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.json({
            success: true,
            message: `Job ${status === 'active' ? 'approved' : 'rejected'} successfully`,
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete job (admin)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin only)
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Delete all applications for this job
        await Application.deleteMany({ job: req.params.id });

        // Remove job from all users' savedJobs arrays
        await User.updateMany(
            { savedJobs: req.params.id },
            { $pull: { savedJobs: req.params.id } }
        );

        await job.deleteOne();

        res.json({
            success: true,
            message: 'Job and all associated applications deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all companies (admin view)
// @route   GET /api/admin/companies
// @access  Private (Admin only)
export const getCompanies = async (req, res) => {
    try {
        const { verified, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (verified === 'true') query.verified = true;
        if (verified === 'false') query.verified = false;

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const companies = await Company.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'name email');

        const total = await Company.countDocuments(query);

        res.json({
            success: true,
            companies,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Verify company
// @route   PUT /api/admin/companies/:id/verify
// @access  Private (Admin only)
export const verifyCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { verified: true },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.json({
            success: true,
            message: 'Company verified successfully',
            company
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Unverify company
// @route   PUT /api/admin/companies/:id/unverify
// @access  Private (Admin only)
export const unverifyCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { verified: false },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.json({
            success: true,
            message: 'Company unverified successfully',
            company
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete company (admin)
// @route   DELETE /api/admin/companies/:id
// @access  Private (Admin only)
export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Remove company reference from user
        await User.findByIdAndUpdate(company.user, {
            companyName: null,
            companyId: null
        });

        await company.deleteOne();

        res.json({
            success: true,
            message: 'Company deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all applications (admin view)
// @route   GET /api/admin/applications
// @access  Private (Admin only)
export const getApplications = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        let applicationsQuery = Application.find(query)
            .populate('job', 'title company location salary')
            .populate({
                path: 'applicant',
                select: 'name email profileImage'
            })
            .sort({ appliedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        let applications = await applicationsQuery;

        if (search) {
            applications = applications.filter(app =>
                app.applicant?.name?.toLowerCase().includes(search.toLowerCase()) ||
                app.applicant?.email?.toLowerCase().includes(search.toLowerCase()) ||
                app.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
                app.job?.company?.toLowerCase().includes(search.toLowerCase())
            );
        }

        const total = await Application.countDocuments(query);

        res.json({
            success: true,
            applications,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete application (admin)
// @route   DELETE /api/admin/applications/:id
// @access  Private (Admin only)
export const deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        await application.deleteOne();

        res.json({
            success: true,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Block user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
export const blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent blocking yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot block your own account'
            });
        }

        // Prevent blocking the last admin
        if (user.role === 'admin') {
            const activeAdminCount = await User.countDocuments({
                role: 'admin',
                status: 'active'
            });
            if (activeAdminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot block the last active admin user'
                });
            }
        }

        user.status = 'blocked';
        await user.save();

        res.json({
            success: true,
            message: `${user.name} has been blocked successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
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

// @desc    Unblock user
// @route   PUT /api/admin/users/:id/unblock
// @access  Private (Admin only)
export const unblockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.status = 'active';
        await user.save();

        res.json({
            success: true,
            message: `${user.name} has been unblocked successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
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