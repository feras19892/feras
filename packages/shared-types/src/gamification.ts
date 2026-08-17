export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface StudentBadge {
  id: number;
  badge_id: number;
  student_id: number;
  awarded_by: number;
  awarded_by_role: string;
  awarded_at: string;
  badge?: Badge;
}

export interface LeaderboardEntry {
  student_id: number;
  student_name: string;
  total_points: number;
  badge_count: number;
  rank: number;
}
