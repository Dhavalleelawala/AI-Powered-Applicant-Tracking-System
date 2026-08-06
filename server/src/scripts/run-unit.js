const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const unitDir = path.join(__dirname, 'unit');
const files = fs
  .readdirSync(unitDir)
  .filter((name) => name.endsWith('.test.js'))
  .map((name) => path.join(unitDir, name));

if (!files.length) {
  console.error('No unit tests found in', unitDir);
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(result.status || 0);
