import { fetchJson } from './http';

export interface SupportTicket {
  id: number;
  user_id: number;
  school_id: number | null;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  assigned_to: number | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  comment: string;
  is_internal: number;
  created_at: string;
}

export interface TicketHistory {
  id: number;
  ticket_id: number;
  old_status: string | null;
  new_status: string;
  changed_by: number;
  changed_at: string;
}

export async function createTicket(data: {
  category: string;
  priority: string;
  subject: string;
  description: string;
}): Promise<{ success: boolean; id?: number; message?: string }> {
  try {
    return await fetchJson('/api/support-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create ticket' };
  }
}

export async function getTickets(filters?: {
  status?: string;
  category?: string;
  priority?: string;
}): Promise<{ success: boolean; tickets?: SupportTicket[]; message?: string }> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priority) params.append('priority', filters.priority);
    
    const query = params.toString();
    return await fetchJson(`/api/support-tickets${query ? '?' + query : ''}`);
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to load tickets' };
  }
}

export async function getTicketById(id: number): Promise<{ success: boolean; ticket?: SupportTicket; comments?: TicketComment[]; history?: TicketHistory[]; message?: string }> {
  try {
    return await fetchJson(`/api/support-tickets/${id}`);
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to load ticket' };
  }
}

export async function updateTicket(id: number, data: {
  status?: string;
  assigned_to?: number | null;
  resolution?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    return await fetchJson(`/api/support-tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update ticket' };
  }
}

export async function addTicketComment(id: number, data: {
  comment: string;
  is_internal?: boolean;
}): Promise<{ success: boolean; id?: number; message?: string }> {
  try {
    return await fetchJson(`/api/support-tickets/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to add comment' };
  }
}

export async function getTicketStats(): Promise<{ success: boolean; stats?: any; message?: string }> {
  try {
    return await fetchJson('/api/support-tickets/stats/summary');
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to load statistics' };
  }
}

export function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    technical: 'تقني',
    billing: 'فوترة',
    feature: 'ميزة جديدة',
    bug: 'خطأ برمجي',
    other: 'أخرى',
  };
  return names[category] || category;
}

export function getPriorityName(priority: string): string {
  const names: Record<string, string> = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة',
  };
  return names[priority] || priority;
}

export function getStatusName(status: string): string {
  const names: Record<string, string> = {
    open: 'مفتوح',
    in_progress: 'قيد المعالجة',
    resolved: 'تم الحل',
    closed: 'مغلق',
  };
  return names[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-400',
    medium: 'bg-blue-400',
    high: 'bg-orange-400',
    urgent: 'bg-red-500',
  };
  return colors[priority] || 'bg-gray-400';
}
