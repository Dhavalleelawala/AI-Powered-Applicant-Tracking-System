const mongoose = require('mongoose');

const ROLES = ['recruiter', 'applicant'];

const resumeExperienceSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },
    company: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    startDate: { type: String, default: '', trim: true },
    endDate: { type: String, default: '', trim: true },
    current: { type: Boolean, default: false },
    description: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const resumeEducationSchema = new mongoose.Schema(
  {
    school: { type: String, default: '', trim: true },
    degree: { type: String, default: '', trim: true },
    field: { type: String, default: '', trim: true },
    startDate: { type: String, default: '', trim: true },
    endDate: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const resumeDraftSchema = new mongoose.Schema(
  {
    summary: { type: String, default: '', trim: true, maxlength: 2000 },
    experience: { type: [resumeExperienceSchema], default: [] },
    education: { type: [resumeEducationSchema], default: [] },
    skills: {
      type: [String],
      default: [],
      set: (skills) =>
        [...new Set((skills || []).map((s) => String(s).trim()).filter(Boolean))].slice(0, 40),
    },
    updatedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    phone: { type: String, default: '', trim: true },
    headline: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    experienceYears: { type: Number, default: 0, min: 0 },
    skills: {
      type: [String],
      default: [],
      set: (skills) =>
        [...new Set((skills || []).map((s) => String(s).trim().toLowerCase()).filter(Boolean))].slice(0, 40),
    },
    resumeDraft: { type: resumeDraftSchema, default: () => ({}) },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, companyId: 1 });

userSchema.pre('validate', function validateRecruiterCompany(next) {
  if (this.role === 'recruiter' && !this.companyId) {
    return next(new Error('companyId is required for recruiter users'));
  }
  if (this.role === 'applicant' && this.companyId) {
    this.companyId = null;
  }
  return next();
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
