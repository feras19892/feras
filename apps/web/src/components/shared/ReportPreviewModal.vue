<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, watch } from 'vue'
import { getReport, type Report } from '../../services/report.service'

const props = defineProps<{ reportId: number | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'open-full', id: number): void }>()

const report = ref<Report | null>(null)
const loading = ref(false)
const error = ref('')

watch(() => props.reportId, async (id) => {
  if (!id) { report.value = null; return }
  loading.value = true
  error.value = ''
  report.value = null
  try {
    const res = await getReport(id)
    if (res.success) report.value = res.report
    else error.value = 'Failed'
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed'
  } finally {
    loading.value = false
  }
}, { immediate: true })

function close() {
  emit('close')
}

function openFull() {
  if (props.reportId) emit('open-full', props.reportId)
}

function statusLabel(status: string) {
  switch (status) {
    case 'submitted': return t('admin.statusSubmitted')
    case 'graded': return t('admin.statusGraded')
    case 'resubmitted': return t('admin.statusResubmitted')
    case 'draft': return t('admin.statusDraft')
    default: return status
  }
}

function tryParse(str: string | undefined | null): any[] | null {
  if (!str) return null
  try { return JSON.parse(str) } catch { return null }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div v-if="props.reportId" class="preview-overlay" @click.self="close">
        <div class="preview-modal">
          <div class="preview-header">
            <h3 v-if="report">{{ report.experiment_name }} <span class="preview-id">#{{ report.id }}</span></h3>
            <h3 v-else-if="loading">...</h3>
            <button class="preview-close" @click="close">✕</button>
          </div>

          <div v-if="loading" class="preview-loading">...</div>
          <div v-else-if="error" class="preview-error">❌ {{ error }}</div>
          <div v-else-if="report" class="preview-body">
            <div class="preview-meta">
              <div class="meta-item"><span class="meta-label">{{ t('adminUser.student') }}</span><span class="meta-val">{{ report.student_name || '—' }}</span></div>
              <div class="meta-item"><span class="meta-label">{{ t('admin.status') }}</span><span :class="['meta-val', 'status-' + report.status]">{{ statusLabel(report.status) }}</span></div>
              <div class="meta-item"><span class="meta-label">{{ t('admin.grade') }}</span><span class="meta-val">{{ report.grade != null ? report.grade + '/100' : '—' }}</span></div>
              <div class="meta-item"><span class="meta-label">{{ t('admin.date') }}</span><span class="meta-val">{{ report.submitted_at?.slice(0, 10) || '—' }}</span></div>
            </div>

            <div v-if="report.chart_snapshot" class="preview-section">
              <h4>{{ t('report.chart', 'الرسم البياني') }}</h4>
              <img :src="report.chart_snapshot" :alt="report.experiment_name" class="preview-chart" />
            </div>

            <div v-if="report.conclusion" class="preview-section">
              <h4>{{ t('report.conclusion', 'الخلاصة') }}</h4>
              <p class="preview-text">{{ report.conclusion }}</p>
            </div>

            <div v-if="report.conclusion_errors" class="preview-section">
              <h4>{{ t('report.errors', 'الأخطاء') }}</h4>
              <p class="preview-text">{{ report.conclusion_errors }}</p>
            </div>

            <div v-if="report.conclusion_improvements" class="preview-section">
              <h4>{{ t('report.improvements', 'التحسينات') }}</h4>
              <p class="preview-text">{{ report.conclusion_improvements }}</p>
            </div>

            <div v-if="report.feedback" class="preview-section">
              <h4>{{ t('admin.reportFeedback', 'ملاحظات المدرس') }}</h4>
              <p class="preview-text feedback">{{ report.feedback }}</p>
            </div>

            <div v-if="tryParse(report.readings)" class="preview-section">
              <h4>{{ t('report.readings', 'القراءات') }}</h4>
              <div class="preview-table-wrapper">
                <table class="preview-table">
                  <thead>
                    <tr><th v-for="(_, key) in tryParse(report.readings)![0] || {}" :key="key">{{ key }}</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in tryParse(report.readings)!" :key="i">
                      <td v-for="(_, key) in row" :key="key">{{ row[key] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div v-if="report" class="preview-actions">
            <button class="btn-open-full" @click="openFull">{{ t('admin.openReport', 'فتح كامل') }}</button>
            <button class="btn-close-preview" @click="close">{{ t('common.close', 'إغلاق') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.preview-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
}
.preview-modal {
  background: rgba(15,23,42,0.97); border: 1px solid rgba(99,102,241,0.15);
  border-radius: 0.8rem; width: 90%; max-width: 640px; max-height: 85vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.preview-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.preview-header h3 { margin: 0; font-size: 1rem; color: #e2e8f0; }
.preview-id { font-size: 0.8rem; color: #64748b; }
.preview-close {
  background: none; border: none; color: #94a3b8; font-size: 1.1rem;
  cursor: pointer; padding: 0.2rem 0.4rem; border-radius: 0.3rem;
}
.preview-close:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.preview-body { overflow-y: auto; padding: 1rem 1.25rem; flex: 1; }
.preview-loading, .preview-error { padding: 2rem; text-align: center; color: #64748b; }
.preview-error { color: #f87171; }

.preview-meta {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.6rem; margin-bottom: 1rem;
}
.meta-item { display: flex; flex-direction: column; gap: 0.15rem; }
.meta-label { font-size: 0.72rem; color: #64748b; text-transform: uppercase; }
.meta-val { font-size: 0.85rem; color: #e2e8f0; font-weight: 600; }
.status-graded { color: #4ade80; }
.status-submitted { color: #fbbf24; }
.status-resubmitted { color: #60a5fa; }

.preview-section { margin-bottom: 1rem; }
.preview-section h4 { margin: 0 0 0.4rem; font-size: 0.82rem; color: #94a3b8; }
.preview-text { font-size: 0.82rem; color: #cbd5e1; line-height: 1.6; white-space: pre-wrap; }
.preview-text.feedback { background: rgba(99,102,241,0.08); border-radius: 0.4rem; padding: 0.6rem; border-inline-start: 3px solid #6366f1; }
.preview-chart { max-width: 100%; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.06); }

.preview-table-wrapper { overflow-x: auto; }
.preview-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.preview-table th { text-align: end; padding: 0.35rem 0.5rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); }
.preview-table td { padding: 0.35rem 0.5rem; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); }

.preview-actions {
  display: flex; gap: 0.5rem; padding: 0.75rem 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.btn-open-full {
  padding: 0.5rem 1rem; border-radius: 0.5rem; border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff;
  cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.82rem;
}
.btn-close-preview {
  padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);
  background: transparent; color: #94a3b8; cursor: pointer; font-family: inherit; font-size: 0.82rem;
}

.preview-fade-enter-active, .preview-fade-leave-active { transition: opacity 0.2s; }
.preview-fade-enter-from, .preview-fade-leave-to { opacity: 0; }
</style>
