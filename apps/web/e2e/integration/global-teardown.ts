import fs from 'fs';
import path from 'path';

const PID_FILE = path.join(process.cwd(), 'e2e', 'integration', '.api-pid');

export default async function globalTeardown() {
  if (!fs.existsSync(PID_FILE)) return;

  const pid = Number(fs.readFileSync(PID_FILE, 'utf-8'));
  fs.unlinkSync(PID_FILE);

  if (!pid) return;

  try {
    process.kill(pid);
  } catch {
    // may already be stopped
  }
}
