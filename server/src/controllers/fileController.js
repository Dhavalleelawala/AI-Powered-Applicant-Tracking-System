const fs = require('fs');
const path = require('path');
const storageService = require('../services/storageService');
const AppError = require('../utils/AppError');

async function getFile(req, res, next) {
  try {
    const payload = storageService.verifyLocalFileToken(req.params.token);
    if (payload.type !== 'resume') {
      throw new AppError('Invalid file link', { status: 401, code: 'UNAUTHORIZED' });
    }

    const filePath = await storageService.getLocalFile(payload.key);
    if (!fs.existsSync(filePath)) {
      throw new AppError('File not found', { status: 404, code: 'NOT_FOUND' });
    }

    return res.download(filePath, path.basename(payload.key));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getFile };
