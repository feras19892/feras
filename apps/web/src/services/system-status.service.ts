import { fetchJson } from './http';

export interface SystemStatus {
  stop_registration: boolean;
  maintenance_mode: boolean;
  freeze_all_classes: boolean;
  registration_enabled: boolean;
  chat_enabled: boolean;
  experiment_physics_enabled: boolean;
  experiment_chemistry_enabled: boolean;
  experiment_biology_enabled: boolean;
  experiment_math_enabled: boolean;
}

export async function getSystemStatus() {
  return fetchJson<{ success: boolean } & SystemStatus>('/api/auth/system-status');
}
