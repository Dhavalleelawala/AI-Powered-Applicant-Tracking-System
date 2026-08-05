const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const jwt = require('jsonwebtoken');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: createS3SignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config');
const AppError = require('../utils/AppError');

const usesS3 =
  config.storage.driver === 's3' &&
  Boolean(config.storage.bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
const s3 = usesS3 ? new S3Client({ region: config.storage.region }) : null;
const uploadRoot = path.resolve(__dirname, '../../', config.storage.localUploadDir);

function safeKey(key) {
  const normalized = String(key || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('../')) {
    throw new AppError('Invalid storage key', { status: 400, code: 'VALIDATION_ERROR' });
  }
  return normalized;
}

async function upload(buffer, key, mimeType) {
  const safeStorageKey = safeKey(key);
  if (usesS3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: config.storage.bucket,
        Key: safeStorageKey,
        Body: buffer,
        ContentType: mimeType,
      })
    );
    return { key: safeStorageKey, bucket: config.storage.bucket };
  }

  const destination = path.resolve(uploadRoot, safeStorageKey);
  if (!destination.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new AppError('Invalid storage key', { status: 400, code: 'VALIDATION_ERROR' });
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, buffer);
  return { key: safeStorageKey, bucket: '' };
}

async function getSignedUrl(key) {
  const safeStorageKey = safeKey(key);
  if (usesS3) {
    return createS3SignedUrl(
      s3,
      new GetObjectCommand({ Bucket: config.storage.bucket, Key: safeStorageKey }),
      { expiresIn: 300 }
    );
  }

  const token = jwt.sign({ key: safeStorageKey, type: 'resume' }, config.storage.fileTokenSecret, {
    expiresIn: '5m',
  });
  return `/api/files/${token}`;
}

async function getLocalFile(key) {
  const safeStorageKey = safeKey(key);
  const filePath = path.resolve(uploadRoot, safeStorageKey);
  if (!filePath.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new AppError('Invalid storage key', { status: 400, code: 'VALIDATION_ERROR' });
  }
  return filePath;
}

function createResumeKey(applicationId, originalFileName) {
  const extension = path.extname(originalFileName || '').toLowerCase();
  return `resumes/${applicationId}/${crypto.randomUUID()}${extension}`;
}

function verifyLocalFileToken(token) {
  try {
    return jwt.verify(token, config.storage.fileTokenSecret);
  } catch {
    throw new AppError('Invalid or expired file link', { status: 401, code: 'UNAUTHORIZED' });
  }
}

module.exports = {
  upload,
  getSignedUrl,
  getLocalFile,
  createResumeKey,
  verifyLocalFileToken,
};
