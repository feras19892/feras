import { randomUUID } from 'crypto';
import { db } from '../../db/index.js';
import { runMigrations } from '../../db/index.js';
import { hashPassword } from './crypto.js';

const SCHOOL_COUNT = 2;
const TEACHERS_PER_SCHOOL = 2;
const STUDENTS_PER_TEACHER = 4;
const CLASSES_PER_TEACHER = 4;
const STUDENTS_PER_CLASS = 1;
const PASSWORD = 'Test1234!';

const CLASS_NAMES = ['الفيزياء', 'الكيمياء', 'الرياضيات', 'علم الأحياء'];
const CLASS_CODES = ['PHY', 'CHE', 'MATH', 'BIO'];

async function ensureUser(email: string, name: string, role: 'teacher' | 'student', schoolId: number) {
  const existing = await db.get<{ id: number }>('SELECT id FROM users WHERE email = ?', email);
  if (existing) return existing.id;

  const hash = await hashPassword(PASSWORD);
  const now = new Date().toISOString();
  const result = await db.run(
    'INSERT INTO users (email, name, password_hash, role, school_id, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    email,
    name,
    hash,
    role,
    schoolId,
    now,
    now,
    now
  );
  return result.lastID as number;
}

async function ensureSchool(index: number) {
  const email = `school${index}@test.com`;
  const code = `TEST${String(index).padStart(2, '0')}`;
  const name = `School ${index}`;

  const existing = await db.get<{ id: number }>('SELECT id FROM schools WHERE email = ?', email);
  if (existing) return existing.id;

  const hash = await hashPassword(PASSWORD);
  const now = new Date().toISOString();
  const result = await db.run(
    'INSERT INTO schools (email, name, password_hash, code, max_students, max_teachers, is_active, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    email,
    name,
    hash,
    code,
    100,
    20,
    1,
    now,
    now,
    now
  );
  return result.lastID as number;
}

async function ensureClass(name: string, code: string, teacherId: number, schoolId: number) {
  const existing = await db.get<{ id: string }>('SELECT id FROM classes WHERE code = ?', code);
  if (existing) return existing.id;

  const id = randomUUID();
  await db.run(
    'INSERT INTO classes (id, name, code, teacher_id, school_id, is_active, is_frozen, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    id,
    name,
    code,
    teacherId,
    schoolId,
    1,
    0,
    new Date().toISOString()
  );
  return id;
}

async function ensureClassStudent(classId: string, studentId: number) {
  await db.run(
    'INSERT OR IGNORE INTO class_students (class_id, student_id) VALUES (?, ?)',
    classId,
    studentId
  );
}

async function cleanData() {
  const adminEmail = process.env.ADMIN_EMAIL;
  await db.run('PRAGMA foreign_keys = OFF');
  await db.run('DELETE FROM class_students');
  await db.run('DELETE FROM classes');
  if (adminEmail) {
    await db.run('DELETE FROM users WHERE email != ?', adminEmail);
  } else {
    await db.run("DELETE FROM users WHERE role != 'admin'");
  }
  await db.run("DELETE FROM schools WHERE email NOT IN ('school1@test.com','school2@test.com')");
  await db.run('PRAGMA foreign_keys = ON');
}

async function seed() {
  await runMigrations();
  await cleanData();

  const accounts: { schools: any[]; teachers: any[]; students: any[]; classes: any[] } = {
    schools: [],
    teachers: [],
    students: [],
    classes: [],
  };

  for (let s = 1; s <= SCHOOL_COUNT; s++) {
    const schoolId = await ensureSchool(s);
    const schoolEmail = `school${s}@test.com`;
    const schoolCode = `TEST${String(s).padStart(2, '0')}`;
    accounts.schools.push({ email: schoolEmail, code: schoolCode });

    for (let t = 1; t <= TEACHERS_PER_SCHOOL; t++) {
      const teacherEmail = `school${s}_teacher${t}@test.com`;
      const teacherName = `School${s} Teacher${t}`;
      const teacherId = await ensureUser(teacherEmail, teacherName, 'teacher', schoolId);
      accounts.teachers.push({ email: teacherEmail, name: teacherName, school: s });

      const students: number[] = [];
      const studentAccounts = [];
      for (let u = 1; u <= STUDENTS_PER_TEACHER; u++) {
        const studentEmail = `school${s}_t${t}_student${u}@test.com`;
        const studentName = `School${s} T${t} Student${u}`;
        const studentId = await ensureUser(studentEmail, studentName, 'student', schoolId);
        students.push(studentId);
        studentAccounts.push({ email: studentEmail, name: studentName, teacher: t, school: s });
      }
      accounts.students.push(...studentAccounts);

      for (let c = 1; c <= CLASSES_PER_TEACHER; c++) {
        const classCode = `S${s}T${t}${CLASS_CODES[c - 1]}`;
        const className = CLASS_NAMES[c - 1];
        const classId = await ensureClass(className, classCode, teacherId, schoolId);
        accounts.classes.push({
          name: className,
          code: classCode,
          teacher: t,
          school: s,
          students: studentAccounts.slice((c - 1) * STUDENTS_PER_CLASS, c * STUDENTS_PER_CLASS).map((sa: any) => sa.email),
        });

        for (let i = 0; i < STUDENTS_PER_CLASS; i++) {
          const idx = (c - 1) * STUDENTS_PER_CLASS + i;
          if (students[idx]) {
            await ensureClassStudent(classId, students[idx]);
          }
        }
      }
    }
  }

  console.log('Seeded test data:', JSON.stringify(accounts, null, 2));
  console.log(`Summary: ${SCHOOL_COUNT} schools, ${SCHOOL_COUNT * TEACHERS_PER_SCHOOL} teachers, ${SCHOOL_COUNT * TEACHERS_PER_SCHOOL * STUDENTS_PER_TEACHER} students, ${SCHOOL_COUNT * TEACHERS_PER_SCHOOL * CLASSES_PER_TEACHER} classes.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
