import { fetchJson } from './http';

export interface SystemStatus {
  stop_registration: boolean;
  maintenance_mode: boolean;
  freeze_all_classes: boolean;
}

export async function getSystemStatus() {
  return fetchJson<{ success: boolean } & SystemStatus>('/api/auth/system-status');
}
