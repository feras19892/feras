import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';

export interface Announcement {
  id: number;
  author_type: string;
  author_id: number;
  author_name: string;
  scope: string;
  class_id: string | null;
  school_id: number | null;
  title: string;
  content: string;
  is_pinned: number;
  expires_at: string | null;
  created_at: string;
}

export async function createAnnouncement(data: {
  author_type: 'teacher' | 'school' | 'admin';
  author_id: number;
  author_name: string;
  scope: 'class' | 'school' | 'global';
  class_id?: string;
  school_id?: number;
  title: string;
  content: string;
  is_pinned?: boolean;
  expires_at?: string;
}): Promise<Announcement> {
  const result = await db.run(
    `INSERT INTO announcements (author_type, author_id, author_name, scope, class_id, school_id, title, content, is_pinned, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.author_type, data.author_id, data.author_name, data.scope,
    data.class_id || null, data.school_id || null,
    data.title, data.content, data.is_pinned ? 1 : 0, data.expires_at || null,
  );

  const announcement = await db.get<Announcement>(
    `SELECT * FROM announcements WHERE id = ?`, Number(result.lastID),
  );

  // Send notifications based on scope
  if (data.scope === 'class' && data.class_id) {
    const students = await db.all<{ student_id: number }[]>(
      `SELECT student_id FROM class_students WHERE class_id = ?`, data.class_id,
    );
    for (const s of students) {
      await createNotification({
        user_id: s.student_id,
        type: 'announcement',
        title: `📢 ${data.title}`,
        message: data.content.slice(0, 100),
        class_id: data.class_id,
      });
    }
  } else if (data.scope === 'school' && data.school_id) {
    const users = await db.all<{ id: number }[]>(
      `SELECT id FROM users WHERE school_id = ? AND blocked_at IS NULL`, data.school_id,
    );
    for (const u of users) {
      await createNotification({
        user_id: u.id,
        type: 'announcement',
        title: `📢 ${data.title}`,
        message: data.content.slice(0, 100),
      });
    }
  } else if (data.scope === 'global') {
    const users = await db.all<{ id: number }[]>(
      `SELECT id FROM users WHERE blocked_at IS NULL`,
    );
    for (const u of users) {
      await createNotification({
        user_id: u.id,
        type: 'announcement',
        title: `📢 ${data.title}`,
        message: data.content.slice(0, 100),
      });
    }
  }

  return announcement!;
}

export async function getClassAnnouncements(classId: string): Promise<Announcement[]> {
  return db.all(
    `SELECT * FROM announcements WHERE scope = 'class' AND class_id = ? AND (expires_at IS NULL OR expires_at > datetime('now')) ORDER BY is_pinned DESC, created_at DESC`,
    classId,
  );
}

export async function getSchoolAnnouncements(schoolId: number): Promise<Announcement[]> {
  return db.all(
    `SELECT * FROM announcements WHERE scope = 'school' AND school_id = ? AND (expires_at IS NULL OR expires_at > datetime('now')) ORDER BY is_pinned DESC, created_at DESC`,
    schoolId,
  );
}

export async function getGlobalAnnouncements(): Promise<Announcement[]> {
  return db.all(
    `SELECT * FROM announcements WHERE scope = 'global' AND (expires_at IS NULL OR expires_at > datetime('now')) ORDER BY is_pinned DESC, created_at DESC`,
  );
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  return db.all(
    `SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC LIMIT 200`,
  );
}

export async function getStudentAnnouncements(studentId: number): Promise<Announcement[]> {
  // Get class announcements for student's classes + school announcements + global
  const classIds = await db.all<{ class_id: string }[]>(
    `SELECT class_id FROM class_students WHERE student_id = ?`, studentId,
  );
  const student = await db.get<{ school_id: number | null }>(`SELECT school_id FROM users WHERE id = ?`, studentId);

  let results: Announcement[] = [];

  for (const c of classIds) {
    const anns = await getClassAnnouncements(c.class_id);
    results.push(...anns);
  }

  if (student?.school_id) {
    const schoolAnns = await getSchoolAnnouncements(student.school_id);
    results.push(...schoolAnns);
  }

  const globalAnns = await getGlobalAnnouncements();
  results.push(...globalAnns);

  // Sort by pinned then date
  results.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return b.is_pinned - a.is_pinned;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return results;
}

export async function deleteAnnouncement(id: number, authorId: number, authorType: string): Promise<{ success: boolean; message?: string }> {
  const ann = await db.get<{ author_id: number; author_type: string }>(`SELECT author_id, author_type FROM announcements WHERE id = ?`, id);
  if (!ann) return { success: false, message: 'الإعلان غير موجود' };
  // Only author or admin can delete
  if (ann.author_id !== authorId && authorType !== 'admin') {
    return { success: false, message: 'غير مصرح' };
  }
  await db.run(`DELETE FROM announcements WHERE id = ?`, id);
  return { success: true };
}
