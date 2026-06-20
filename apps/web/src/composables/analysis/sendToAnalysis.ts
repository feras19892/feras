import type { AnalysisPayload } from '../../types/physics';

const KEY = 'analysis-pending';

export function sendToAnalysis(payload: AnalysisPayload) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), payload }));
  } catch { /* ignore */ }
  window.open('/physics/mechanics/analysis-calc', '_blank');
}

export function consumePendingPayload(): AnalysisPayload | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    localStorage.removeItem(KEY);
    const parsed = JSON.parse(raw);
    if (parsed && parsed.payload) return parsed.payload as AnalysisPayload;
  } catch { /* ignore */ }
  return null;
}
