import assert from 'node:assert/strict'
import { app } from '../index.js'
import { db, dbRun, dbGet } from '../db/index.js'
import { signAccessToken } from '../modules/auth/jwt.js'

async function tokenFor(payload: { sub: string; email: string; name: string; role: any; school_id?: number | null }) {
  return signAccessToken(payload)
}

async function fetchJson(path: string, token?: string) {
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await app.fetch(new Request(`http://localhost${path}`, { headers }))
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

const plan = await dbGet<{ id: number }>('SELECT id FROM plans LIMIT 1')
const planId = plan?.id ?? 1

const schoolA = await dbRun(
  `INSERT INTO schools (email, name, password_hash, code, max_students, max_teachers, is_active)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  'school1@test.com', 'School A', 'x', 'SCH-A', 100, 20, 1,
)
const schoolB = await dbRun(
  `INSERT INTO schools (email, name, password_hash, code, max_students, max_teachers, is_active)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  'school2@test.com', 'School B', 'x', 'SCH-B', 100, 20, 1,
)

const teacherA = await dbRun(
  `INSERT INTO users (email, name, password_hash, role, email_verified_at, school_id)
   VALUES (?, ?, ?, ?, ?, ?)`,
  'teacherA@test.com', 'Teacher A', 'x', 'teacher', new Date().toISOString(), schoolA.lastID,
)
const teacherB = await dbRun(
  `INSERT INTO users (email, name, password_hash, role, email_verified_at, school_id)
   VALUES (?, ?, ?, ?, ?, ?)`,
  'teacherB@test.com', 'Teacher B', 'x', 'teacher', new Date().toISOString(), schoolB.lastID,
)

await dbRun(
  'INSERT INTO subscriptions (owner_id, owner_type, plan_id, status, starts_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
  teacherA.lastID, 'user', planId, 'TRIAL', new Date().toISOString(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
)
await dbRun(
  'INSERT INTO subscriptions (owner_id, owner_type, plan_id, status, starts_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
  teacherB.lastID, 'user', planId, 'TRIAL', new Date().toISOString(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
)

const CLASS_A = 'class-a'
const CLASS_B = 'class-b'

await dbRun(
  `INSERT INTO classes (id, name, code, teacher_id, is_active) VALUES (?, ?, ?, ?, ?)`,
  CLASS_A, 'Class A', 'COD-A', teacherA.lastID, 1,
)
await dbRun(
  `INSERT INTO classes (id, name, code, teacher_id, is_active) VALUES (?, ?, ?, ?, ?)`,
  CLASS_B, 'Class B', 'COD-B', teacherB.lastID, 1,
)

const studentA = await dbRun(
  `INSERT INTO users (email, name, password_hash, role, email_verified_at, school_id)
   VALUES (?, ?, ?, ?, ?, ?)`,
  'studentA@test.com', 'Student A', 'x', 'student', new Date().toISOString(), schoolA.lastID,
)
await dbRun(
  'INSERT INTO subscriptions (owner_id, owner_type, plan_id, status, starts_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
  studentA.lastID, 'user', planId, 'TRIAL', new Date().toISOString(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
)

await dbRun(
  `INSERT INTO experiment_reports (student_id, class_id, experiment_type, experiment_name, readings, status, submitted_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  studentA.lastID, CLASS_A, 'physics', 'Report A', '[]', 'submitted', new Date().toISOString(),
)
await dbRun(
  `INSERT INTO experiment_reports (student_id, class_id, experiment_type, experiment_name, readings, status, submitted_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  studentA.lastID, CLASS_B, 'physics', 'Report B', '[]', 'submitted', new Date().toISOString(),
)

const tokenA = await tokenFor({ sub: String(teacherA.lastID), email: 'teacherA@test.com', name: 'Teacher A', role: 'teacher', school_id: schoolA.lastID })
const tokenB = await tokenFor({ sub: String(teacherB.lastID), email: 'teacherB@test.com', name: 'Teacher B', role: 'teacher', school_id: schoolB.lastID })

// Teacher A should see only the report in class-a
const listA = await fetchJson('/api/reports', tokenA)
assert.equal(listA.status, 200, `Teacher A list failed: ${JSON.stringify(listA.body)}`)
assert.ok(listA.body.reports.some((r: any) => r.experiment_name === 'Report A'), 'Teacher A should see Report A')
assert.ok(!listA.body.reports.some((r: any) => r.experiment_name === 'Report B'), 'Teacher A should NOT see Report B')

// Teacher B should see only the report in class-b
const listB = await fetchJson('/api/reports', tokenB)
assert.equal(listB.status, 200, `Teacher B list failed: ${JSON.stringify(listB.body)}`)
assert.ok(listB.body.reports.some((r: any) => r.experiment_name === 'Report B'), 'Teacher B should see Report B')
assert.ok(!listB.body.reports.some((r: any) => r.experiment_name === 'Report A'), 'Teacher B should NOT see Report A')

console.log('✅ Reports are isolated by class/teacher')
