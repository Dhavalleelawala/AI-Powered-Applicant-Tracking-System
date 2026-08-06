const dotenv = require('dotenv');

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const required = ['MONGODB_URI'];

if (env === 'production') {
  required.push('JWT_SECRET', 'CLIENT_URL');
}

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (env === 'production') {
  const weakSecrets = new Set(['', 'dev-only-change-me', 'replace_with_long_random_string', 'change-me-in-production-please']);
  if (weakSecrets.has(String(process.env.JWT_SECRET || ''))) {
    throw new Error('JWT_SECRET must be set to a strong unique value in production');
  }
}

const extraOrigins = String(process.env.CLIENT_URLS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const config = {
  env,
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  clientUrls: extraOrigins,
  mongodbUri: process.env.MONGODB_URI,
  serveClient: process.env.SERVE_CLIENT === 'true' || process.env.SERVE_CLIENT === '1',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    bucket: process.env.S3_BUCKET || '',
    region: process.env.AWS_REGION || 'us-east-1',
    localUploadDir: process.env.LOCAL_UPLOAD_DIR || 'uploads',
    fileTokenSecret:
      process.env.FILE_TOKEN_SECRET ||
      (env === 'production' ? process.env.JWT_SECRET : process.env.JWT_SECRET || 'dev-only-change-me'),
  },
  maxResumeSizeBytes: (Number(process.env.MAX_RESUME_SIZE_MB) || 5) * 1024 * 1024,
  ai: {
    provider: process.env.AI_PROVIDER || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Rolefit <noreply@rolefit.local>',
  },
  sendRejectionEmails: process.env.SEND_REJECTION_EMAILS === 'true',
  /** When true, seed demo data if User collection is empty (first cloud boot). */
  seedOnEmpty: process.env.SEED_ON_EMPTY === 'true' || process.env.SEED_ON_EMPTY === '1',
};

module.exports = config;
