import { fetchJson } from './http';

function post(path: string, body: object) {
  return fetchJson<{ success: boolean; message?: string }>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function stopRegistration(emergencyPassword: string) {
  return post('/api/admin/emergency/stop-registration', { emergency_password: emergencyPassword });
}

export async function resumeRegistration(emergencyPassword: string) {
  return post('/api/admin/emergency/resume-registration', { emergency_password: emergencyPassword });
}

export async function enableMaintenance(emergencyPassword: string) {
  return post('/api/admin/emergency/maintenance-on', { emergency_password: emergencyPassword });
}

export async function disableMaintenance(emergencyPassword: string) {
  return post('/api/admin/emergency/maintenance-off', { emergency_password: emergencyPassword });
}

export async function freezeAllClasses(emergencyPassword: string) {
  return post('/api/admin/emergency/freeze-all', { emergency_password: emergencyPassword });
}

export async function unfreezeAllClasses(emergencyPassword: string) {
  return post('/api/admin/emergency/unfreeze-all', { emergency_password: emergencyPassword });
}

export async function changeEmergencyPassword(current: string, newPassword: string) {
  return post('/api/admin/emergency/change-password', { current_password: current, new_password: newPassword });
}
