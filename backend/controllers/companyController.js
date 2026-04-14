import Company from '../models/company.js';
import User from '../models/user.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Create company profile
// @route   POST /api/companies
// @access  Private (Employer only)
export const createCompany = async (req, res) => {
    try {
        const {
            name,
            industry,
            location,
            size,
            founded,
            website,
            description,
            specialties,
            benefits,
            social,
            logo
        } = req.body;

        // Check required fields
        if (!name || !industry || !location || !size || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, industry, location, size, and description'
            });
        }

        // Check if user already has a company
        const existingCompany = await Company.findOne({ user: req.user.id });
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: 'You already have a company profile'
            });
        }

        // Create company
        const company = await Company.create({
            user: req.user.id,
            name,
            logo: logo || null,
            industry,
            location,
            size,
            founded,
            website,
            description,
            specialties: specialties || [],
            benefits: benefits || [],
            social: social || {}
        });

        // Update user with company info
        await User.findByIdAndUpdate(req.user.id, {
            companyName: company.name,
            companyId: company._id
        });

        res.status(201).json({
            success: true,
            message: 'Company profile created successfully',
            company
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get my company profile
// @route   GET /api/companies/me
// @access  Private (Employer only)
export const getMyCompany = async (req, res) => {
    try {
        console.log("Getting company for user ID:", req.user.id); // Debug log

        const company = await Company.findOne({ user: req.user.id });

        console.log("Found company:", company); // Debug log

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company profile not found'
            });
        }

        res.json({
            success: true,
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

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
export const getCompanies = async (req, res) => {
    try {
        const { search, industry, limit = 20, page = 1 } = req.query;

        let query = {};

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Industry filter
        if (industry) {
            query.industry = { $regex: industry, $options: 'i' };
        }

        // Pagination
        const skip = (page - 1) * limit;

        const companies = await Company.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'name email');

        // Get open jobs count for each company
        const Job = await import('../models/job.js').then(m => m.default);

        const companiesWithJobs = await Promise.all(companies.map(async (company) => {
            const openJobsCount = await Job.countDocuments({
                company: company.name,
                status: 'active'
            });
            return {
                ...company.toObject(),
                openJobs: openJobsCount
            };
        }));

        const total = await Company.countDocuments(query);

        res.json({
            success: true,
            count: companiesWithJobs.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            companies: companiesWithJobs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single company by ID
// @route   GET /api/companies/:id
// @access  Public
export const getCompany = async (req, res) => {
    try {
        // Check if the ID is a valid ObjectId (24 hex chars)
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid company ID format'
            });
        }

        const company = await Company.findById(req.params.id)
            .populate('user', 'name email');

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Get jobs posted by this company
        const Job = await import('../models/job.js').then(m => m.default);
        const jobs = await Job.find({ company: company.name, status: 'active' })
            .limit(5)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            company,
            openJobs: jobs.length,
            recentJobs: jobs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update company profile
// @route   PUT /api/companies/me
// @access  Private (Employer only)
export const updateCompany = async (req, res) => {
    try {
        const {
            name,
            logo,
            industry,
            location,
            size,
            founded,
            website,
            description,
            specialties,
            benefits,
            social
        } = req.body;

        let company = await Company.findOne({ user: req.user.id });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company profile not found'
            });
        }

        // If logo is explicitly set to null, delete from Cloudinary
        if (logo === null && company.logoPublicId) {
            try {
                await cloudinary.uploader.destroy(company.logoPublicId);
                company.logoPublicId = null;
            } catch (error) {
                console.log('Error deleting logo:', error);
            }
        }

        const oldCompanyName = company.name;
        const newCompanyName = name || company.name;

        // Update company
        company = await Company.findOneAndUpdate(
            { user: req.user.id },
            {
                name: newCompanyName,
                logo: logo !== undefined ? logo : company.logo,
                logoPublicId: logo === null ? null : company.logoPublicId,
                industry: industry || company.industry,
                location: location || company.location,
                size: size || company.size,
                founded: founded || company.founded,
                website: website || company.website,
                description: description || company.description,
                specialties: specialties || company.specialties,
                benefits: benefits || company.benefits,
                social: social || company.social,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        // Update user's company name
        await User.findByIdAndUpdate(req.user.id, {
            companyName: newCompanyName,
            companyId: company._id
        });

        // Update ALL jobs posted by this employer with the new company name
        const Job = await import('../models/job.js').then(m => m.default);
        await Job.updateMany(
            { postedBy: req.user.id },
            { company: newCompanyName }
        );

        res.json({
            success: true,
            message: 'Company profile updated successfully',
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

// @desc    Delete company profile (Admin only)
// @route   DELETE /api/companies/:id
// @access  Private (Admin only)
export const deleteCompany = async (req, res) => {
    try {
        // Check if the ID is a valid ObjectId
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid company ID format'
            });
        }

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Delete company logo from Cloudinary
        if (company.logoPublicId) {
            try {
                await cloudinary.uploader.destroy(company.logoPublicId);
            } catch (error) {
                console.log('Error deleting logo:', error);
            }
        }

        // Get the user associated with this company
        const user = await User.findById(company.user);

        if (user) {
            // Delete all jobs posted by this employer
            const Job = await import('../models/job.js').then(m => m.default);
            await Job.deleteMany({ postedBy: user._id });

            // Delete all applications for jobs posted by this employer
            const Application = await import('../models/applications.js').then(m => m.default);
            const jobs = await Job.find({ postedBy: user._id });
            const jobIds = jobs.map(job => job._id);
            if (jobIds.length > 0) {
                await Application.deleteMany({ job: { $in: jobIds } });
            }

            // Update user - remove company reference
            user.companyName = null;
            user.companyId = null;
            await user.save();

            // Option: Delete the user completely (uncomment if you want this)
            // await user.deleteOne();
        }

        await company.deleteOne();

        res.json({
            success: true,
            message: 'Company, all associated jobs, and applications deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Upload company logo (Employer only)
// @route   POST /api/companies/upload-logo
// @access  Private (Employer only)
export const uploadCompanyLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const company = await Company.findOne({ user: req.user.id });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Delete old logo if exists
        if (company.logoPublicId) {
            try {
                await cloudinary.uploader.destroy(company.logoPublicId);
            } catch (error) {
                console.log('Error deleting old logo:', error);
            }
        }

        // Update company with new logo
        company.logo = req.file.path;
        company.logoPublicId = req.file.filename;
        await company.save();

        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            logoUrl: req.file.path,
            company
        });
    } catch (error) {
        console.error('Logo upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload logo'
        });
    }
};