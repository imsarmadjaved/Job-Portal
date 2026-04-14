import Job from '../models/job.js';
import Application from '../models/applications.js';

// @desc    Get employer analytics data
// @route   GET /api/analytics/employer
// @access  Private (Employer only)
export const getEmployerAnalytics = async (req, res) => {
    try {
        const employerId = req.user.id;

        // Get all jobs by this employer
        const jobs = await Job.find({ postedBy: employerId }).sort({ createdAt: -1 });

        // Get all applications for these jobs
        const jobIds = jobs.map(job => job._id);
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('job', 'title company')
            .populate('applicant', 'name email');

        // Calculate stats
        const totalJobs = jobs.length;
        const activeJobs = jobs.filter(job => job.status === 'active').length;
        const closedJobs = jobs.filter(job => job.status === 'closed').length;
        const totalApplications = applications.length;

        // Status breakdown
        const pendingApps = applications.filter(app => app.status === 'pending').length;
        const reviewedApps = applications.filter(app => app.status === 'reviewed').length;
        const shortlistedApps = applications.filter(app => app.status === 'shortlisted').length;
        const rejectedApps = applications.filter(app => app.status === 'rejected').length;
        const acceptedApps = applications.filter(app => app.status === 'accepted').length;

        // Applications per job
        const jobsWithCounts = jobs.map(job => ({
            _id: job._id,
            title: job.title,
            status: job.status,
            createdAt: job.createdAt,
            applicationsCount: applications.filter(app => app.job.toString() === job._id.toString()).length
        }));

        // Monthly trend data (last 6 months)
        const monthlyData = {};
        const today = new Date();

        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(today.getMonth() - i);
            const monthKey = date.toLocaleString('default', { month: 'short' });
            monthlyData[monthKey] = 0;
        }

        applications.forEach(app => {
            const appDate = new Date(app.appliedAt);
            const monthKey = appDate.toLocaleString('default', { month: 'short' });
            if (monthlyData[monthKey] !== undefined) {
                monthlyData[monthKey]++;
            }
        });

        const trendData = Object.entries(monthlyData)
            .map(([name, applications]) => ({ name, applications }))
            .reverse();

        // Recent applications (last 5)
        const recentApplications = await Application.find({ job: { $in: jobIds } })
            .sort({ appliedAt: -1 })
            .limit(5)
            .populate('job', 'title')
            .populate('applicant', 'name email');

        res.json({
            success: true,
            data: {
                stats: {
                    totalJobs,
                    activeJobs,
                    closedJobs,
                    totalApplications,
                    avgApplicationsPerJob: totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0,
                    statusBreakdown: {
                        pending: pendingApps,
                        reviewed: reviewedApps,
                        shortlisted: shortlistedApps,
                        rejected: rejectedApps,
                        accepted: acceptedApps
                    }
                },
                jobs: jobsWithCounts,
                trendData,
                recentApplications
            }
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

// @desc    Get job-specific analytics
// @route   GET /api/analytics/job/:jobId
// @access  Private (Employer who owns the job)
export const getJobAnalytics = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Check if job exists and belongs to employer
        const job = await Job.findOne({ _id: jobId, postedBy: req.user.id });
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or not authorized'
            });
        }

        // Get applications for this job
        const applications = await Application.find({ job: jobId })
            .populate('applicant', 'name email');

        // Status breakdown
        const statusBreakdown = {
            pending: applications.filter(app => app.status === 'pending').length,
            reviewed: applications.filter(app => app.status === 'reviewed').length,
            shortlisted: applications.filter(app => app.status === 'shortlisted').length,
            rejected: applications.filter(app => app.status === 'rejected').length,
            accepted: applications.filter(app => app.status === 'accepted').length
        };

        // Applications over time (by week)
        const weeklyData = {};
        applications.forEach(app => {
            const date = new Date(app.appliedAt);
            const weekNum = Math.ceil(date.getDate() / 7);
            const month = date.toLocaleString('default', { month: 'short' });
            const key = `${month} W${weekNum}`;
            weeklyData[key] = (weeklyData[key] || 0) + 1;
        });

        const trendData = Object.entries(weeklyData)
            .map(([name, applications]) => ({ name, applications }))
            .slice(-6);

        res.json({
            success: true,
            data: {
                job: {
                    _id: job._id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    salary: job.salary,
                    type: job.type,
                    status: job.status,
                    createdAt: job.createdAt
                },
                stats: {
                    totalApplications: applications.length,
                    statusBreakdown
                },
                trendData,
                applications
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