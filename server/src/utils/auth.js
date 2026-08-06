const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('./AppError');

function toSafeUser(user) {
  const draft = user.resumeDraft || {};
  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId ? String(user.companyId) : null,
    phone: user.phone || '',
    headline: user.headline || '',
    location: user.location || '',
    experienceYears: user.experienceYears || 0,
    skills: user.skills || [],
    savedJobs: (user.savedJobs || []).map((id) => String(id)),
    resumeDraft: {
      summary: draft.summary || '',
      experience: draft.experience || [],
      education: draft.education || [],
      skills: draft.skills || [],
      updatedAt: draft.updatedAt || null,
    },
  };
}

function signToken(user) {
  const payload = {
    sub: String(user._id || user.id),
    role: user.role,
    companyId: user.companyId ? String(user.companyId) : null,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch {
    throw new AppError('Invalid or expired token', {
      status: 401,
      code: 'UNAUTHORIZED',
    });
  }
}

function isValidPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return false;
  }
  return /[A-Za-z]/.test(password) && /\d/.test(password);
}

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

module.exports = {
  toSafeUser,
  signToken,
  verifyToken,
  isValidPassword,
  normalizeEmail,
};
