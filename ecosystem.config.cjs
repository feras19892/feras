module.exports = {
  apps: [
    {
      name: 'api',
      script: 'C:/Users/feras/Desktop/feras/node_modules/tsx/dist/cli.mjs',
      args: 'src/index.ts',
      cwd: 'C:/Users/feras/Desktop/feras/apps/api',
    },
    {
      name: 'web',
      script: 'C:/Users/feras/Desktop/feras/node_modules/vite/bin/vite.js',
      args: 'preview --host --port 5173',
      cwd: 'C:/Users/feras/Desktop/feras/apps/web',
    },
    {
      name: 'tunnel',
      script: 'tmp/ngrok-runner.cjs',
      cwd: 'C:/Users/feras/Desktop/feras',
    },
  ],
}
