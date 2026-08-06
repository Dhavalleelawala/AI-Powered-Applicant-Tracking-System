const { Application, Job } = require('../models');
const config = require('../config');
const AppError = require('../utils/AppError');
const storageService = require('./storageService');
const resumeParseService = require('./resumeParseService');
const aiService = require('./aiService');
const emailService = require('./emailService');

function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function canAccess(application, user) {
  return (
    (user.role === 'applicant' && String(application.applicantId?._id || application.applicantId) === user.id) ||
    (user.role === 'recruiter' && String(application.companyId) === user.companyId)
  );
}

function toApplicationPayload(application) {
  if (!application) return application;
  const plain = typeof application.toObject === 'function' ? application.toObject() : { ...application };
  const job = plain.jobId && typeof plain.jobId === 'object' ? plain.jobId : null;
  const applicant = plain.applicantId && typeof plain.applicantId === 'object' ? plain.applicantId : null;
  const resume = plain.resume
    ? {
        originalFileName: plain.resume.originalFileName,
        mimeType: plain.resume.mimeType,
        sizeBytes: plain.resume.sizeBytes,
        uploadedAt: plain.resume.uploadedAt,
      }
    : undefined;

  return {
    ...plain,
    id: String(plain._id),
    jobId: job ? String(job._id) : String(plain.jobId || ''),
    applicantId: applicant ? String(applicant._id) : String(plain.applicantId || ''),
    companyId: plain.companyId ? String(plain.companyId) : null,
    jobTitle: job?.title || plain.jobTitle,
    job: job
      ? {
          id: String(job._id),
          title: job.title,
          location: job.location,
          employmentType: job.employmentType,
          status: job.status,
          requiredSkills: job.requiredSkills || [],
          description: job.description,
        }
      : undefined,
    applicant: applicant
      ? {
          id: String(applicant._id),
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone,
          headline: applicant.headline,
          skills: applicant.skills || [],
          location: applicant.location,
          experienceYears: applicant.experienceYears,
        }
      : undefined,
    resume,
  };
}

async function applyToJob(jobId, body, file, user) {
  if (!file) {
    throw new AppError('A resume file is required', { status: 400, code: 'RESUME_REQUIRED' });
  }
  const job = await Job.findOne({ _id: jobId, status: 'open' }).select('_id companyId');
  if (!job) {
    throw new AppError('Open job not found', { status: 404, code: 'NOT_FOUND' });
  }
  const exists = await Application.exists({ jobId: job._id, applicantId: user.id });
  if (exists) {
    throw new AppError('You have already applied to this job', { status: 409, code: 'DUPLICATE' });
  }

  const key = storageService.createResumeKey(String(user.id), file.originalname);
  const application = await Application.create({
    jobId: job._id,
    applicantId: user.id,
    companyId: job.companyId,
    coverLetter: String(body.coverLetter || '').trim(),
    aiStatus: 'pending',
    resume: {
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      s3Key: key,
    },
  });

  setImmediate(() => processResumeAnalysis(application._id, file.buffer).catch(logAnalysisFailure));
  return {
    id: String(application._id),
    jobId: String(application.jobId),
    stage: application.stage,
    aiStatus: application.aiStatus,
  };
}

function logAnalysisFailure(err) {
  console.error('[Rolefit AI] Background analysis error:', err);
}

async function processResumeAnalysis(applicationId, buffer) {
  const application = await Application.findById(applicationId).populate('jobId', 'description requiredSkills');
  if (!application) {
    return;
  }

  try {
    await storageService.upload(buffer, application.resume.s3Key, application.resume.mimeType);
    application.resume.s3Bucket = config.storage.bucket;
    application.aiStatus = 'processing';
    await application.save();

    const resumeText = await resumeParseService.extractResumeText(buffer, application.resume.mimeType);
    const analysis = await aiService.analyze({
      resumeText,
      jobDescription: application.jobId.description,
      requiredSkills: application.jobId.requiredSkills,
    });

    application.resume.extractedText = resumeText;
    application.aiAnalysis = {
      ...analysis,
      matchScore: aiService.clampScore(analysis.matchScore),
      analyzedAt: new Date(),
    };
    application.aiStatus = 'completed';
    application.aiError = '';
    await application.save();
  } catch (err) {
    application.aiStatus = 'failed';
    application.aiError = String(err.message || 'AI analysis failed').slice(0, 1000);
    await application.save();
  }
}

async function listApplicantApplications(userId, query) {
  const { page, limit, skip } = pagination(query);
  const filter = { applicantId: userId };
  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('jobId', 'title location employmentType status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);
  return {
    applications: applications.map(toApplicationPayload),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function listJobApplications(jobId, query, user) {
  const job = await Job.exists({ _id: jobId, companyId: user.companyId });
  if (!job) {
    throw new AppError('Job not found', { status: 404, code: 'NOT_FOUND' });
  }
  const filter = { jobId, companyId: user.companyId };
  if (query.stage) {
    filter.stage = query.stage;
  }
  if (query.minScore !== undefined) {
    filter['aiAnalysis.matchScore'] = { $gte: Number(query.minScore) || 0 };
  }
  if (query.skill) {
    filter['aiAnalysis.skillsMatched'] = String(query.skill).trim().toLowerCase();
  }
  if (query.minExperience !== undefined) {
    filter['aiAnalysis.experienceYearsEstimated'] = { $gte: Number(query.minExperience) || 0 };
  }
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    score: { 'aiAnalysis.matchScore': -1, createdAt: -1 },
    score_desc: { 'aiAnalysis.matchScore': -1, createdAt: -1 },
    scoreAsc: { 'aiAnalysis.matchScore': 1, createdAt: -1 },
  };
  const sort = sortOptions[query.sort] || sortOptions.score_desc;
  const { page, limit, skip } = pagination(query);
  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('applicantId', 'name email phone headline')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);
  return {
    applications: applications.map(toApplicationPayload),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function getApplication(applicationId, user) {
  const application = await Application.findById(applicationId)
    .populate('jobId', 'title description location employmentType requiredSkills')
    .populate('applicantId', 'name email phone headline skills location experienceYears')
    .lean();
  if (!application || !canAccess(application, user)) {
    throw new AppError('Application not found', { status: 404, code: 'NOT_FOUND' });
  }
  return toApplicationPayload(application);
}

async function updateStage(applicationId, { stage, note, rejectionReason }, user) {
  const allowedStages = new Set(['applied', 'interview', 'offered', 'rejected']);
  if (!allowedStages.has(stage)) {
    throw new AppError('Invalid application stage', { status: 400, code: 'VALIDATION_ERROR' });
  }
  const application = await Application.findOne({ _id: applicationId, companyId: user.companyId })
    .populate('jobId', 'title')
    .populate('applicantId', 'name email');
  if (!application) {
    throw new AppError('Application not found', { status: 404, code: 'NOT_FOUND' });
  }

  const previousStage = application.stage;
  if (previousStage !== stage) {
    application.stage = stage;
    application.stageHistory.push({
      from: previousStage,
      to: stage,
      changedBy: user.id,
      note: String(note || '').trim(),
    });
    if (stage === 'rejected') {
      application.rejectionReason = String(rejectionReason || note || '').trim();
    }
    await application.save();
    if (['interview', 'offered', 'rejected'].includes(stage)) {
      emailService
        .sendStageEmail({
          applicant: application.applicantId,
          job: application.jobId,
          stage,
          applicationId: application._id,
        })
        .catch((err) => console.error('[Rolefit email] Stage notification failed:', err));
    }
  }
  return toApplicationPayload(application);
}

async function addRecruiterNote(applicationId, text, user) {
  const clean = String(text || '').trim();
  if (!clean) {
    throw new AppError('Note text is required', { status: 400, code: 'VALIDATION_ERROR' });
  }
  const application = await Application.findOne({ _id: applicationId, companyId: user.companyId });
  if (!application) {
    throw new AppError('Application not found', { status: 404, code: 'NOT_FOUND' });
  }
  application.recruiterNotes.push({ text: clean, createdBy: user.id });
  await application.save();
  return toApplicationPayload(application.toObject());
}

async function bulkUpdateStage(jobId, { applicationIds, stage, note }, user) {
  const allowedStages = new Set(['applied', 'interview', 'offered', 'rejected']);
  if (!allowedStages.has(stage)) {
    throw new AppError('Invalid application stage', { status: 400, code: 'VALIDATION_ERROR' });
  }
  const ids = Array.isArray(applicationIds) ? applicationIds : [];
  if (!ids.length) {
    throw new AppError('applicationIds required', { status: 400, code: 'VALIDATION_ERROR' });
  }
  const job = await Job.exists({ _id: jobId, companyId: user.companyId });
  if (!job) {
    throw new AppError('Job not found', { status: 404, code: 'NOT_FOUND' });
  }

  const applications = await Application.find({
    _id: { $in: ids },
    jobId,
    companyId: user.companyId,
  });

  let updated = 0;
  for (const application of applications) {
    if (application.stage === stage) continue;
    const previousStage = application.stage;
    application.stage = stage;
    application.stageHistory.push({
      from: previousStage,
      to: stage,
      changedBy: user.id,
      note: String(note || 'Bulk update').trim(),
    });
    await application.save();
    updated += 1;
  }

  return { updated, stage };
}

async function getResumeUrl(applicationId, user) {
  const application = await Application.findById(applicationId).select('applicantId companyId resume');
  if (!application || !canAccess(application, user) || !application.resume?.s3Key) {
    throw new AppError('Application not found', { status: 404, code: 'NOT_FOUND' });
  }
  return { url: await storageService.getSignedUrl(application.resume.s3Key), expiresInSeconds: 300 };
}

async function reanalyzeApplication(applicationId, user) {
  const application = await Application.findById(applicationId).select(
    '+resume.extractedText resume companyId applicantId'
  );
  if (!application || !canAccess(application, user) || !application.resume?.s3Key) {
    throw new AppError('Application not found', { status: 404, code: 'NOT_FOUND' });
  }
  application.aiStatus = 'pending';
  application.aiError = '';
  await application.save();
  setImmediate(() => reanalyzeStoredResume(applicationId).catch(logAnalysisFailure));
  return { id: String(application._id), aiStatus: 'pending' };
}

async function reanalyzeStoredResume(applicationId) {
  const application = await Application.findById(applicationId)
    .select('+resume.extractedText resume')
    .populate('jobId', 'description requiredSkills');
  if (!application?.jobId) {
    return;
  }
  try {
    application.aiStatus = 'processing';
    await application.save();

    let resumeText = application.resume?.extractedText || '';
    if (!resumeText && application.resume?.s3Key) {
      const filePath = await storageService.getLocalFile(application.resume.s3Key).catch(() => null);
      if (filePath) {
        const fs = require('fs');
        const buffer = fs.readFileSync(filePath);
        resumeText = await resumeParseService.extractResumeText(buffer, application.resume.mimeType);
        application.resume.extractedText = resumeText;
      }
    }
    if (!resumeText) {
      throw new Error('No resume text available to reanalyze');
    }

    const analysis = await aiService.analyze({
      resumeText,
      jobDescription: application.jobId.description,
      requiredSkills: application.jobId.requiredSkills,
    });
    application.aiAnalysis = {
      ...analysis,
      matchScore: aiService.clampScore(analysis.matchScore),
      analyzedAt: new Date(),
    };
    application.aiStatus = 'completed';
    application.aiError = '';
    await application.save();
  } catch (err) {
    application.aiStatus = 'failed';
    application.aiError = String(err.message || 'AI analysis failed').slice(0, 1000);
    await application.save();
  }
}

module.exports = {
  applyToJob,
  listApplicantApplications,
  listJobApplications,
  getApplication,
  updateStage,
  addRecruiterNote,
  bulkUpdateStage,
  getResumeUrl,
  reanalyzeApplication,
};
