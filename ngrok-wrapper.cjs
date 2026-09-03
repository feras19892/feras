const { spawn } = require('child_process');
const child = spawn('C:\\Users\\feras\\AppData\\Roaming\\npm\\ngrok.cmd', ['http', '3000', '--log=stdout'], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code));
