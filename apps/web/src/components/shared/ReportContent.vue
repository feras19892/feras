<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import type { Report } from '@/services/report.service'


const props = defineProps<{ report: Report }>()

export interface Equation {
  name: string
  formula: string
  variables: { symbol: string; label?: string }[]
  solveFor: string[]
}

function safeParse<T>(str: string | undefined): T | null {
  if (!str) return null
  try { return JSON.parse(str) as T } catch { return null }
}

function escapeHtml(str: unknown): string {
  const s = String(str)
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const studentInfoParsed = computed(() => safeParse<Record<string, unknown>>(props.report.student_info))
const equationsParsed = computed(() => safeParse<Equation[]>(props.report.equations))
const validEquations = computed(() => equationsParsed.value?.filter((eq): eq is Equation => !!eq && typeof eq === 'object') ?? [])

const studentInfoFields: Record<string, string> = {
  name: 'الاسم', email: 'البريد', grade: 'الصف', notes: 'ملاحظات',
  school: 'المدرسة', age: 'العمر', class: 'الفصل', section: 'الشعبة',
}

function studentInfoLabel(key: string) {
  return studentInfoFields[key] || key
}

function hasStudentInfo(info: any) {
  if (!info || typeof info !== 'object') return false
  return Object.values(info).some((v: any) => v !== '' && v != null)
}

function formatReadingsAsTable(str: string | undefined) {
  if (!str) return ''
  try {
    const data = JSON.parse(str) as unknown[]
    if (!Array.isArray(data) || data.length === 0) {
      return '<pre>' + escapeHtml(JSON.stringify(data, null, 2)) + '</pre>'
    }
    const first = data[0]
    const keys = (first && typeof first === 'object') ? Object.keys(first as Record<string, unknown>) : ['—']
    let html = '<table class="rt"><thead><tr>'
    keys.forEach(k => { html += `<th>${escapeHtml(k)}</th>` })
    html += '</tr></thead><tbody>'
    data.forEach((row) => {
      html += '<tr>'
      keys.forEach(k => {
        const record = (row && typeof row === 'object') ? row as Record<string, unknown> : {}
        html += `<td>${escapeHtml(record[k] ?? '—')}</td>`
      })
      html += '</tr>'
    })
    html += '</tbody></table>'
    return html
  } catch { return '<pre>' + escapeHtml(str) + '</pre>' }
}
</script>

<template>
  <div class="report-info">
    <div class="info-row"><span class="info-label">الطالب:</span><span>{{ report.student_name || '—' }}</span></div>
    <div class="info-row"><span class="info-label">الفصل:</span><span>{{ report.class_id || '—' }}</span></div>
    <div class="info-row"><span class="info-label">الإرسال:</span><span>{{ report.submitted_at ? new Date(report.submitted_at).toLocaleString('ar') : '—' }}</span></div>
    <div class="info-row"><span class="info-label">الإصدار:</span><span>{{ report.version ?? 1 }}</span></div>
  </div>

  <div v-if="report.readings" class="report-section">
    <h4>📊 القراءات</h4>
    <div class="readings-table" v-html="formatReadingsAsTable(report.readings)"></div>
  </div>

  <div v-if="report.conclusion || report.conclusion_errors || report.conclusion_improvements" class="report-section">
    <h4>📝 الاستنتاج</h4>
    <div v-if="report.conclusion" class="conclusion-block"><span class="conc-label">الاستنتاج:</span><p>{{ report.conclusion }}</p></div>
    <div v-if="report.conclusion_errors" class="conclusion-block"><span class="conc-label">المصادر الخطأ:</span><p>{{ report.conclusion_errors }}</p></div>
    <div v-if="report.conclusion_improvements" class="conclusion-block"><span class="conc-label">التحسينات:</span><p>{{ report.conclusion_improvements }}</p></div>
  </div>

  <div v-if="report.chart_snapshot" class="report-section">
    <h4>📈 الرسم البياني</h4>
    <img :src="report.chart_snapshot" alt="chart" class="chart-img" />
  </div>

  <div v-if="report.student_info && hasStudentInfo(studentInfoParsed)" class="report-section">
    <h4>👤 بيانات الطالب</h4>
    <div class="info-grid">
      <div v-for="(val, key) in studentInfoParsed" :key="key" v-show="val !== '' && val != null" class="info-cell">
        <span class="cell-label">{{ studentInfoLabel(String(key)) }}</span>
        <span class="cell-value">{{ val || '—' }}</span>
      </div>
    </div>
  </div>

  <div v-if="report.equations && validEquations.length" class="report-section">
    <h4>🔢 المعادلات</h4>
    <div class="eq-cards">
      <div v-for="(eq, i) in validEquations" :key="i" class="eq-card">
        <div class="eq-name">{{ eq?.name || `معادلة ${i + 1}` }}</div>
        <div class="eq-formula">{{ eq?.formula || '—' }}</div>
        <div v-if="eq?.variables?.length" class="eq-vars">
          <span class="vars-label">المتغيرات:</span>
          <span v-for="v in eq.variables" :key="v?.symbol || Math.random()" class="var-chip">{{ v?.label || v?.symbol }}</span>
        </div>
        <div v-if="eq?.solveFor?.length" class="eq-solve">
          <span class="solve-label">يحل من أجل:</span>
          <span v-for="s in eq.solveFor" :key="s" class="solve-chip">{{ s }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="grade-divider"></div>
</template>

<style scoped>
.report-info { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; padding: 12px; border-radius: 8px; background: var(--as-surface, #1f2937); }
.info-row { display: flex; gap: 8px; font-size: 13px; color: var(--as-text, #f8fafc); }
.info-label { color: var(--as-text-muted, #94a3b8); min-width: 70px; font-weight: 600; }
.report-section { margin-bottom: 16px; }
.report-section h4 { margin: 0 0 8px; font-size: 14px; color: var(--as-text, #f8fafc); }
.readings-table :deep(.rt) { width: 100%; border-collapse: collapse; font-size: 12px; }
.readings-table :deep(.rt th) { padding: 6px 8px; text-align: right; background: var(--as-surface, #1f2937); color: var(--as-text-muted, #94a3b8); border: 1px solid var(--as-border, rgba(255,255,255,0.08)); }
.readings-table :deep(.rt td) { padding: 6px 8px; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); color: var(--as-text, #f8fafc); }
.readings-table :deep(.rt tbody tr:nth-child(even)) { background: rgba(255,255,255,0.02); }
.conclusion-block { margin-bottom: 8px; }
.conc-label { font-size: 12px; color: var(--as-text-muted, #94a3b8); font-weight: 600; }
.conclusion-block p { margin: 2px 0 0; font-size: 14px; line-height: 1.6; color: var(--as-text, #f8fafc); }
.chart-img { max-width: 100%; border-radius: 8px; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.info-cell { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: 8px; background: var(--as-surface, #1f2937); }
.cell-label { font-size: 11px; color: var(--as-text-muted, #94a3b8); font-weight: 600; }
.cell-value { font-size: 13px; color: var(--as-text, #f8fafc); }
.eq-cards { display: flex; flex-direction: column; gap: 10px; }
.eq-card { padding: 12px; border-radius: 10px; background: var(--as-surface, #1f2937); border: 1px solid var(--as-border, rgba(255,255,255,0.08)); }
.eq-name { font-size: 13px; font-weight: 700; color: var(--as-accent, #6366f1); margin-bottom: 6px; }
.eq-formula { font-size: 16px; color: var(--as-text, #f8fafc); font-family: 'Cambria Math', serif; padding: 8px 10px; border-radius: 6px; background: rgba(99,102,241,0.06); margin-bottom: 8px; text-align: center; }
.eq-vars { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-bottom: 6px; }
.vars-label { font-size: 11px; color: var(--as-text-muted, #94a3b8); margin-left: 4px; }
.var-chip { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: rgba(99,102,241,0.12); color: var(--as-accent, #a5b4fc); border: 1px solid rgba(99,102,241,0.15); }
.eq-solve { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.solve-label { font-size: 11px; color: var(--as-text-muted, #94a3b8); margin-left: 4px; }
.solve-chip { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: rgba(16,185,129,0.12); color: var(--as-success, #4ade80); border: 1px solid rgba(16,185,129,0.15); }
.grade-divider { height: 1px; background: var(--as-border, rgba(255,255,255,0.08)); margin: 16px 0; }
</style>
