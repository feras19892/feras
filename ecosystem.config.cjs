const path = require('path');
const root = __dirname;

module.exports = {
  apps: [
    {
      name: 'api',
      script: path.join(root, 'node_modules/tsx/dist/cli.mjs'),
      args: 'src/index.ts',
      cwd: path.join(root, 'apps/api'),
    },
    {
      name: 'web',
      script: path.join(root, 'node_modules/vite/bin/vite.js'),
      args: 'preview --host --port 5173',
      cwd: path.join(root, 'apps/web'),
    },
    {
      name: 'tunnel',
      script: 'tmp/ngrok-runner.cjs',
      cwd: root,
    },
  ],
}
