import Application from '../models/applications.js';
import Job from '../models/job.js';

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Job Seeker only)
export const applyForJob = async (req, res) => {
    try {
        console.log("=== APPLY FOR JOB ===");
        console.log("User:", req.user);
        console.log("Body:", req.body);

        const { jobId, coverLetter, resume } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.status !== 'active') {
            return res.status(400).json({ message: 'This job is no longer accepting applications' });
        }

        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: req.user.id
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // 
        const application = await Application.create({
            job: jobId,
            applicant: req.user.id,
            employer: job.postedBy,
            coverLetter,
            resume: resume || null
        });

        // Update job's applicationsCount
        const count = await Application.countDocuments({ job: jobId });
        await Job.findByIdAndUpdate(jobId, { applicationsCount: count });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get my applications (Job Seeker)
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker only)
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .populate('job', 'title company location salary type')
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get applications for a job (Employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer who posted the job)
export const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status } = req.query;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user owns the job
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these applications' });
        }

        // Build query
        let query = { job: jobId };
        if (status) {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate({
                path: 'applicant',
                select: 'name email phone location headline skills experience education profileImage resume'
            })
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            job: {
                id: job._id,
                title: job.title,
                company: job.company
            },
            applications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Employer who posted the job or Admin)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Please provide status' });
        }

        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if user owns the job or is admin
        const job = await Job.findById(application.job._id);
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this application' });
        }

        application.status = status;
        if (notes) application.notes = notes;
        application.updatedAt = Date.now();
        await application.save();

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
            application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete application (Admin only)
// @route   DELETE /api/applications/:id
// @access  Private (Admin only)
export const deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const jobId = application.job;

        await application.deleteOne();

        // Update job's applicationsCount
        const Job = await import('../models/job.js').then(m => m.default);
        const count = await Application.countDocuments({ job: jobId });
        await Job.findByIdAndUpdate(jobId, { applicationsCount: count });

        res.json({
            success: true,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};