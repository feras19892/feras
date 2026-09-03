const { spawn } = require('child_process');
const child = spawn('C:\\Users\\feras\\AppData\\Roaming\\npm\\ngrok.cmd', ['http', '3000', '--domain=wafery-veristic-samiyah.ngrok-free.dev', '--log=stdout'], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code));
