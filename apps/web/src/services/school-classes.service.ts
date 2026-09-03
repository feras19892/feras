import { fetchJson } from './http';
import type { SchoolClass, SchoolClassDetailResult } from './school.service';

export async function getSchoolClasses() {
  return fetchJson<{ success: boolean; classes: SchoolClass[] }>('/api/school/classes');
}

export async function getSchoolClassDetail(classId: string) {
  return fetchJson<SchoolClassDetailResult>(`/api/school/classes/${classId}/detail`);
}

export async function updateSchoolClass(classId: string, name: string, description?: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/classes/${classId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
}

export async function addStudentToSchoolClass(classId: string, studentId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/classes/${classId}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId }),
  });
}

export async function removeStudentFromSchoolClass(classId: string, studentId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/classes/${classId}/students/${studentId}`, {
    method: 'DELETE',
  });
}
