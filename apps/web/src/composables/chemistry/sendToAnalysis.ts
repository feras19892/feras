import type { ChemAnalysisPayload } from '../../types/chemistry';
import type { Router } from 'vue-router';

const KEY = 'chemistry-analysis-pending';
const LAST_KEY = 'chemistry-analysis-last';
const REFERRER_KEY = 'chemistry-analysis-referrer';

export function sendToAnalysis(router: Router, payload: ChemAnalysisPayload) {
  const data = JSON.stringify({ ts: Date.now(), payload });
  try {
    localStorage.setItem(KEY, data);
    localStorage.setItem(LAST_KEY, data);
    localStorage.setItem(REFERRER_KEY, window.location.pathname);
  } catch { /* ignore */ }
  router.push('/chemistry/analysis-calc');
}

export function consumePendingPayload(): ChemAnalysisPayload | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      localStorage.removeItem(KEY);
      const parsed = JSON.parse(raw);
      if (parsed && parsed.payload) return parsed.payload as ChemAnalysisPayload;
    }
    const last = localStorage.getItem(LAST_KEY);
    if (last) {
      const parsed = JSON.parse(last);
      if (parsed && parsed.payload) return parsed.payload as ChemAnalysisPayload;
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
