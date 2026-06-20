export interface ClassInfo {
  id: string;
  name: string;
  code: string;
  role: 'student' | 'teacher';
}

export interface ClassStudent {
  class_id: string;
  student_id: number;
  joined_at: string;
}

export interface JoinClassRequest {
  code: string;
  student_id?: number;
}

export interface CreateClassRequest {
  name: string;
  teacher_id?: number;
}
