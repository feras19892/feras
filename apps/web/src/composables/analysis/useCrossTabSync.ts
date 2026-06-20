import { onMounted, onUnmounted } from 'vue';
import { useAnalysisStore } from '../../stores/analysis.store';

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

  function receive(data: any) {
    if (!data || data.type !== 'update' || !data.payload) return;
    const p = data.payload;
    store.setPayload({
      sourceExperiment: p.sourceExperiment ?? '',
      sourceNameAr: p.sourceNameAr ?? '',
      readings: p.readings ?? [],
      columns: p.columns ?? [],
      equations: p.equations ?? [],
      suggestedPlots: p.suggestedPlots ?? [],
    });
    if (p.studentInfo) store.updateStudentInfo(p.studentInfo);
    store.reportDate = p.reportDate ?? store.reportDate;
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
