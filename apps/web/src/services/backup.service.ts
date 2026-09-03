import { fetchJson } from './http';

export interface BackupInfo {
  name: string;
  path: string;
  size: number;
  mtime: Date;
  created_at: string;
}

export async function listBackups(): Promise<{ success: boolean; backups?: BackupInfo[]; message?: string }> {
  try {
    return await fetchJson('/api/admin/backups');
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to list backups' };
  }
}

export async function createBackup(): Promise<{ success: boolean; message?: string }> {
  try {
    return await fetchJson('/api/admin/backups/create', { method: 'POST' });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create backup' };
  }
}

export async function restoreBackup(backupName: string): Promise<{ success: boolean; message?: string }> {
  try {
    return await fetchJson('/api/admin/backups/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupName }),
    });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to restore backup' };
  }
}

export async function downloadBackup(backupName: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/backups/download/${backupName}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_access_token')}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download backup');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', backupName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to download backup');
  }
}

export async function deleteBackup(backupName: string): Promise<{ success: boolean; message?: string }> {
  try {
    return await fetchJson(`/api/admin/backups/${backupName}`, { method: 'DELETE' });
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete backup' };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
