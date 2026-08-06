/**
 * Production deploy preflight — validates env before Render/Atlas cutover.
 * Usage: npm run preflight --prefix server
 * Optional: REQUIRE_ATLAS=1 npm run preflight --prefix server
 */
require('dotenv').config();

const weakSecrets = new Set([
  '',
  'dev-only-change-me',
  'replace_with_long_random_string',
  'change-me-in-production-please',
  'change-me-in-production-please-use-openssl-rand',
  'change-file-token-secret-use-openssl-rand',
]);

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`✓ ${message}`);
}

async function main() {
  console.log('Rolefit production preflight\n');

  const mongo = process.env.MONGODB_URI || '';
  const jwt = process.env.JWT_SECRET || '';
  const fileToken = process.env.FILE_TOKEN_SECRET || '';
  const clientUrl = process.env.CLIENT_URL || '';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const requireAtlas = process.env.REQUIRE_ATLAS === '1' || process.env.REQUIRE_ATLAS === 'true';

  if (!mongo) fail('MONGODB_URI is missing');
  else if (requireAtlas && !mongo.includes('mongodb+srv://') && !mongo.includes('mongodb.net')) {
    fail('MONGODB_URI does not look like MongoDB Atlas (set REQUIRE_ATLAS=0 to skip)');
  } else ok('MONGODB_URI present');

  if (!jwt || weakSecrets.has(jwt) || jwt.length < 24) {
    fail('JWT_SECRET must be a strong unique value (24+ chars)');
  } else ok('JWT_SECRET looks strong');

  if (!fileToken || weakSecrets.has(fileToken) || fileToken.length < 24) {
    fail('FILE_TOKEN_SECRET must be a strong unique value (24+ chars)');
  } else ok('FILE_TOKEN_SECRET looks strong');

  if (nodeEnv === 'production' && !clientUrl) {
    fail('CLIENT_URL is required in production');
  } else if (clientUrl) ok(`CLIENT_URL=${clientUrl}`);
  else ok('CLIENT_URL optional in non-production');

  if (process.env.SERVE_CLIENT === 'true' || process.env.SERVE_CLIENT === '1') {
    ok('SERVE_CLIENT enabled (single-container SPA + API)');
  } else {
    console.log('· SERVE_CLIENT not set (OK for API-only; set true on Render Docker)');
  }

  if (process.env.SEED_ON_EMPTY === 'true' || process.env.SEED_ON_EMPTY === '1') {
    ok('SEED_ON_EMPTY enabled (demo data on empty DB)');
  } else {
    console.log('· SEED_ON_EMPTY off (run npm run seed after first deploy if needed)');
  }

  if (process.env.STORAGE_DRIVER === 's3') {
    const hasS3 = process.env.S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
    if (!hasS3) fail('STORAGE_DRIVER=s3 but AWS/S3 env incomplete');
    else ok('S3 storage configured');
  } else {
    console.log('· STORAGE_DRIVER=local (ephemeral on free Render — prefer S3 for resumes)');
  }

  if (mongo && process.exitCode !== 1) {
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(mongo, { serverSelectionTimeoutMS: 8000 });
      ok(`MongoDB reachable (${mongoose.connection.name || 'db'})`);
      await mongoose.disconnect();
    } catch (err) {
      fail(`MongoDB connection failed: ${err.message}`);
    }
  }

  console.log('');
  if (process.exitCode === 1) {
    console.error('Preflight failed — fix the items above before deploying.');
    process.exit(1);
  }
  console.log('Preflight passed. Next: follow docs/16-deploy-checklist.md on Render.');
}

main().catch((err) => {
  console.error('Preflight crashed:', err.message);
  process.exit(1);
});
