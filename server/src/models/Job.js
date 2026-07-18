const mongoose = require('mongoose');

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
const JOB_STATUSES = ['open', 'archived', 'draft'];

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requiredSkills: {
      type: [String],
      default: [],
      set: (skills) =>
        (skills || []).map((s) => String(s).trim().toLowerCase()).filter(Boolean),
    },
    experienceYearsMin: { type: Number, default: 0, min: 0 },
    experienceYearsMax: { type: Number, min: 0 },
    location: { type: String, default: '', trim: true },
    employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPES,
      default: 'full-time',
    },
    status: { type: String, enum: JOB_STATUSES, default: 'draft' },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
    },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ companyId: 1, status: 1 });
jobSchema.index({ recruiterId: 1 });

module.exports = mongoose.model('Job', jobSchema);
module.exports.EMPLOYMENT_TYPES = EMPLOYMENT_TYPES;
module.exports.JOB_STATUSES = JOB_STATUSES;
