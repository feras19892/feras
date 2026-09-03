import { db } from '../../db/index.js';

export interface ScheduleRow {
  id: number;
  class_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject: string | null;
  room: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringEventRow {
  id: number;
  class_id: number | null;
  event_type: string;
  title: string;
  description: string | null;
  recurrence_type: string;
  recurrence_value: number | null;
  start_date: string;
  end_date: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export async function createSchedule(data: {
  class_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject?: string;
  room?: string;
  created_by: number;
}): Promise<{ id: number }> {
  const result = await db.run(
    `INSERT INTO schedules (class_id, day_of_week, start_time, end_time, subject, room, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.class_id, data.day_of_week, data.start_time, data.end_time,
    data.subject || null, data.room || null, data.created_by,
  );
  return { id: Number(result.lastID) };
}

export async function getSchedulesByClass(classId: number): Promise<ScheduleRow[]> {
  return db.all<ScheduleRow[]>(
    `SELECT * FROM schedules WHERE class_id = ? ORDER BY day_of_week, start_time`,
    classId,
  );
}

export async function getSchedulesByTeacher(teacherId: number): Promise<ScheduleRow[]> {
  return db.all<ScheduleRow[]>(
    `SELECT s.* FROM schedules s
     JOIN classes c ON s.class_id = c.id
     WHERE c.teacher_id = ?
     ORDER BY s.day_of_week, s.start_time`,
    teacherId,
  );
}

export async function updateSchedule(id: number, data: {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  subject?: string;
  room?: string;
}): Promise<void> {
  const updates: string[] = [];
  const params: any[] = [];

  if (data.day_of_week !== undefined) {
    updates.push('day_of_week = ?');
    params.push(data.day_of_week);
  }
  if (data.start_time !== undefined) {
    updates.push('start_time = ?');
    params.push(data.start_time);
  }
  if (data.end_time !== undefined) {
    updates.push('end_time = ?');
    params.push(data.end_time);
  }
  if (data.subject !== undefined) {
    updates.push('subject = ?');
    params.push(data.subject);
  }
  if (data.room !== undefined) {
    updates.push('room = ?');
    params.push(data.room);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  await db.run(
    `UPDATE schedules SET ${updates.join(', ')} WHERE id = ?`,
    ...params,
  );
}

export async function deleteSchedule(id: number): Promise<void> {
  await db.run('DELETE FROM schedules WHERE id = ?', id);
}

export async function createRecurringEvent(data: {
  class_id?: number;
  event_type: string;
  title: string;
  description?: string;
  recurrence_type: string;
  recurrence_value?: number;
  start_date: string;
  end_date?: string;
  created_by: number;
}): Promise<{ id: number }> {
  const result = await db.run(
    `INSERT INTO recurring_events (class_id, event_type, title, description, recurrence_type, recurrence_value, start_date, end_date, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.class_id || null, data.event_type, data.title, data.description || null,
    data.recurrence_type, data.recurrence_value || null, data.start_date,
    data.end_date || null, data.created_by,
  );
  return { id: Number(result.lastID) };
}

export async function getRecurringEventsByClass(classId: number): Promise<RecurringEventRow[]> {
  return db.all<RecurringEventRow[]>(
    `SELECT * FROM recurring_events WHERE class_id = ? ORDER BY start_date`,
    classId,
  );
}

export async function getRecurringEventsByTeacher(teacherId: number): Promise<RecurringEventRow[]> {
  return db.all<RecurringEventRow[]>(
    `SELECT r.* FROM recurring_events r
     JOIN classes c ON r.class_id = c.id
     WHERE c.teacher_id = ?
     ORDER BY r.start_date`,
    teacherId,
  );
}

export async function updateRecurringEvent(id: number, data: {
  title?: string;
  description?: string;
  recurrence_type?: string;
  recurrence_value?: number;
  end_date?: string;
}): Promise<void> {
  const updates: string[] = [];
  const params: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description);
  }
  if (data.recurrence_type !== undefined) {
    updates.push('recurrence_type = ?');
    params.push(data.recurrence_type);
  }
  if (data.recurrence_value !== undefined) {
    updates.push('recurrence_value = ?');
    params.push(data.recurrence_value);
  }
  if (data.end_date !== undefined) {
    updates.push('end_date = ?');
    params.push(data.end_date);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  await db.run(
    `UPDATE recurring_events SET ${updates.join(', ')} WHERE id = ?`,
    ...params,
  );
}

export async function deleteRecurringEvent(id: number): Promise<void> {
  await db.run('DELETE FROM recurring_events WHERE id = ?', id);
}
