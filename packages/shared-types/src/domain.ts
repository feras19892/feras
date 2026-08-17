export interface ApprovalRequest {
  id: number;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'auto_escalated';
  requester_type: string;
  requester_id: number;
  requester_name: string;
  approver_type: string;
  approver_id: number | null;
  target_user_id: number;
  target_user_name: string;
  class_id: string | null;
  report_id: number | null;
  description: string;
  proposed_grade: number | null;
  severity: 'low' | 'normal' | 'high' | 'critical' | null;
  school_id: number | null;
  response: string | null;
  escalation_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: number;
  scope: 'class' | 'school' | 'global';
  class_id: string | null;
  school_id: number | null;
  title: string;
  message: string;
  created_by: number;
  created_by_name: string;
  created_by_role: string;
  is_pinned: number;
  created_at: string;
}

export interface Deadline {
  id: number;
  class_id: string;
  title: string;
  due_date: string;
  created_by: number;
  created_at: string;
}

export interface Penalty {
  id: number;
  student_id: number;
  given_by: number;
  class_id: string | null;
  type: 'penalty' | 'reward';
  reason: string;
  points: number;
  dismissed: number;
  created_at: string;
}

export interface Rating {
  id: number;
  target_id: number;
  target_type: 'teacher' | 'school' | 'student' | 'class';
  rater_id: number;
  rater_role: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface PlagiarismFlag {
  id: number;
  class_id: string;
  experiment_name: string;
  student_a_id: number;
  student_b_id: number;
  similarity_score: number;
  status: 'pending' | 'confirmed' | 'dismissed';
  detected_by: number;
  created_at: string;
}

export interface Feedback {
  id: number;
  user_id: number;
  user_name: string;
  type: 'bug' | 'feature' | 'content' | 'other';
  message: string;
  experiment_id: string | null;
  experiment_name: string | null;
  rating: number | null;
  school_id: number | null;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: string;
}
