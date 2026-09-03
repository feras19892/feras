import bcrypt from 'bcryptjs'
import { db, runMigrations } from '../db/index.js'

await runMigrations()

const teacherEmail = 'school1_teacher1@test.com'
const studentEmail = 'school1_t1_student1@test.com'

// Clean up any stale seed data from a previous run
await db.run(`DELETE FROM subscriptions WHERE owner_id IN (SELECT id FROM users WHERE email IN (?, ?))`, teacherEmail, studentEmail)
await db.run(`DELETE FROM users WHERE email IN (?, ?)`, teacherEmail, studentEmail)
await db.run(`DELETE FROM schools WHERE email = ?`, 'school1@test.com')

const passwordHash = bcrypt.hashSync('Test1234!', 10)

const plan = await db.run(
  `INSERT INTO plans (type, name, price_cents, billing_interval) VALUES (?, ?, ?, ?)`,
  'teacher',
  'E2E Plan',
  0,
  'month',
)
const planId = plan.lastID

const schoolPlan = await db.run(
  `INSERT INTO plans (type, name, price_cents, billing_interval) VALUES (?, ?, ?, ?)`,
  'school',
  'E2E School Plan',
  0,
  'month',
)
const schoolPlanId = schoolPlan.lastID

const teacher = await db.run(
  `INSERT INTO users (email, name, password_hash, role, email_verified_at)
   VALUES (?, ?, ?, ?, ?)`,
  'school1_teacher1@test.com',
  'School1 Teacher1',
  passwordHash,
  'teacher',
  new Date().toISOString(),
)

const student = await db.run(
  `INSERT INTO users (email, name, password_hash, role, email_verified_at)
   VALUES (?, ?, ?, ?, ?)`,
  'school1_t1_student1@test.com',
  'School1 T1 Student1',
  passwordHash,
  'student',
  new Date().toISOString(),
)

const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

await db.run(
  `INSERT INTO subscriptions (owner_id, owner_type, plan_id, status, starts_at, expires_at)
   VALUES (?, ?, ?, ?, ?, ?)`,
  teacher.lastID,
  'user',
  planId,
  'TRIAL',
  new Date().toISOString(),
  expiresAt,
)

await db.run(
  `INSERT INTO subscriptions (owner_id, owner_type, plan_id, status, starts_at, expires_at)
   VALUES (?, ?, ?, ?, ?, ?)`,
  student.lastID,
  'user',
  planId,
  'TRIAL',
  new Date().toISOString(),
  expiresAt,
)

const school = await db.run(
  `INSERT INTO schools (email, name, password_hash, code, max_students, max_teachers, is_active, email_verified_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  'school1@test.com',
  'School 1',
  passwordHash,
  'TEST01',
  100,
  20,
  1,
  new Date().toISOString(),
)

await db.run(
  `INSERT INTO subscriptions (owner_id, owner_type, plan_id, status, starts_at, expires_at)
   VALUES (?, ?, ?, ?, ?, ?)`,
  school.lastID,
  'school',
  schoolPlanId,
  'TRIAL',
  new Date().toISOString(),
  expiresAt,
)

console.log('[e2e] seed done: teacher', teacher.lastID, 'student', student.lastID, 'school', school.lastID)
