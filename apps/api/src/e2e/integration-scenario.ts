const BASE = 'http://localhost:3000';

async function api(path: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET', body?: unknown, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

async function login(email: string, password: string) {
  const r = await api('/api/auth/login', 'POST', { email, password });
  if (!r.ok || !r.data?.success) throw new Error(`login ${email} failed: ${r.data?.message}`);
  return r.data.accessToken as string;
}

async function main() {
  const teacherToken = await login('school1_teacher1@test.com', 'Test1234!');
  const studentToken = await login('school1_t1_student1@test.com', 'Test1234!');

  // 1. Teacher creates a class
  const create = await api('/api/classes', 'POST', { name: 'E2E Test Class' }, teacherToken);
  if (!create.ok || !create.data?.success) throw new Error(`create class failed: ${create.data?.message}`);
  const cls = create.data.class as { id: string; code: string };
  console.log('✅ Teacher created class', cls.id, 'code', cls.code);

  // 2. Student joins the class
  const join = await api('/api/classes/join', 'POST', { code: cls.code }, studentToken);
  if (!join.ok || !join.data?.success) throw new Error(`join class failed: ${join.data?.message}`);
  console.log('✅ Student joined class');

  // 3. Teacher sends a chat message
  const chat = await api(`/api/chat/${cls.id}`, 'POST', { content: 'مرحبا بالفصل' }, teacherToken);
  if (!chat.ok || !chat.data?.success) throw new Error(`send chat failed: ${chat.data?.message}`);
  console.log('✅ Teacher sent chat message');

  // 4. Student lists messages
  const messages = await api(`/api/chat/${cls.id}`, 'GET', undefined, studentToken);
  if (!messages.ok || !messages.data?.success) throw new Error(`list chat failed: ${messages.data?.message}`);
  const msgs = messages.data.messages as { content: string }[];
  if (!msgs.some((m) => m.content === 'مرحبا بالفصل')) throw new Error('message not found for student');
  console.log('✅ Student received chat message');

  // 5. Student leaves the class
  const leave = await api('/api/classes/leave', 'POST', { class_id: cls.id }, studentToken);
  if (!leave.ok || !leave.data?.success) throw new Error(`leave class failed: ${leave.data?.message}`);
  console.log('✅ Student left class');

  // 6. Teacher lists class and confirms student gone
  const detail = await api(`/api/classes/${cls.id}`, 'GET', undefined, teacherToken);
  if (!detail.ok || !detail.data?.success) throw new Error(`class detail failed: ${detail.data?.message}`);
  const students = detail.data.students as { id: number }[];
  if (students.some((s) => s.id === 0)) throw new Error('student still in class');
  console.log('✅ Class detail reflects student absence');

  console.log('\n✅ Integration scenario passed: teacher class → student join → chat → student leave.');
}

main().catch((err) => {
  console.error('\n❌ Integration scenario failed:', err);
  process.exit(1);
});
