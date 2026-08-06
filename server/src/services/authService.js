const bcrypt = require('bcryptjs');
const { User, Company } = require('../models');
const AppError = require('../utils/AppError');
const {
  toSafeUser,
  signToken,
  isValidPassword,
  normalizeEmail,
} = require('../utils/auth');

async function registerApplicant({ name, email, password }) {
  const cleanName = String(name || '').trim();
  const cleanEmail = normalizeEmail(email);

  if (!cleanName) {
    throw new AppError('Name is required', { status: 400, code: 'VALIDATION_ERROR' });
  }
  if (!cleanEmail) {
    throw new AppError('Email is required', { status: 400, code: 'VALIDATION_ERROR' });
  }
  if (!isValidPassword(password)) {
    throw new AppError('Password must be at least 8 characters and include a letter and a number', {
      status: 400,
      code: 'VALIDATION_ERROR',
    });
  }

  const existing = await User.findOne({ email: cleanEmail }).select('_id');
  if (existing) {
    throw new AppError('email already exists', { status: 409, code: 'DUPLICATE' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    role: 'applicant',
  });

  return {
    token: signToken(user),
    user: toSafeUser(user),
  };
}

async function registerRecruiter({ name, email, password, companyName, website }) {
  const cleanName = String(name || '').trim();
  const cleanEmail = normalizeEmail(email);
  const cleanCompanyName = String(companyName || '').trim();
  const cleanWebsite = String(website || '').trim();

  if (!cleanName) {
    throw new AppError('Name is required', { status: 400, code: 'VALIDATION_ERROR' });
  }
  if (!cleanEmail) {
    throw new AppError('Email is required', { status: 400, code: 'VALIDATION_ERROR' });
  }
  if (!cleanCompanyName) {
    throw new AppError('companyName is required', { status: 400, code: 'VALIDATION_ERROR' });
  }
  if (!isValidPassword(password)) {
    throw new AppError('Password must be at least 8 characters and include a letter and a number', {
      status: 400,
      code: 'VALIDATION_ERROR',
    });
  }

  const existing = await User.findOne({ email: cleanEmail }).select('_id');
  if (existing) {
    throw new AppError('email already exists', { status: 409, code: 'DUPLICATE' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const company = await Company.create({
    name: cleanCompanyName,
    website: cleanWebsite,
  });

  try {
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: 'recruiter',
      companyId: company._id,
    });

    return {
      token: signToken(user),
      user: toSafeUser(user),
      company: {
        id: String(company._id),
        name: company.name,
        website: company.website,
      },
    };
  } catch (err) {
    await Company.deleteOne({ _id: company._id });
    throw err;
  }
}

async function login({ email, password }) {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail || typeof password !== 'string' || !password) {
    throw new AppError('Email and password are required', {
      status: 400,
      code: 'VALIDATION_ERROR',
    });
  }

  const user = await User.findOne({ email: cleanEmail }).select(
    '+passwordHash name email role companyId isActive'
  );

  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', {
      status: 401,
      code: 'UNAUTHORIZED',
    });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError('Invalid email or password', {
      status: 401,
      code: 'UNAUTHORIZED',
    });
  }

  return {
    token: signToken(user),
    user: toSafeUser(user),
  };
}

async function getMe(userId) {
  const user = await User.findById(userId).select(
    '_id name email role companyId isActive phone headline location experienceYears skills savedJobs resumeDraft'
  );

  if (!user || !user.isActive) {
    throw new AppError('Authentication required', {
      status: 401,
      code: 'UNAUTHORIZED',
    });
  }

  return { user: toSafeUser(user) };
}

async function updateProfile(userId, body) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError('Authentication required', { status: 401, code: 'UNAUTHORIZED' });
  }

  if (body.name !== undefined) user.name = String(body.name).trim();
  if (body.phone !== undefined) user.phone = String(body.phone).trim();
  if (body.headline !== undefined) user.headline = String(body.headline).trim();
  if (body.location !== undefined) user.location = String(body.location).trim();
  if (body.experienceYears !== undefined) {
    user.experienceYears = Math.max(0, Number(body.experienceYears) || 0);
  }
  if (body.skills !== undefined) {
    user.skills = Array.isArray(body.skills)
      ? body.skills
      : String(body.skills || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
  }

  if (!user.name) {
    throw new AppError('Name is required', { status: 400, code: 'VALIDATION_ERROR' });
  }

  await user.save();
  return { user: toSafeUser(user) };
}

async function toggleSavedJob(userId, jobId) {
  const user = await User.findById(userId);
  if (!user || user.role !== 'applicant') {
    throw new AppError('Only applicants can save jobs', { status: 403, code: 'FORBIDDEN' });
  }

  const id = String(jobId);
  const exists = user.savedJobs.some((j) => String(j) === id);
  if (exists) {
    user.savedJobs = user.savedJobs.filter((j) => String(j) !== id);
  } else {
    user.savedJobs.push(jobId);
  }
  await user.save();
  return { saved: !exists, savedJobs: user.savedJobs.map((j) => String(j)) };
}

async function listSavedJobs(userId) {
  const user = await User.findById(userId).populate({
    path: 'savedJobs',
    match: { status: 'open' },
    populate: { path: 'companyId', select: 'name website' },
  });
  if (!user || user.role !== 'applicant') {
    throw new AppError('Only applicants can view saved jobs', { status: 403, code: 'FORBIDDEN' });
  }
  const jobs = (user.savedJobs || []).filter(Boolean).map((job) => ({
    ...job.toObject(),
    id: String(job._id),
    companyName: job.companyId?.name || '',
  }));
  return { jobs };
}

function normalizeExperience(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 12).map((item) => ({
    title: String(item?.title || '').trim().slice(0, 120),
    company: String(item?.company || '').trim().slice(0, 120),
    location: String(item?.location || '').trim().slice(0, 120),
    startDate: String(item?.startDate || '').trim().slice(0, 40),
    endDate: String(item?.endDate || '').trim().slice(0, 40),
    current: Boolean(item?.current),
    description: String(item?.description || '').trim().slice(0, 2000),
  }));
}

function normalizeEducation(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 8).map((item) => ({
    school: String(item?.school || '').trim().slice(0, 160),
    degree: String(item?.degree || '').trim().slice(0, 120),
    field: String(item?.field || '').trim().slice(0, 120),
    startDate: String(item?.startDate || '').trim().slice(0, 40),
    endDate: String(item?.endDate || '').trim().slice(0, 40),
  }));
}

async function getResumeDraft(userId) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError('Authentication required', { status: 401, code: 'UNAUTHORIZED' });
  }
  if (user.role !== 'applicant') {
    throw new AppError('Only applicants can manage resumes', { status: 403, code: 'FORBIDDEN' });
  }
  return { user: toSafeUser(user), resumeDraft: toSafeUser(user).resumeDraft };
}

async function updateResumeDraft(userId, body) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError('Authentication required', { status: 401, code: 'UNAUTHORIZED' });
  }
  if (user.role !== 'applicant') {
    throw new AppError('Only applicants can manage resumes', { status: 403, code: 'FORBIDDEN' });
  }

  const skills = Array.isArray(body.skills)
    ? body.skills
    : String(body.skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  user.resumeDraft = {
    summary: String(body.summary || '').trim().slice(0, 2000),
    experience: normalizeExperience(body.experience),
    education: normalizeEducation(body.education),
    skills: skills.slice(0, 40),
    updatedAt: new Date(),
  };

  if (body.syncProfile) {
    if (body.headline !== undefined) user.headline = String(body.headline || '').trim();
    if (skills.length) user.skills = skills.map((s) => s.toLowerCase());
  }

  await user.save();
  return { user: toSafeUser(user), resumeDraft: toSafeUser(user).resumeDraft };
}

async function getResumePdf(userId) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError('Authentication required', { status: 401, code: 'UNAUTHORIZED' });
  }
  if (user.role !== 'applicant') {
    throw new AppError('Only applicants can download resumes', { status: 403, code: 'FORBIDDEN' });
  }
  const { buildResumePdfBuffer } = require('./resumePdfService');
  const buffer = await buildResumePdfBuffer(user);
  const safeName = String(user.name || 'resume')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'resume';
  return { buffer, filename: `${safeName}-rolefit-resume.pdf` };
}

module.exports = {
  registerApplicant,
  registerRecruiter,
  login,
  getMe,
  updateProfile,
  toggleSavedJob,
  listSavedJobs,
  getResumeDraft,
  updateResumeDraft,
  getResumePdf,
};
