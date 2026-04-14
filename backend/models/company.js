import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Please add company name']
    },
    logo: {
        type: String,
        default: null
    },
    logoPublicId: {
        type: String,
        default: null
    },
    industry: {
        type: String,
        required: [true, 'Please add industry']
    },
    location: {
        type: String,
        required: [true, 'Please add location']
    },
    size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
        required: true
    },
    founded: {
        type: String
    },
    website: {
        type: String
    },
    description: {
        type: String,
        required: [true, 'Please add company description']
    },
    specialties: [String],
    benefits: [String],
    verified: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false
    },
    social: {
        linkedin: String,
        twitter: String,
        facebook: String,
        instagram: String
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

CompanySchema.index({ name: 1 });
CompanySchema.index({ verified: 1 });
CompanySchema.index({ featured: 1 });
CompanySchema.index({ industry: 1 });
CompanySchema.index({ location: 1 });
CompanySchema.index({ createdAt: -1 });
CompanySchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Company', CompanySchema);