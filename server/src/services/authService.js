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

module.exports = {
  registerApplicant,
  registerRecruiter,
  login,
};
