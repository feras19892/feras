const { spawn } = require('child_process');
const child = spawn('node', ['--import', 'tsx', '--watch', 'src/index.ts'], { cwd: 'apps/api', stdio: 'inherit' });
child.on('exit', (code) => process.exit(code));
