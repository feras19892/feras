module.exports = {
  apps: [
    {
      name: 'api',
      cwd: 'apps/api',
      script: 'node_modules/.bin/tsx.CMD',
      args: ['src/index.ts'],
      interpreter: 'none',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'ngrok',
      script: 'ngrok.cmd',
      args: ['http', '3000', '--log=stdout'],
      interpreter: 'none',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      exp_backoff_restart_delay: 100,
    },
  ],
};
