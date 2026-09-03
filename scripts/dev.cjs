const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const api = spawn('pnpm', ['--filter', '@my-modern-app/api', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

const web = spawn('pnpm', ['--filter', '@my-modern-app/web', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

let closedCount = 0;
const onChildClose = () => {
  closedCount += 1;
  if (closedCount === 2) {
    process.exit(0);
  }
};

api.on('close', onChildClose);
web.on('close', onChildClose);

process.on('SIGINT', () => {
  api.kill('SIGINT');
  web.kill('SIGINT');
});

process.on('SIGTERM', () => {
  api.kill('SIGTERM');
  web.kill('SIGTERM');
});
