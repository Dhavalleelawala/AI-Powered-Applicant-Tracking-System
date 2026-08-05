const dotenv = require('dotenv');

dotenv.config();

const required = ['MONGODB_URI'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    bucket: process.env.S3_BUCKET || '',
    region: process.env.AWS_REGION || 'us-east-1',
    localUploadDir: process.env.LOCAL_UPLOAD_DIR || 'uploads',
    fileTokenSecret: process.env.FILE_TOKEN_SECRET || process.env.JWT_SECRET || 'dev-only-change-me',
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
};

module.exports = config;
