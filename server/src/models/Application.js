const mongoose = require('mongoose');

const STAGES = ['applied', 'interview', 'offered', 'rejected'];
const AI_STATUSES = ['pending', 'processing', 'completed', 'failed'];

const resumeSchema = new mongoose.Schema(
  {
    originalFileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    sizeBytes: { type: Number, default: 0 },
    s3Key: { type: String, required: true },
    s3Bucket: { type: String, default: '' },
    extractedText: { type: String, default: '' },
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

// Stub for Day 1 — wired fully in Week 2 (apply + S3).
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

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STAGES = STAGES;
module.exports.AI_STATUSES = AI_STATUSES;
