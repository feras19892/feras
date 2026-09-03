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
    localStorage.setItem(REFERRER_KEY, window.location.hash.replace(/^#/, '') || '/');
  } catch { /* ignore */ }
  router.push('/chemistry/analysis-calc');
}

export function consumePendingPayload(): ChemAnalysisPayload | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      localStorage.removeItem(KEY);
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && isValidPayload(parsed.payload)) {
        return parsed.payload as ChemAnalysisPayload;
      }
    }
    const last = localStorage.getItem(LAST_KEY);
    if (last) {
      const parsed = JSON.parse(last);
      if (parsed && typeof parsed === 'object' && isValidPayload(parsed.payload)) {
        return parsed.payload as ChemAnalysisPayload;
      }
    }
  } catch { /* ignore */ }
  return null;
}

function isValidPayload(p: unknown): p is ChemAnalysisPayload {
  if (!p || typeof p !== 'object') return false;
  const obj = p as Record<string, unknown>;
  return typeof obj.sourceExperiment === 'string'
    && typeof obj.sourceNameAr === 'string'
    && Array.isArray(obj.readings)
    && Array.isArray(obj.columns);
}

export function clearAnalysisStorage() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LAST_KEY);
    localStorage.removeItem(REFERRER_KEY);
  } catch { /* ignore */ }
}
