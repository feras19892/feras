<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import type { Report } from '../../services/report.service';
import { analyzeReport } from '../../services/ai.service';

const props = defineProps<{
  report: Report;
}>();

const { t } = useI18n();
const analyzing = ref(false);
const aiResult = ref<string>('');
const aiError = ref<string>('');

function safeParse(str: string | undefined) {
  try { return str ? JSON.parse(str) : []; } catch { return []; }
}

const readings = computed(() => safeParse(props.report.readings));
const columns = computed(() => safeParse(props.report.columns));
const equations = computed(() => safeParse(props.report.equations));
const plots = computed(() => safeParse(props.report.plots));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _stats = computed(() => {
  const r = readings.value;
  if (!Array.isArray(r) || r.length === 0) return null;
  interface ColumnItem { type: string; key: string }
  const numericCols = (columns.value as ColumnItem[]).filter((c) => c.type === 'number');
  const avgs: Record<string, number> = {};
  numericCols.forEach((col) => {
    const vals = r.map((row: Record<string, unknown>) => Number(row[col.key])).filter((v) => !isNaN(v));
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

async function generateAnalysis() {
  analyzing.value = true;
  aiError.value = '';
  try {
    const res = await analyzeReport({
      experiment_name: props.report.experiment_name,
      student_name: props.report.student_name,
      readings: props.report.readings,
      columns: props.report.columns,
      equations: props.report.equations,
      plots: props.report.plots,
      conclusion: props.report.conclusion,
      chart_snapshot: props.report.chart_snapshot,
    });
    if (res.success) {
      aiResult.value = res.analysis;
    } else {
      aiError.value = res.message || 'Analysis failed';
    }
  } catch (err) {
    aiError.value = err instanceof Error ? err.message : 'Failed to connect to AI';
  } finally {
    analyzing.value = false;
  }
}
</script>

<template>
  <div class="ai-analyzer">
    <div class="ai-header">
      <h4>{{ t('ai.aiAnalysis') }}</h4>
      <button v-if="!aiResult" class="ai-btn" :disabled="analyzing" @click="generateAnalysis">
        {{ analyzing ? '...' : t('ai.analyze') }}
      </button>
      <button v-else class="ai-btn secondary" @click="aiResult = ''; aiError = ''">
        {{ t('ai.hide') }}
      </button>
    </div>

    <div v-if="analyzing" class="ai-loading">
      {{ t('ai.analyzing') }}
    </div>

    <div v-if="aiError" class="ai-error">
      ⚠️ {{ aiError }}
    </div>

    <div v-if="aiResult" class="ai-result">
      <pre>{{ aiResult }}</pre>
    </div>

    <div v-if="!aiResult && !analyzing" class="ai-preview">
      <div class="preview-item">
        <span class="label">{{ t('ai.readingsLabel') }}:</span>
        <span class="value">{{ readings.length }}</span>
      </div>
      <div class="preview-item">
        <span class="label">{{ t('ai.equationsLabel') }}:</span>
        <span class="value" :class="{ good: hasEquations, warn: !hasEquations }">
          {{ hasEquations ? '✅' : '❌' }}
        </span>
      </div>
      <div class="preview-item">
        <span class="label">{{ t('ai.plotsLabel') }}:</span>
        <span class="value" :class="{ good: hasPlots, warn: !hasPlots }">
          {{ hasPlots ? '✅' : '❌' }}
        </span>
      </div>
      <div class="preview-item">
        <span class="label">{{ t('ai.conclusionLabel') }}:</span>
        <span class="value" :class="{ good: hasConclusion, warn: !hasConclusion }">
          {{ hasConclusion ? '✅' : '❌' }}
        </span>
      </div>
      <div class="preview-item">
        <span class="label">{{ t('ai.chartLabel') }}:</span>
        <span class="value" :class="{ good: hasChart, warn: !hasChart }">
          {{ hasChart ? '✅' : '❌' }}
        </span>
      </div>
      <div class="preview-item total">
        <span class="label">{{ t('ai.dataQualityLabel') }}:</span>
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
.ai-error {
  color: #f87171;
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.15);
  border-radius: 0.4rem;
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
