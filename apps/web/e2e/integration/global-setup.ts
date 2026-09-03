import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { setTimeout } from 'timers/promises';

const PID_FILE = path.join(process.cwd(), 'e2e', 'integration', '.api-pid');
const DB_FILE = path.resolve(process.cwd(), '..', 'api', 'data', 'e2e-test.db');

async function isApiHealthy() {
  try {
    const res = await fetch('http://localhost:3000/api/health');
    return res.ok;
  } catch {
    return false;
  }
}

function runSeed() {
  return new Promise<void>((resolve, reject) => {
    const seed = spawn('pnpm exec tsx src/e2e/seed-e2e.ts', {
      cwd: path.resolve(process.cwd(), '..', 'api'),
      env: { ...process.env, DB_PATH: DB_FILE, NODE_ENV: 'test', JWT_SECRET: 'e2e-jwt-secret-must-be-at-least-32-characters' },
      stdio: 'inherit',
      shell: true,
    });

    seed.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Seed exited with code ${code}`));
    });
  });
}

export default async function globalSetup() {
  if (await isApiHealthy()) {
    console.log('API already running; Playwright will reuse it.');
    return;
  }

  if (fs.existsSync(DB_FILE)) fs.rmSync(DB_FILE);

  await runSeed();

  const api = spawn('pnpm exec tsx src/index.ts', {
    cwd: path.resolve(process.cwd(), '..', 'api'),
    detached: false,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, DB_PATH: DB_FILE, NODE_ENV: 'test', JWT_SECRET: 'e2e-jwt-secret-must-be-at-least-32-characters' },
  });

  fs.mkdirSync(path.dirname(PID_FILE), { recursive: true });
  fs.writeFileSync(PID_FILE, String(api.pid));

  for (let i = 0; i < 50; i++) {
    if (await isApiHealthy()) return;
    await setTimeout(500);
  }

  throw new Error('API did not start within 25s');
}
