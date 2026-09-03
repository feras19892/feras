const BASE = 'http://localhost:3000';

async function health() {
  const res = await fetch(`${BASE}/api/health`);
  if (!res.ok) throw new Error('health failed');
  return await res.json();
}

async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`login ${email} failed: ${data.message}`);
  return data;
}

async function main() {
  const h = await health();
  console.log('health:', h);

  const teacher = await login('school1_teacher1@test.com', 'Test1234!');
  console.log('teacher login ok:', teacher.user?.email, teacher.user?.role);

  const student = await login('school1_t1_student1@test.com', 'Test1234!');
  console.log('student login ok:', student.user?.email, student.user?.role);

  console.log('✅ Login smoke passed.');
}

main().catch((err) => {
  console.error('❌ Smoke test failed:', err);
  process.exit(1);
});
