import { fetchJson } from './http';
import { ollamaTags } from './ollama';

export async function analyzeReport(data: {
  experiment_name: string;
  student_name?: string;
  readings: string;
  columns?: string;
  equations?: string;
  plots?: string;
  conclusion?: string;
  chart_snapshot?: string;
  mode?: 'builtin' | 'ai';
}): Promise<{ success: boolean; analysis: string; grade?: number; source?: string; fallback?: boolean; message?: string }> {
  try {
    const res = await fetchJson<{
      success: boolean;
      analysis: string;
      grade?: number;
      source?: string;
      fallback?: boolean;
      message?: string;
    }>('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.success) {
      return { success: false, analysis: '', message: res.message || 'AI analysis failed' };
    }
    return {
      success: true,
      analysis: res.analysis ?? '',
      grade: res.grade,
      source: res.source,
      fallback: res.fallback,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, analysis: '', message: `AI analysis error: ${msg}` };
  }
}

export async function getAiModels(): Promise<{ success: boolean; models: string[]; message?: string }> {
  try {
    const models = await ollamaTags();
    return { success: true, models };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, models: [], message: msg };
  }
}

export async function checkAiHealth(): Promise<{ success: boolean; connected: boolean; modelCount: number }> {
  try {
    const models = await ollamaTags();
    return { success: true, connected: true, modelCount: models.length };
  } catch {
    return { success: true, connected: false, modelCount: 0 };
  }
}
