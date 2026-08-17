import type { AnalysisPayload } from '../../types/physics';
import type { Router } from 'vue-router';

const KEY = 'analysis-pending';
const LAST_KEY = 'analysis-last';
const REFERRER_KEY = 'analysis-referrer';

export function sendToAnalysis(router: Router, payload: AnalysisPayload) {
  const data = JSON.stringify({ ts: Date.now(), payload });
  try {
    localStorage.setItem(KEY, data);
    localStorage.setItem(LAST_KEY, data);
    localStorage.setItem(REFERRER_KEY, window.location.pathname);
  } catch { /* ignore */ }
  router.push('/analysis');
}

export function consumePendingPayload(): AnalysisPayload | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      localStorage.removeItem(KEY);
      const parsed = JSON.parse(raw);
      if (parsed && parsed.payload) return parsed.payload as AnalysisPayload;
    }
    // fallback: استخدم last analysis إذا لم يكن هناك pending
    const last = localStorage.getItem(LAST_KEY);
    if (last) {
      const parsed = JSON.parse(last);
      if (parsed && parsed.payload) return parsed.payload as AnalysisPayload;
    }
  } catch { /* ignore */ }
  return null;
}

export function clearAnalysisStorage() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LAST_KEY);
    localStorage.removeItem(REFERRER_KEY);
  } catch { /* ignore */ }
}
