import { computed, type Ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import type { AnalysisColumnMeta } from '../../types/physics';

export interface ValidationIssue {
  type: 'error' | 'warn' | 'info';
  message: string;
}

export function useSmartValidator(
  readings: Ref<Record<string, number>[]>,
  columns: Ref<AnalysisColumnMeta[]>,
  experimentName: string
) {
  const { t } = useI18n()
  const issues = computed(() => {
    const list: ValidationIssue[] = [];
    const rows = readings.value;
    if (!rows.length) { list.push({ type: 'error', message: t('analysis.noDataForAnalysis') }); return list; }
    if (rows.length < 3) list.push({ type: 'warn', message: t('analysis.minThreeReadingsRecommended') });

    for (const col of columns.value) {
      const vals = rows.map(r => r[col.key]).filter(v => typeof v === 'number' && !isNaN(v));
      if (!vals.length) { list.push({ type: 'error', message: t('analysis.emptyColumn', { col: col.label }) }); continue; }
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
      const cv = mean !== 0 ? (std / Math.abs(mean)) * 100 : 0;
      const out = vals.filter(v => Math.abs(v - mean) > 2 * std).length;
      if (out > 0) list.push({ type: 'warn', message: t('analysis.outliersInColumn', { count: out, col: col.label }) });
      if (cv > 20) list.push({ type: 'warn', message: t('analysis.highVarianceInCol', { col: col.label, cv: cv.toFixed(1) }) });
    }

    // Physics-specific checks
    const en = experimentName.toLowerCase();
    if (en.includes('spring') && columns.value.find(c => c.key === 'T2')) {
      const mIdx = columns.value.findIndex(c => c.key === 'mass' || c.key === 'm');
      const t2Idx = columns.value.findIndex(c => c.key === 'T2' || c.key === 'T²');
      if (mIdx >= 0 && t2Idx >= 0) {
        const slopes = rows.map(r => {
          const m = r[columns.value[mIdx].key] ?? 0;
          const t2 = r[columns.value[t2Idx].key] ?? 0;
          return m > 0 && t2 > 0 ? t2 / m : null;
        }).filter((v): v is number => v !== null);
        if (slopes.length > 1) {
          const meanSlope = slopes.reduce((a, b) => a + b, 0) / slopes.length;
          const stdSlope = Math.sqrt(slopes.reduce((s, v) => s + (v - meanSlope) ** 2, 0) / slopes.length);
          const cvSlope = meanSlope !== 0 ? (stdSlope / Math.abs(meanSlope)) * 100 : 0;
          if (cvSlope > 15) list.push({ type: 'warn', message: t('analysis.t2mRatioUnstable') });
        }
      }
    }

    if (!list.length) list.push({ type: 'info', message: t('analysis.allDataOk') });
    return list;
  });

  const hasErrors = computed(() => issues.value.some(i => i.type === 'error'));
  const hasWarnings = computed(() => issues.value.some(i => i.type === 'warn'));

  return { issues, hasErrors, hasWarnings };
}
