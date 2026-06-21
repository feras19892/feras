<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Report } from '../../services/report.service';

const props = defineProps<{
  report: Report;
}>();

const analyzing = ref(false);
const aiResult = ref<string>('');

function safeParse(str: string | undefined) {
  try { return str ? JSON.parse(str) : []; } catch { return []; }
}

const readings = computed(() => safeParse(props.report.readings));
const columns = computed(() => safeParse(props.report.columns));
const equations = computed(() => safeParse(props.report.equations));
const plots = computed(() => safeParse(props.report.plots));

const stats = computed(() => {
  const r = readings.value;
  if (!Array.isArray(r) || r.length === 0) return null;
  const numericCols = columns.value.filter((c: any) => c.type === 'number');
  const avgs: Record<string, number> = {};
  numericCols.forEach((col: any) => {
    const vals = r.map((row: any) => Number(row[col.key])).filter((v: number) => !isNaN(v));
    if (vals.length) avgs[col.key] = vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
  });
  return avgs;
});

const hasConclusion = computed(() => !!props.report.conclusion && props.report.conclusion.length > 20);
const hasEquations = computed(() => Array.isArray(equations.value) && equations.value.length > 0);
const hasPlots = computed(() => Array.isArray(plots.value) && plots.value.length > 0);
const hasChart = computed(() => !!props.report.chart_snapshot);

const dataQuality = computed(() => {
  let score = 0;
  if (readings.value.length >= 3) score += 25;
  if (readings.value.length >= 5) score += 15;
  if (hasEquations.value) score += 20;
  if (hasPlots.value) score += 15;
  if (hasConclusion.value) score += 15;
  if (hasChart.value) score += 10;
  return Math.min(100, score);
});

function generateAnalysis() {
  analyzing.value = true;
  const lines: string[] = [];

  lines.push(`📊 **تحليل التقرير: ${props.report.experiment_name}**`);
  lines.push(``);
  lines.push(`**الطالب:** ${props.report.student_name}`);
  lines.push(`**عدد القراءات:** ${readings.value.length}`);
  lines.push(`**جودة البيانات:** ${dataQuality.value}%`);
  lines.push(``);

  // نقاط القوة
  lines.push(`✅ **نقاط القوة:**`);
  if (readings.value.length >= 5) lines.push(`- عدد قراءات جيد (${readings.value.length})`);
  else if (readings.value.length >= 3) lines.push(`- عدد قراءات مقبول (${readings.value.length})`);
  else lines.push(`- ⚠️ عدد قراءات قليل (${readings.value.length}) — يحتاج لقراءات إضافية`);

  if (hasEquations.value) lines.push(`- يتضمن معادلات رياضية`);
  if (hasPlots.value) lines.push(`- يتضمن رسومات بيانية`);
  if (hasConclusion.value) lines.push(`- يتضمن خاتمة وتحليل`);
  if (hasChart.value) lines.push(`- يتضمن رسم بياني فعلي`);
  if (!hasEquations.value) lines.push(`- ⚠️ لا يوجد معادلات — يُنصح بإضافة المعادلات`);
  if (!hasConclusion.value) lines.push(`- ⚠️ لا يوجد خاتمة — يُنصح بإضافة تحليل للنتائج`);

  lines.push(`**ملاحظات:**`);
  if (stats.value && Object.keys(stats.value).length > 0) {
    lines.push(`- المتوسطات المحسوبة: ${Object.entries(stats.value).map(([k, v]) => `${k}=${(v as number).toFixed(2)}`).join(', ')}`);
  }

  lines.push(`**اقتراح الدرجة:** ${Math.round(dataQuality.value)} / 100`);

  aiResult.value = lines.join('\n');
  analyzing.value = false;
}
</script>

<template>
  <div class="ai-analyzer">
    <div class="ai-header">
      <h4>🤖 تحليل ذكي</h4>
      <button v-if="!aiResult" class="ai-btn" :disabled="analyzing" @click="generateAnalysis">
        {{ analyzing ? '...' : 'تحليل' }}
      </button>
      <button v-else class="ai-btn secondary" @click="aiResult = ''">
        إخفاء
      </button>
    </div>

    <div v-if="analyzing" class="ai-loading">
      يحلل البيانات...
    </div>

    <div v-if="aiResult" class="ai-result">
      <pre>{{ aiResult }}</pre>
    </div>

    <div v-if="!aiResult && !analyzing" class="ai-preview">
      <div class="preview-item">
        <span class="label">📋 القراءات:</span>
        <span class="value">{{ readings.length }}</span>
      </div>
      <div class="preview-item">
        <span class="label">📐 معادلات:</span>
        <span class="value" :class="{ good: hasEquations, warn: !hasEquations }">
          {{ hasEquations ? '✅' : '❌' }}
        </span>
      </div>
      <div class="preview-item">
        <span class="label">📈 رسومات:</span>
        <span class="value" :class="{ good: hasPlots, warn: !hasPlots }">
          {{ hasPlots ? '✅' : '❌' }}
        </span>
      </div>
      <div class="preview-item">
        <span class="label">📝 خاتمة:</span>
        <span class="value" :class="{ good: hasConclusion, warn: !hasConclusion }">
          {{ hasConclusion ? '✅' : '❌' }}
        </span>
      </div>
      <div class="preview-item">
        <span class="label">📸 رسم بياني:</span>
        <span class="value" :class="{ good: hasChart, warn: !hasChart }">
          {{ hasChart ? '✅' : '❌' }}
        </span>
      </div>
      <div class="preview-item total">
        <span class="label">🎯 جودة البيانات:</span>
        <span class="value score">{{ dataQuality }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-analyzer {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 0.6rem;
  padding: 1rem;
}
.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.ai-header h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #a5b4fc;
}
.ai-btn {
  padding: 0.3rem 0.8rem;
  border-radius: 0.4rem;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}
.ai-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}
.ai-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ai-loading {
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
  padding: 0.5rem;
}
.ai-result pre {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.4rem;
  padding: 0.75rem;
  font-size: 0.8rem;
  color: #e2e8f0;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}
.ai-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
}
.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.6rem;
  border-radius: 0.35rem;
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.8rem;
}
.preview-item.total {
  grid-column: 1 / -1;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.12);
}
.preview-item .label {
  color: #94a3b8;
}
.preview-item .value {
  color: #e2e8f0;
  font-weight: 700;
}
.preview-item .value.good {
  color: #22c55e;
}
.preview-item .value.warn {
  color: #f87171;
}
.preview-item .value.score {
  color: #67e8f9;
  font-size: 1rem;
}
</style>
