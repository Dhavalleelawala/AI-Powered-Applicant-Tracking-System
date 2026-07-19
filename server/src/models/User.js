const mongoose = require('mongoose');

const ROLES = ['recruiter', 'applicant'];

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
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// email unique index comes from `unique: true`
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
