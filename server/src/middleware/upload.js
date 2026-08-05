const multer = require('multer');
const config = require('../config');
const AppError = require('../utils/AppError');

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxResumeSizeBytes },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new AppError('Resume must be a PDF or DOCX file', {
          status: 400,
          code: 'INVALID_FILE_TYPE',
        })
      );
    }
    return callback(null, true);
  },
});

function handleUploadError(err, _req, _res, next) {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return next(
      new AppError(`Resume must be no larger than ${config.maxResumeSizeBytes / 1024 / 1024} MB`, {
        status: 400,
        code: 'FILE_TOO_LARGE',
      })
    );
  }
  return next(err);
}

module.exports = {
  uploadResume: resumeUpload.single('resume'),
  handleUploadError,
};
