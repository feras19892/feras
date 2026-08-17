<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import type { Report } from '../../services/report.service';
import { analyzeReport } from '../../services/ai.service';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

const props = defineProps<{
  report: Report;
}>();

const { t } = useI18n();
const analyzing = ref(false);
const aiResult = ref<string>('');
const aiGrade = ref<number | null>(null);
const aiError = ref<string>('');
const showDetail = ref(false);

function gradeLabel(grade: number): string {
  if (grade >= 90) return t('ai.excellent');
  if (grade >= 80) return t('ai.veryGood');
  if (grade >= 70) return t('ai.good');
  if (grade >= 60) return t('ai.acceptable');
  return t('ai.weak');
}

function briefComment(grade: number): string {
  if (grade >= 90) return t('ai.briefExcellent');
  if (grade >= 80) return t('ai.briefVeryGood');
  if (grade >= 70) return t('ai.briefGood');
  if (grade >= 60) return t('ai.briefAcceptable');
  return t('ai.briefWeak');
}

function renderMarkdown(md: string): string {
  const raw = md
    .replace(/^## (.+)$/gm, '<h4 class="md-h4">$1</h4>')
    .replace(/^### (.+)$/gm, '<h5 class="md-h5">$1</h5>')
    .replace(/^- (.+)$/gm, '<div class="md-li">$1</div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
  return sanitizeHtml(raw);
}

async function generateAnalysis() {
  analyzing.value = true;
  aiError.value = '';
  aiResult.value = '';
  aiGrade.value = null;
  try {
    const res = await analyzeReport({
      experiment_name: props.report.experiment_name || 'Unknown',
      student_name: props.report.student_name || '',
      readings: props.report.readings || '[]',
      columns: props.report.columns || '[]',
      equations: props.report.equations || '[]',
      plots: props.report.plots || '[]',
      conclusion: props.report.conclusion || '',
      chart_snapshot: props.report.chart_snapshot || '',
    });
    if (res.success) {
      aiResult.value = res.analysis;
      aiGrade.value = res.grade ?? null;
    } else {
      aiError.value = res.message || t('ai.analysisFailed');
    }
  } catch (err) {
    aiError.value = err instanceof Error ? err.message : t('ai.analysisFailed');
  } finally {
    analyzing.value = false;
  }
}

onMounted(() => {
  generateAnalysis();
});
</script>

<template>
  <div class="report-assessment">
    <!-- Brief Summary (shows in report) -->
    <div v-if="analyzing" class="assess-loading">
      <div class="mini-spinner"></div>
      <span>{{ t('ai.evaluating') }}</span>
    </div>

    <div v-else-if="aiError" class="assess-error">
      ⚠️ {{ aiError }}
    </div>

    <div v-else-if="aiGrade !== null" class="assess-brief">
      <div class="brief-row">
        <div class="brief-grade" :class="{
          excellent: aiGrade >= 90,
          good: aiGrade >= 80 && aiGrade < 90,
          fair: aiGrade >= 70 && aiGrade < 80,
          poor: aiGrade < 70,
        }">
          <span class="grade-num">{{ aiGrade }}</span>
          <span class="grade-max">/100</span>
        </div>
        <div class="brief-text">
          <span class="brief-label">{{ gradeLabel(aiGrade) }}</span>
          <span class="brief-comment">{{ briefComment(aiGrade) }}</span>
        </div>
        <button class="detail-btn" @click="showDetail = true">
          📄 {{ t('ai.detailedAnalysis') }}
        </button>
      </div>
    </div>

    <!-- Detailed Analysis Modal (floating) -->
    <Teleport to="body">
      <div v-if="showDetail" class="detail-overlay" @click.self="showDetail = false">
        <div class="detail-modal">
          <div class="detail-header">
            <h3>📄 {{ t('ai.detailedReport') }}</h3>
            <button class="detail-close" @click="showDetail = false">✕</button>
          </div>
          <div class="detail-body">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="aiResult" class="detail-content" v-html="renderMarkdown(aiResult)"></div>
          </div>
          <div class="detail-footer">
            <button class="detail-close-btn" @click="showDetail = false">{{ t('common.close') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.report-assessment {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 0.6rem;
  padding: 0.8rem 1rem;
}

.assess-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.82rem;
  padding: 0.3rem 0;
}
.mini-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(99,102,241,0.2);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: mini-spin 0.8s linear infinite;
}
@keyframes mini-spin { to { transform: rotate(360deg); } }

.assess-error {
  color: #f87171;
  font-size: 0.8rem;
  padding: 0.3rem 0;
}

.assess-brief {
  display: flex;
  align-items: center;
}
.brief-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}
.brief-grade {
  display: flex;
  align-items: baseline;
  gap: 0.1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 0.5rem;
  font-weight: 800;
  flex-shrink: 0;
}
.brief-grade .grade-num { font-size: 1.4rem; }
.brief-grade .grade-max { font-size: 0.75rem; opacity: 0.7; }
.brief-grade.excellent { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
.brief-grade.good { background: rgba(99,102,241,0.12); color: #818cf8; border: 1px solid rgba(99,102,241,0.2); }
.brief-grade.fair { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
.brief-grade.poor { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

.brief-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.brief-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e2e8f0;
}
.brief-comment {
  font-size: 0.78rem;
  color: #94a3b8;
}

.detail-btn {
  padding: 0.35rem 0.8rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(99,102,241,0.2);
  background: rgba(99,102,241,0.08);
  color: #a5b4fc;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.15s;
}
.detail-btn:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.35); }

/* Detail Modal */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}
.detail-modal {
  width: 100%;
  max-width: 650px;
  max-height: 85vh;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.detail-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #f1f5f9;
}
.detail-close {
  width: 30px; height: 30px;
  border-radius: 0.4rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
}
.detail-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }

.detail-body {
  padding: 1.2rem 1.5rem;
  overflow-y: auto;
  flex: 1;
}
.detail-content {
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.8;
}
.detail-content :deep(.md-h4) {
  margin: 0.8rem 0 0.4rem;
  font-size: 0.88rem;
  font-weight: 800;
  color: #67e8f9;
  border-bottom: 1px solid rgba(99,102,241,0.1);
  padding-bottom: 0.2rem;
}
.detail-content :deep(.md-h5) {
  margin: 0.6rem 0 0.3rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #a5b4fc;
}
.detail-content :deep(.md-li) {
  padding: 0.15rem 0;
  padding-inline-start: 1rem;
  position: relative;
}
.detail-content :deep(.md-li)::before {
  content: '•';
  position: absolute;
  inset-inline-start: 0;
  color: #64748b;
}
.detail-content :deep(strong) { color: #f1f5f9; }

.detail-footer {
  padding: 0.8rem 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  justify-content: flex-end;
}
.detail-close-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.detail-close-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
</style>
