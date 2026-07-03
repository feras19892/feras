import { fetchJson } from './http';

export async function analyzeReport(data: {
  experiment_name: string;
  student_name?: string;
  readings: string;
  columns?: string;
  equations?: string;
  plots?: string;
  conclusion?: string;
  chart_snapshot?: string;
}) {
  return fetchJson<{ success: boolean; analysis: string; message?: string }>('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getAiModels() {
  return fetchJson<{ success: boolean; models: string[] }>('/api/ai/models');
}

export async function checkAiHealth() {
  return fetchJson<{ success: boolean; connected: boolean; modelCount: number }>('/api/ai/health');
}
