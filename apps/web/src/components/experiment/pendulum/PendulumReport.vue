<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { openLabReport } from '../../../utils/lab-report'
import type { LabReportTable, LabReportStat } from '../../../utils/lab-report'
import type { PendulumTrial } from '../../../composables/pendulum/usePendulumTrials'

const props = defineProps<{ trials: PendulumTrial[]; gTheoretical: number; canvasSnapshot?: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const trialEdit = shallowRef<PendulumTrial[]>([])
const isEditing = shallowRef(false)
watch(() => props.trials, (v) => { if (!isEditing.value) trialEdit.value = v.map(t => ({ ...t })) }, { immediate: true, deep: true })

const gAvg = computed(() => { if (!props.trials.length) return null; const gs = props.trials.map(t => t.gCalc); return gs.reduce((a, b) => a + b, 0) / gs.length })
const errorPercent = computed(() => { if (gAvg.value === null) return null; return Math.abs((gAvg.value - props.gTheoretical) / props.gTheoretical) * 100 })

const studentName = shallowRef(''), studentEmail = shallowRef(''), studentClass = shallowRef(''), studentNotes = shallowRef('')
function saveStudentInfo() { localStorage.setItem('pendulum_report_student', JSON.stringify({ name: studentName.value, email: studentEmail.value, class: studentClass.value, notes: studentNotes.value })) }
function loadStudentInfo() { try { const raw = localStorage.getItem('pendulum_report_student'); if (!raw) return; const d = JSON.parse(raw); studentName.value = d.name || ''; studentEmail.value = d.email || ''; studentClass.value = d.class || ''; studentNotes.value = d.notes || '' } catch { /* ignore */ } }
loadStudentInfo()

const sourcesOfError = ['احتكاك الهواء مع الثقل', 'دقة ساعة الإيقاف البشرية', 'خطأ زاوية النظر (parallax)', 'حركة اليد عند الإطلاق', 'كتلة الخيط غير مهملة', 'زاوية كبيرة (>10°) تخرج عن التقريب']

function printReport() { window.print() }
function openFullReport() {
  const table: LabReportTable = { caption: 'الجزء الديناميكي — الحركة الاهتزازية', headers: ['#', 'L (m)', 'T (s)', 'f (Hz)', 'g (m/s²)'], rows: props.trials.map((t, i) => [i + 1, t.length.toFixed(3), t.T.toFixed(3), t.f.toFixed(3), t.gCalc.toFixed(2)]) }
  const stats: LabReportStat[] = []
  if (gAvg.value !== null) stats.push({ label: 'g المتوسط', value: gAvg.value.toFixed(2), unit: 'm/s²', highlight: true })
  if (props.gTheoretical > 0) stats.push({ label: 'g النظري', value: props.gTheoretical.toFixed(2), unit: 'm/s²' })
  if (errorPercent.value !== null) stats.push({ label: 'نسبة الخطأ', value: errorPercent.value.toFixed(2), unit: '%' })
  openLabReport({ title: '📋 تقرير تجربة البندول البسيط', icon: '⏱️', experimentName: 'الحركة التوافقية البسيطة — البندول', dir: 'rtl', dateLocale: 'ar', meta: { 'الفرع': 'الميكانيكا', 'التجربة': 'البندول البسيط', 'g النظري': props.gTheoretical.toFixed(2) + ' m/s²' }, params: [{ label: 'طول الخيط', value: props.trials[0]?.length.toFixed(2) ?? '-', unit: 'm' }, { label: 'عدد القراءات', value: props.trials.length }], summaryStats: stats, tables: [table], htmlBlocks: [{ title: '⚠️ مصادر الأخطاء المحتملة', html: '<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>احتكاك الهواء</li><li>دقة ساعة الإيقاف</li><li>خطأ زاوية النظر</li><li>حركة اليد عند الإطلاق</li><li>كتلة الخيط غير مهملة</li></ul>' }], canvasSnapshot: props.canvasSnapshot, footerNote: 'تم إنشاء هذا التقرير من المحاكاة التفاعلية', openPrintDialog: true, sendToTeacher: true })
}
</script>

<template>
  <div class="report-panel">
    <button class="close-btn" @click="emit('close')">✕</button>
    <section class="student-info">
      <h5>معلومات الطالب</h5>
      <div class="info-grid">
        <div class="info-field"><label>الاسم:</label><input v-model="studentName" @change="saveStudentInfo" placeholder="اسم الطالب" /></div>
        <div class="info-field"><label>البريد:</label><input v-model="studentEmail" @change="saveStudentInfo" placeholder="email@example.com" /></div>
        <div class="info-field"><label>الصف:</label><input v-model="studentClass" @change="saveStudentInfo" placeholder="الصف / الشعبة" /></div>
      </div>
      <div class="info-field notes"><label>ملاحظات:</label><textarea v-model="studentNotes" @change="saveStudentInfo" placeholder="أدخل ملاحظاتك..."></textarea></div>
    </section>
    <section v-if="trials.length">
      <h5>الجزء الديناميكي (البندول) <span class="edit-hint">✏️ قابل للتعديل</span></h5>
      <table class="report-table">
        <thead><tr><th>#</th><th>L (m)</th><th>T (s)</th><th>f (Hz)</th><th>g (m/s²)</th></tr></thead>
        <tbody>
          <tr v-for="(t, i) in trials" :key="i">
            <td>{{ i + 1 }}</td><td>{{ t.length.toFixed(3) }}</td><td>{{ t.T.toFixed(3) }}</td><td>{{ t.f.toFixed(3) }}</td><td>{{ t.gCalc.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
    <section v-if="gAvg !== null">
      <h5>المقارنة والاستنتاج</h5>
      <div class="result-line"><b>g المتوسط:</b> {{ gAvg.toFixed(2) }} m/s²</div>
      <div class="result-line"><b>g النظري:</b> {{ gTheoretical.toFixed(2) }} m/s²</div>
      <div class="result-line" v-if="errorPercent !== null"><b>نسبة الخطأ:</b> {{ errorPercent.toFixed(2) }}%</div>
      <div class="error-sources"><h6>مصادر الأخطاء:</h6><ul><li v-for="err in sourcesOfError" :key="err">{{ err }}</li></ul></div>
    </section>
    <div class="print-bar" v-if="trials.length">
      <button class="print-btn" @click="printReport()">🖨️ طباعة</button>
      <button class="print-btn primary" @click="openFullReport()">📋 تقرير كامل</button>
    </div>
    <div class="no-data" v-if="!trials.length">لا توجد بيانات مسجلة. قم بإجراء التجربة أولاً.</div>
  </div>
</template>

<style src="../spring/SpringReport.css" scoped></style>
