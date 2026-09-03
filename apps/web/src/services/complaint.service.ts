import { fetchJson } from './http';

export interface Complaint {
  id: number;
  from_user_id: number;
  from_role: string;
  from_name: string;
  target_role: string;
  target_id: number | null;
  category: string;
  subject: string;
  body: string;
  priority: string;
  status: string;
  assigned_to: number | null;
  school_id: number | null;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplaintStats {
  total: number;
  open: number;
  urgent: number;
  resolved: number;
}

export interface ComplaintTargets {
  teachers?: { id: number; name: string }[];
  school?: { id: number } | null;
  admin?: boolean;
}

export async function getComplaints() {
  return fetchJson<{ success: boolean; complaints: Complaint[] }>('/api/complaints');
}

export async function getComplaintStats() {
  return fetchJson<{ success: boolean; stats: ComplaintStats }>('/api/complaints/stats');
}

export async function getComplaintTargets(signal?: AbortSignal) {
  const opts = signal ? { signal } : undefined;
  return fetchJson<{ success: boolean; targets: ComplaintTargets }>('/api/complaints/targets', opts);
}

export interface ComplaintLogEntry {
  id: number;
  complaint_id: number;
  action: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: number | null;
  actor_name: string | null;
  note: string | null;
  created_at: string;
}

export async function getComplaintLog(id: number) {
  return fetchJson<{ success: boolean; log: ComplaintLogEntry[] }>(`/api/complaints/${id}/log`);
}

export async function createComplaint(data: {
  targetRole: string;
  targetId?: number | null;
  category: string;
  subject: string;
  body: string;
  priority?: string;
}, signal?: AbortSignal) {
  return fetchJson<{ success: boolean; id: number; message?: string }>('/api/complaints', {
    method: 'POST',
    body: JSON.stringify(data),
    ...(signal ? { signal } : {}),
  });
}

export async function updateComplaintStatus(id: number, status: string, note?: string) {
  return fetchJson<{ success: boolean }>(`/api/complaints/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}
