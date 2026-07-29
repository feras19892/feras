import { fetchJson } from './http';

export interface ApprovalRequest {
  id: number;
  type: 'penalty' | 'grade_change' | 'student_removal' | 'grade_appeal';
  requester_type: string;
  requester_id: number;
  requester_name: string;
  approver_type: string;
  approver_id: number | null;
  target_user_id: number;
  target_user_name: string;
  class_id: string | null;
  report_id: number | null;
  school_id: number | null;
  title: string;
  description: string;
  proposed_grade: number | null;
  severity: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'auto_escalated';
  approver_response: string | null;
  approver_responded_at: string | null;
  approver_name: string | null;
  escalated_to: string | null;
  escalated_at: string | null;
  escalation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export async function createApproval(data: {
  type: string;
  approver_type: string;
  approver_id?: number;
  target_user_id: number;
  target_user_name: string;
  class_id?: string;
  report_id?: number;
  school_id?: number;
  title: string;
  description: string;
  proposed_grade?: number;
  severity?: string;
}) {
  return fetchJson<{ success: boolean; id?: number; message?: string }>('/api/approvals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getMyApprovals() {
  return fetchJson<{ success: boolean; approvals: ApprovalRequest[] }>('/api/approvals/mine');
}

export async function getPendingApprovals() {
  return fetchJson<{ success: boolean; pending: ApprovalRequest[] }>('/api/approvals/pending');
}

export async function getApprovalById(id: number) {
  return fetchJson<{ success: boolean; approval: ApprovalRequest }>(`/api/approvals/${id}`);
}

export async function approveApproval(id: number, response: string) {
  return fetchJson<{ success: boolean; action?: string; message?: string }>(`/api/approvals/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response }),
  });
}

export async function rejectApproval(id: number, response: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/approvals/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response }),
  });
}

export async function escalateApproval(id: number, reason: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/approvals/${id}/escalate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
}

// School-specific
export async function getSchoolPendingApprovals() {
  return fetchJson<{ success: boolean; pending: ApprovalRequest[] }>('/api/approvals/school/pending');
}

export async function schoolApprove(id: number, response: string) {
  return fetchJson<{ success: boolean; action?: string; message?: string }>(`/api/approvals/school/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response }),
  });
}

export async function schoolReject(id: number, response: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/approvals/school/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response }),
  });
}

// Admin-specific
export async function adminGetAllApprovals() {
  return fetchJson<{ success: boolean; approvals: ApprovalRequest[] }>('/api/approvals/admin/all');
}

export async function adminApprove(id: number, response: string) {
  return fetchJson<{ success: boolean; action?: string; message?: string }>(`/api/approvals/admin/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response }),
  });
}

export async function adminReject(id: number, response: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/approvals/admin/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response }),
  });
}
