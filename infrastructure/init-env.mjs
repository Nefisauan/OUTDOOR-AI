import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const paths = ['.env', 'backend/.env'];
if (paths.some(path => existsSync(path))) {
  console.error('Environment files already exist. Preserve them and configure any missing file manually.');
  process.exitCode = 1;
} else {
  const password = randomBytes(24).toString('hex');
  writeFileSync('.env', 'POSTGRES_USER=outdoor\nPOSTGRES_DB=outdoor\nPOSTGRES_PASSWORD=' + password + '\n', { mode: 0o600, flag: 'wx' });
  writeFileSync('backend/.env', 'DATABASE_URL=postgresql://outdoor:' + password + '@127.0.0.1:5432/outdoor\nPORT=3000\nHOST=127.0.0.1\nNODE_ENV=development\n', { mode: 0o600, flag: 'wx' });
  console.log('Created ignored development environment files with a random database password.');
}
