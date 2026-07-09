import { onMounted, onUnmounted } from 'vue';
import { useAnalysisStore } from '../../stores/analysis.store';
import type { AnalysisPayload } from '../../types/physics';
import type { StudentInfo } from '../../stores/analysis.store';

const CHANNEL_NAME = 'analysis-sync';

export function useCrossTabSync() {
  const store = useAnalysisStore();
  let bc: BroadcastChannel | null = null;

  function broadcast() {
    const payload = {
      sourceExperiment: store.payload?.sourceExperiment,
      sourceNameAr: store.payload?.sourceNameAr,
      readings: store.readings,
      columns: store.columns,
      equations: store.equations,
      suggestedPlots: store.plots,
      studentInfo: store.studentInfo,
      reportDate: store.reportDate,
    };
    try {
      if (bc) bc.postMessage({ type: 'update', payload });
      else localStorage.setItem('analysis-sync-payload', JSON.stringify({ ts: Date.now(), payload }));
    } catch { /* ignore */ }
  }

  function receive(data: unknown) {
    if (!data || typeof data !== 'object' || (data as Record<string, unknown>).type !== 'update' || !(data as Record<string, unknown>).payload) return;
    const p = (data as Record<string, unknown>).payload as Record<string, unknown>;
    store.setPayload({
      sourceExperiment: (p.sourceExperiment as string) ?? '',
      sourceNameAr: (p.sourceNameAr as string) ?? '',
      readings: (p.readings as AnalysisPayload['readings']) ?? [],
      columns: (p.columns as AnalysisPayload['columns']) ?? [],
      equations: (p.equations as AnalysisPayload['equations']) ?? [],
      suggestedPlots: (p.suggestedPlots as AnalysisPayload['suggestedPlots']) ?? [],
    });
    if (p.studentInfo) store.updateStudentInfo(p.studentInfo as Partial<StudentInfo>);
    store.reportDate = (p.reportDate as string) ?? store.reportDate;
  }

  onMounted(() => {
    try { bc = new BroadcastChannel(CHANNEL_NAME); bc.onmessage = (ev) => receive(ev.data); } catch { bc = null; }
    // Fallback via localStorage
    window.addEventListener('storage', (e) => {
      if (e.key === 'analysis-sync-payload' && e.newValue) {
        try { receive({ type: 'update', payload: JSON.parse(e.newValue).payload }); } catch { /* ignore */ }
      }
    });
  });

  onUnmounted(() => { if (bc) { bc.close(); bc = null; } });

  return { broadcast };
}
