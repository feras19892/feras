import { fetchJson } from './http';

export interface DirectMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  translated_content: string | null;
  is_read: number;
  created_at: string;
  sender_name: string;
  receiver_name: string;
}

export interface ConversationItem {
  other_id: number;
  other_name: string;
  other_role: string;
  last_message: string;
  last_at: string;
  unread_count: number;
}

export async function sendDirectMessage(receiverId: number, content: string) {
  return fetchJson<{ success: boolean; message?: DirectMessage; message_text?: string }>('/api/admin/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverId, content }),
  });
}

export async function getConversation(userId: number) {
  return fetchJson<{ success: boolean; messages: DirectMessage[] }>(`/api/admin/messages/${userId}`);
}

export async function getConversations() {
  return fetchJson<{ success: boolean; conversations: ConversationItem[] }>('/api/admin/messages');
}

export async function getUnreadMessageCount() {
  return fetchJson<{ success: boolean; count: number }>('/api/admin/messages/unread/count');
}

export async function markAllMessagesRead() {
  return fetchJson<{ success: boolean }>('/api/admin/messages/read-all', { method: 'PATCH' });
}
