import { db } from './index.js';

async function verify() {
  const schoolCount = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM schools');
  const teacherCount = await db.get<{ cnt: number }>("SELECT COUNT(*) as cnt FROM users WHERE role = 'teacher'");
  const studentCount = await db.get<{ cnt: number }>("SELECT COUNT(*) as cnt FROM users WHERE role = 'student'");
  const classCount = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM classes');
  const classStudentCount = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM class_students');
  const orphanTeachers = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE u.role = "teacher" AND s.id IS NULL');
  const orphanStudents = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE u.role = "student" AND s.id IS NULL');
  const orphanClasses = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM classes c LEFT JOIN schools s ON c.school_id = s.id WHERE s.id IS NULL');

  console.log('--- Data verification ---');
  console.log(`Schools: ${schoolCount?.cnt ?? 0} (expected 4)`);
  console.log(`Teachers: ${teacherCount?.cnt ?? 0} (expected 16)`);
  console.log(`Students: ${studentCount?.cnt ?? 0} (expected 128)`);
  console.log(`Classes: ${classCount?.cnt ?? 0} (expected 64)`);
  console.log(`Class-Student links: ${classStudentCount?.cnt ?? 0} (expected 128)`);
  console.log(`Orphan teachers: ${orphanTeachers?.cnt ?? 0}`);
  console.log(`Orphan students: ${orphanStudents?.cnt ?? 0}`);
  console.log(`Orphan classes: ${orphanClasses?.cnt ?? 0}`);

  const expected = { schools: 4, teachers: 16, students: 128, classes: 64, links: 128 };
  const ok =
    (schoolCount?.cnt ?? 0) >= expected.schools &&
    (teacherCount?.cnt ?? 0) >= expected.teachers &&
    (studentCount?.cnt ?? 0) >= expected.students &&
    (classCount?.cnt ?? 0) >= expected.classes &&
    (classStudentCount?.cnt ?? 0) >= expected.links &&
    (orphanTeachers?.cnt ?? 0) === 0 &&
    (orphanStudents?.cnt ?? 0) === 0 &&
    (orphanClasses?.cnt ?? 0) === 0;

  if (ok) {
    console.log('✅ All data counts and relationships are correct.');
  } else {
    console.log('❌ Data verification failed.');
    process.exit(1);
  }
}

verify().catch((err) => {
  console.error('Verify failed:', err);
  process.exit(1);
});
