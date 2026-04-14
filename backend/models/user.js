import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['job_seeker', 'employer', 'admin'],
        default: 'job_seeker'
    },
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    phone: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: null
    },
    headline: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    skills: [String],
    experience: [
        {
            title: String,
            company: String,
            location: String,
            startDate: String,
            endDate: String,
            current: Boolean,
            description: String
        }
    ],
    education: [
        {
            degree: String,
            institution: String,
            field: String,
            startYear: String,
            endYear: String,
            current: Boolean
        }
    ],
    resume: {
        type: String,
        default: null
    },
    resumePublicId: {
        type: String,
        default: null
    },
    resumeFileName: {
        type: String,
        default: null
    },
    resumeUploadedAt: {
        type: Date,
        default: null
    },
    profileImage: {
        type: String,
        default: null
    },
    profileImagePublicId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
    companyName: {
        type: String,
        default: null
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!enteredPassword) {
        console.log('No password provided to matchPassword');
        return false;
    }
    if (!this.password) {
        console.log('User has no password stored');
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'companyName': 1 });

export default mongoose.model('User', UserSchema);