const { exec } = require('child_process');
const child = exec('lt --port 5173', { cwd: 'C:/Users/feras/Desktop/feras' });
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on('exit', (code) => process.exit(code));
