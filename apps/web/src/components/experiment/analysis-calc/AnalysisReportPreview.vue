<script setup lang="ts">
import { computed } from 'vue';
import type { AnalysisColumnMeta, AnalysisEquation, AnalysisPlotConfig } from '../../../types/physics';
import type { StudentInfo } from '../../../stores/analysis.store';

const props = defineProps<{
  sourceName: string;
  reportDate: string;
  studentInfo: StudentInfo;
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
  equations: AnalysisEquation[];
  plots: AnalysisPlotConfig[];
  conclusion?: { conclusion: string; errors: string; improvements: string };
}>();

const stats = computed(() => {
  const s: Record<string, { mean: number; std: number; min: number; max: number }> = {};
  for (const col of props.columns) {
    const vals = props.readings.map(r => r[col.key]).filter(v => typeof v === 'number' && !isNaN(v));
    if (!vals.length) { s[col.key] = { mean: 0, std: 0, min: 0, max: 0 }; continue; }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / vals.length);
    s[col.key] = { mean, std, min: Math.min(...vals), max: Math.max(...vals) };
  }
  return s;
});
</script>

<template>
  <div class="report-preview" id="analysis-report">
    <div class="report-header">
      <h1>📊 تقرير التجربة الفيزيائية</h1>
      <div class="meta">
        <span><b>التجربة:</b> {{ sourceName }}</span>
        <span><b>التاريخ:</b> {{ reportDate }}</span>
      </div>
    </div>

    <div class="section" v-if="studentInfo.name || studentInfo.email || studentInfo.grade">
      <h2>🎓 معلومات الطالب</h2>
      <div class="info-grid">
        <div v-if="studentInfo.name"><b>الاسم:</b> {{ studentInfo.name }}</div>
        <div v-if="studentInfo.email"><b>البريد:</b> {{ studentInfo.email }}</div>
        <div v-if="studentInfo.grade"><b>الصف:</b> {{ studentInfo.grade }}</div>
      </div>
      <div v-if="studentInfo.notes" class="notes"><b>ملاحظات:</b> {{ studentInfo.notes }}</div>
    </div>

    <div class="section">
      <h2>📋 جدول القراءات</h2>
      <table class="data-table">
        <thead><tr><th>#</th><th v-for="c in columns" :key="c.key">{{ c.label }} <span v-if="c.unit">({{ c.unit }})</span></th></tr></thead>
        <tbody>
          <tr v-for="(row, i) in readings" :key="i"><td>{{ i + 1 }}</td><td v-for="c in columns" :key="c.key">{{ row[c.key]?.toFixed?.(4) ?? row[c.key] ?? '-' }}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>📈 إحصائيات</h2>
      <div class="stats-grid">
        <div class="stat-card" v-for="c in columns" :key="c.key">
          <div class="stat-title">{{ c.label }}</div>
          <div class="stat-row"><span>μ</span><b>{{ stats[c.key]?.mean.toFixed(3) }}</b></div>
          <div class="stat-row"><span>σ</span><b>{{ stats[c.key]?.std.toFixed(3) }}</b></div>
          <div class="stat-row"><span>min</span><b>{{ stats[c.key]?.min.toFixed(3) }}</b></div>
          <div class="stat-row"><span>max</span><b>{{ stats[c.key]?.max.toFixed(3) }}</b></div>
        </div>
      </div>
    </div>

    <div class="section" v-if="equations.length">
      <h2>⚗️ المعادلات</h2>
      <div class="eq-list">
        <div class="eq-item" v-for="(eq, i) in equations" :key="i">
          <div class="eq-name">{{ eq.name }}</div>
          <div class="eq-formula">{{ eq.formula }}</div>
        </div>
      </div>
    </div>

    <div class="section" v-if="plots.length">
      <h2>📉 الرسومات المقترحة</h2>
      <div class="plot-list">
        <div class="plot-item" v-for="(p, i) in plots" :key="i">
          <span class="plot-type">{{ p.type === 'scatter' ? '●' : '━' }}</span>
          <span>{{ p.yLabel }} ضد {{ p.xLabel }}</span>
        </div>
      </div>
    </div>

    <div class="section" v-if="conclusion?.conclusion || conclusion?.errors || conclusion?.improvements">
      <h2>📝 الخاتمة</h2>
      <div v-if="conclusion.conclusion" class="block"><b>الاستنتاج:</b> {{ conclusion.conclusion }}</div>
      <div v-if="conclusion.errors" class="block"><b>مصادر الخطأ:</b> {{ conclusion.errors }}</div>
      <div v-if="conclusion.improvements" class="block"><b>اقتراحات التحسين:</b> {{ conclusion.improvements }}</div>
    </div>

    <div class="footer">
      <span>تم إنشاء هذا التقرير تلقائياً من منصة الفيزياء التفاعلية</span>
    </div>
  </div>
</template>

<style scoped>
.report-preview {
  background: #fff;
  color: #1a1a1a;
  padding: 2rem;
  border-radius: 0.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}
.report-header {
  text-align: center;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}
.report-header h1 { color: #0f172a; margin: 0 0 0.5rem; font-size: 1.5rem; }
.meta { display: flex; justify-content: center; gap: 1.5rem; font-size: 0.9rem; color: #444; }
.section { margin-bottom: 1.5rem; }
.section h2 { color: #0f172a; font-size: 1.1rem; border-bottom: 1px solid #ddd; padding-bottom: 0.3rem; margin-bottom: 0.75rem; }
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.9rem; }
.notes { margin-top: 0.5rem; padding: 0.5rem; background: #f8f9fa; border-radius: 0.3rem; font-size: 0.9rem; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th, .data-table td { border: 1px solid #ddd; padding: 0.4rem 0.6rem; text-align: center; }
.data-table th { background: #0f172a; color: #fff; }
.data-table tr:nth-child(even) { background: #f8f9fa; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; }
.stat-card { background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 0.35rem; padding: 0.5rem; text-align: center; }
.stat-title { font-weight: 700; color: #0f172a; margin-bottom: 0.3rem; font-size: 0.8rem; }
.stat-row { display: flex; justify-content: space-between; font-size: 0.8rem; padding: 0.1rem 0; }
.stat-row span { color: #64748b; }
.eq-list { display: flex; flex-direction: column; gap: 0.5rem; }
.eq-item { background: #f8f9fa; padding: 0.5rem 0.75rem; border-radius: 0.3rem; }
.eq-name { font-weight: 700; color: #0f172a; font-size: 0.85rem; }
.eq-formula { font-family: 'Courier New', monospace; color: #374151; font-size: 0.85rem; margin-top: 0.2rem; }
.plot-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.plot-item { background: #f8f9fa; padding: 0.35rem 0.6rem; border-radius: 0.3rem; font-size: 0.85rem; }
.plot-type { color: #22c55e; margin-left: 0.3rem; }
.block { margin-bottom: 0.4rem; font-size: 0.9rem; }
.footer { text-align: center; font-size: 0.75rem; color: #888; border-top: 1px solid #ddd; padding-top: 1rem; margin-top: 1rem; }

@media print {
  .report-preview {
    padding: 0;
    background: #fff;
    color: #000;
    font-size: 12pt;
    line-height: 1.5;
  }
  .report-header h1 { font-size: 18pt; }
  .section h2 { font-size: 14pt; page-break-after: avoid; }
  .data-table { page-break-inside: auto; }
  .data-table tr { page-break-inside: avoid; }
  .stats-grid { page-break-inside: avoid; }
  .eq-list { page-break-inside: avoid; }
  .footer { page-break-before: avoid; }
}
</style>
