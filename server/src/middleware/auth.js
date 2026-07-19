const { User } = require('../models');
const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/auth');

async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authentication required', {
        status: 401,
        code: 'UNAUTHORIZED',
      });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).select('_id name email role companyId isActive');

    if (!user || !user.isActive) {
      throw new AppError('Authentication required', {
        status: 401,
        code: 'UNAUTHORIZED',
      });
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId ? String(user.companyId) : null,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new AppError('Authentication required', {
          status: 401,
          code: 'UNAUTHORIZED',
        })
      );
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission for this action', {
          status: 403,
          code: 'FORBIDDEN',
        })
      );
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
