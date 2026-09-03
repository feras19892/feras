import { fetchJson } from './http';

export interface Schedule {
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

export interface RecurringEvent {
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
}): Promise<{ success: boolean; id?: number; message?: string }> {
  try {
    return await fetchJson('/api/schedules/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create schedule' };
  }
}

export async function getSchedulesByClass(classId: number): Promise<{ success: boolean; schedules?: Schedule[]; message?: string }> {
  try {
    return await fetchJson(`/api/schedules/schedule/class/${classId}`);
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to load schedules' };
  }
}

export async function getSchedulesByTeacher(): Promise<{ success: boolean; schedules?: Schedule[]; message?: string }> {
  try {
    return await fetchJson('/api/schedules/schedule/teacher');
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to load schedules' };
  }
}

export async function updateSchedule(id: number, data: {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  subject?: string;
  room?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    return await fetchJson(`/api/schedules/schedule/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update schedule' };
  }
}

export async function deleteSchedule(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    return await fetchJson(`/api/schedules/schedule/${id}`, { method: 'DELETE' });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete schedule' };
  }
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
}): Promise<{ success: boolean; id?: number; message?: string }> {
  try {
    return await fetchJson('/api/schedules/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create event' };
  }
}

export async function getRecurringEventsByClass(classId: number): Promise<{ success: boolean; events?: RecurringEvent[]; message?: string }> {
  try {
    return await fetchJson(`/api/schedules/event/class/${classId}`);
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to load events' };
  }
}

export async function getRecurringEventsByTeacher(): Promise<{ success: boolean; events?: RecurringEvent[]; message?: string }> {
  try {
    return await fetchJson('/api/schedules/event/teacher');
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to load events' };
  }
}

export async function updateRecurringEvent(id: number, data: {
  title?: string;
  description?: string;
  recurrence_type?: string;
  recurrence_value?: number;
  end_date?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    return await fetchJson(`/api/schedules/event/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update event' };
  }
}

export async function deleteRecurringEvent(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    return await fetchJson(`/api/schedules/event/${id}`, { method: 'DELETE' });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete event' };
  }
}

export function getDayName(dayOfWeek: number): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[dayOfWeek] || '';
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'م' : 'ص';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
