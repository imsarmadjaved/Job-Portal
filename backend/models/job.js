// backend/models/job.js
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a job description']
    },
    company: {
        type: String,
        required: [true, 'Please add company name']
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        default: null
    },
    companyLogo: {
        type: String,
        default: null
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    salary: {
        type: String,
        required: [true, 'Please add salary range']
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
        default: 'Full-time'
    },
    experience: {
        type: String,
        enum: ['Entry', 'Mid-Level', 'Senior', 'Lead'],
        required: true
    },
    requirements: [String],
    benefits: [String],
    skills: [String],
    education: String,
    urgent: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'pending'],
        default: 'active'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicationsCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
JobSchema.index({ title: 'text', description: 'text', company: 'text' });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ postedBy: 1, createdAt: -1 });

JobSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

const Job = mongoose.model('Job', JobSchema);
export default Job;