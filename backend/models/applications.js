import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    coverLetter: {
        type: String,
        required: [true, 'Please add a cover letter']
    },
    resume: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
        default: 'pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
});

// Ensure a user can only apply once per job
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Additional indexes for performance
ApplicationSchema.index({ applicant: 1, appliedAt: -1 });
ApplicationSchema.index({ employer: 1, appliedAt: -1 });
ApplicationSchema.index({ job: 1, status: 1 });
ApplicationSchema.index({ status: 1, appliedAt: -1 });

// Update timestamps on save
ApplicationSchema.pre('save', function () {
    this.updatedAt = Date.now();

});

// Static method to update job applications count
ApplicationSchema.statics.updateJobApplicationsCount = async function (jobId) {
    const count = await this.countDocuments({ job: jobId });
    await mongoose.model('Job').findByIdAndUpdate(jobId, { applicationsCount: count });
};

// After save, update job applications count
ApplicationSchema.post('save', async function () {
    await this.constructor.updateJobApplicationsCount(this.job);
});

// After delete, update job applications count
ApplicationSchema.post('deleteOne', { document: true }, async function () {
    await this.constructor.updateJobApplicationsCount(this.job);
});

export default mongoose.model('Application', ApplicationSchema);