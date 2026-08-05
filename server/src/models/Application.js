const mongoose = require('mongoose');

const STAGES = ['applied', 'interview', 'offered', 'rejected'];
const AI_STATUSES = ['pending', 'processing', 'completed', 'failed'];

const resumeSchema = new mongoose.Schema(
  {
    originalFileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    sizeBytes: { type: Number, default: 0 },
    // Required when a resume object is present (Week 2 upload path).
    s3Key: { type: String, required: true, trim: true },
    s3Bucket: { type: String, default: '' },
    extractedText: { type: String, default: '', select: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
  {
    matchScore: { type: Number, min: 0, max: 100 },
    skillsMatched: { type: [String], default: [] },
    skillsMissing: { type: [String], default: [] },
    experienceYearsEstimated: { type: Number },
    summary: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    gaps: { type: [String], default: [] },
    model: { type: String, default: '' },
    analyzedAt: { type: Date },
    rawResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const stageHistorySchema = new mongoose.Schema(
  {
    from: { type: String, enum: STAGES },
    to: { type: String, enum: STAGES, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const recruiterNoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// Wired for apply + pipeline + HR collaboration.
const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    coverLetter: { type: String, default: '' },
    stage: { type: String, enum: STAGES, default: 'applied' },
    rejectionReason: { type: String, default: '', trim: true, maxlength: 500 },
    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        [...new Set((tags || []).map((t) => String(t).trim().toLowerCase()).filter(Boolean))].slice(0, 20),
    },
    recruiterNotes: { type: [recruiterNoteSchema], default: [] },
    resume: { type: resumeSchema },
    aiAnalysis: { type: aiAnalysisSchema },
    aiStatus: { type: String, enum: AI_STATUSES, default: 'pending' },
    aiError: { type: String, default: '' },
    stageHistory: { type: [stageHistorySchema], default: [] },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, 'aiAnalysis.matchScore': -1 });
applicationSchema.index({ applicantId: 1, createdAt: -1 });
applicationSchema.index({ companyId: 1, stage: 1 });
applicationSchema.index({ jobId: 1, stage: 1 });
applicationSchema.index({ companyId: 1, tags: 1 });
applicationSchema.index({ companyId: 1, updatedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STAGES = STAGES;
module.exports.AI_STATUSES = AI_STATUSES;
