import Job from '../models/job.js';

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer/Admin only)
export const createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            company,
            location,
            salary,
            type,
            experience,
            requirements,
            benefits,
            skills,
            education
        } = req.body;

        // Check required fields
        if (!title || !description || !company || !location || !salary || !experience) {
            return res.status(400).json({
                message: 'Please provide all required fields: title, description, company, location, salary, experience'
            });
        }

        // Create job with the logged-in user as poster
        const job = await Job.create({
            title,
            description,
            company,
            location,
            salary,
            type,
            experience,
            requirements: requirements || [],
            benefits: benefits || [],
            skills: skills || [],
            education,
            postedBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all jobs (with filters)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
    try {
        const { search, location, type, experience, sort, limit = 20, page = 1 } = req.query;

        let query = { status: 'active' };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (type) {
            query.type = type;
        }

        if (experience) {
            query.experience = experience;
        }

        let sortOption = {};
        if (sort === 'latest') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'salary-high') {
            sortOption = { salary: -1 };
        } else if (sort === 'salary-low') {
            sortOption = { salary: 1 };
        } else {
            sortOption = { createdAt: -1 };
        }

        const skip = (page - 1) * limit;

        const jobs = await Job.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('postedBy', 'name email companyName');

        // Get application count for each job
        const Application = await import('../models/applications.js').then(m => m.default);

        const jobsWithCount = await Promise.all(jobs.map(async (job) => {
            const applicationCount = await Application.countDocuments({ job: job._id });
            const jobObj = job.toObject();
            jobObj.applicationsCount = applicationCount;
            return jobObj;
        }));

        const total = await Job.countDocuments(query);

        res.json({
            success: true,
            count: jobsWithCount.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            jobs: jobsWithCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name email companyName');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Get application count
        const Application = await import('../models/applications.js').then(m => m.default);
        const applicationCount = await Application.countDocuments({ job: job._id });

        const jobObj = job.toObject();
        jobObj.applicationsCount = applicationCount;

        res.json({
            success: true,
            job: jobObj
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer who posted it or Admin)
export const updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user owns the job or is admin
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to update this job'
            });
        }

        // Update job
        job = await Job.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Job updated successfully',
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer who posted it or Admin)
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user owns the job or is admin
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to delete this job'
            });
        }

        // Delete all applications for this job
        const Application = await import('../models/applications.js').then(m => m.default);
        await Application.deleteMany({ job: req.params.id });

        // Remove job from all users' savedJobs arrays
        const User = await import('../models/user.js').then(m => m.default);
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
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get jobs posted by current employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer only)
export const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id })
            .sort({ createdAt: -1 });

        // Get application count for each job
        const Application = await import('../models/applications.js').then(m => m.default);

        const jobsWithCount = await Promise.all(jobs.map(async (job) => {
            const applicationCount = await Application.countDocuments({ job: job._id });
            const jobObj = job.toObject();
            jobObj.applicationsCount = applicationCount;
            return jobObj;
        }));

        res.json({
            success: true,
            count: jobsWithCount.length,
            jobs: jobsWithCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};