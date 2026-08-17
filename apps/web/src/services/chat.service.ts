import { fetchJson } from './http';

export interface ClassMessage {
  id: number;
  class_id: string;
  user_id: number;
  user_name: string;
  user_role: string;
  content: string;
  is_flagged: number;
  flagged_reason: string | null;
  created_at: string;
}

export async function getClassMessages(classId: string) {
  return fetchJson<{ success: boolean; messages: ClassMessage[] }>(`/api/chat/${classId}`);
}

export async function sendClassMessage(classId: string, content: string) {
  return fetchJson<{
    success: boolean;
    message?: ClassMessage | string;
    flagged?: boolean;
    warning?: string;
    muted?: boolean;
  }>(`/api/chat/${classId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export async function deleteClassMessage(messageId: number) {
  return fetchJson<{ success: boolean }>(`/api/chat/msg/${messageId}`, { method: 'DELETE' });
}

export async function getUnreadChatCounts() {
  return fetchJson<{ success: boolean; counts: Record<string, number> }>(`/api/chat/unread-counts`);
}

export async function markChatRead(classId: string) {
  return fetchJson<{ success: boolean }>(`/api/chat/${classId}/read`, { method: 'POST' });
}

export async function getAdminAllMessages() {
  return fetchJson<{ success: boolean; messages: (ClassMessage & { class_name?: string })[] }>(`/api/chat/admin/all`);
}

export async function getAdminChatStats() {
  return fetchJson<{ success: boolean; stats: { total: number; flagged: number; byClass: { id: string; name: string; msg_count: number; flagged_count: number }[] } }>(`/api/chat/admin/stats`);
}

export async function getAdminFlaggedMessages() {
  return fetchJson<{ success: boolean; messages: ClassMessage[] }>(`/api/chat/flagged/list`);
}
