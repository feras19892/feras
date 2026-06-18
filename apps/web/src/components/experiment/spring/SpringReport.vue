<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { openLabReport } from '../../../utils/lab-report'
import type { LabReportTable, LabReportParam, LabReportStat } from '../../../utils/lab-report'

interface StaticReading {
  mass: number; yLoad: number; yUnload: number; yAvg: number; deltaY: number; force: number
}

interface DynamicTrial {
  mass: number; t1: number; t2: number; t3: number; tAvg: number; T: number; T2: number
}

const props = defineProps<{
  staticReadings: StaticReading[]
  dynamicTrials: DynamicTrial[]
  kStatic: number | null
  kDynamic: number | null
  theoreticalK: number
  canvasSnapshot?: string
}>()

const emit = defineEmits<{
  (e: 'update:staticReadings', val: StaticReading[]): void
  (e: 'update:dynamicTrials', val: DynamicTrial[]): void
  (e: 'close'): void
}>()

// Editable local copies
const staticEdit = shallowRef<StaticReading[]>([])
const dynamicEdit = shallowRef<DynamicTrial[]>([])
const isEditing = shallowRef(false)

watch(() => props.staticReadings, (v) => { if (!isEditing.value) staticEdit.value = v.map(r => ({ ...r })) }, { immediate: true, deep: true })
watch(() => props.dynamicTrials, (v) => { if (!isEditing.value) dynamicEdit.value = v.map(t => ({ ...t })) }, { immediate: true, deep: true })

function emitStatic() {
  isEditing.value = true
  emit('update:staticReadings', staticEdit.value.map(r => ({ ...r })))
  setTimeout(() => isEditing.value = false, 0)
}
function emitDynamic() {
  isEditing.value = true
  emit('update:dynamicTrials', dynamicEdit.value.map(t => ({ ...t })))
  setTimeout(() => isEditing.value = false, 0)
}

function updateStatic(i: number, key: keyof StaticReading, raw: string) {
  const n = parseFloat(raw)
  if (Number.isNaN(n)) return
  const r = { ...staticEdit.value[i] }
  if (key === 'mass') {
    r.mass = n / 1000  // input shows grams, store in kg
  } else {
    (r as any)[key] = n
  }
  r.force = r.mass * 9.81
  staticEdit.value[i] = r
  staticEdit.value = [...staticEdit.value]
  emitStatic()
}

function updateDynamic(i: number, key: keyof DynamicTrial, raw: string) {
  const n = parseFloat(raw)
  if (Number.isNaN(n)) return
  const t = { ...dynamicEdit.value[i] }
  if (key === 'mass') {
    t.mass = n / 1000  // input shows grams, store in kg
  } else if (key.startsWith('t')) {
    (t as any)[key] = n
    const times = [t.t1, t.t2, t.t3].filter(v => v > 0)
    t.tAvg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
    t.T = t.tAvg / 20
    t.T2 = t.T * t.T
  } else {
    (t as any)[key] = n
  }
  dynamicEdit.value[i] = t
  dynamicEdit.value = [...dynamicEdit.value]
  emitDynamic()
}

const kAvg = computed(() => {
  if (props.kStatic && props.kDynamic) return (props.kStatic + props.kDynamic) / 2
  return props.kStatic || props.kDynamic || null
})

const errorPercent = computed(() => {
  if (!kAvg.value || props.theoreticalK <= 0) return null
  return Math.abs((kAvg.value - props.theoreticalK) / props.theoreticalK) * 100
})

// Student info (localStorage persisted)
const studentName = shallowRef('')
const studentEmail = shallowRef('')
const studentClass = shallowRef('')
const studentNotes = shallowRef('')

function saveStudentInfo() {
  localStorage.setItem('spring_report_student', JSON.stringify({
    name: studentName.value,
    email: studentEmail.value,
    class: studentClass.value,
    notes: studentNotes.value,
  }))
}

function loadStudentInfo() {
  try {
    const raw = localStorage.getItem('spring_report_student')
    if (!raw) return
    const d = JSON.parse(raw)
    studentName.value = d.name || ''
    studentEmail.value = d.email || ''
    studentClass.value = d.class || ''
    studentNotes.value = d.notes || ''
  } catch { /* ignore */ }
}
loadStudentInfo()

const sourcesOfError = [
  'احتكاك الهواء',
  'دقة ساعة الإيقاف',
  'خطأ زاوية النظر (parallax)',
  'تشوه النابض غير الخطي',
  'اهتزازات الطاولة',
  'عدم مركزية الكتلة',
]

function printReport() { window.print() }

function openFullReport() {
  const staticTable: LabReportTable = {
    caption: 'الجزء الاستاتيكي (قانون هوك)',
    headers: ['#', 'm (g)', String.fromCharCode(0x0394) + 'y (cm)', 'F (N)'],
    rows: props.staticReadings.map((r, i) => [
      i + 1,
      (r.mass * 1000).toFixed(0),
      r.deltaY.toFixed(2),
      r.force.toFixed(3),
    ]),
  }
  const dynamicTable: LabReportTable = {
    caption: 'الجزء الديناميكي (الحركة الاهتزازية)',
    headers: ['#', 'm (g)', 't₁ (s)', 't₂ (s)', 't₃ (s)', 'T (s)', 'T² (s²)'],
    rows: props.dynamicTrials.map((t, i) => [
      i + 1,
      (t.mass * 1000).toFixed(0),
      t.t1.toFixed(2),
      t.t2.toFixed(2),
      t.t3.toFixed(2),
      t.T.toFixed(3),
      t.T2.toFixed(4),
    ]),
  }
  const summaryStats: LabReportStat[] = []
  if (kAvg.value) summaryStats.push({ label: 'k المتوسط', value: kAvg.value.toFixed(2), unit: 'N/m', highlight: true })
  if (props.kStatic) summaryStats.push({ label: 'k استاتيكي', value: props.kStatic.toFixed(2), unit: 'N/m' })
  if (props.kDynamic) summaryStats.push({ label: 'k ديناميكي', value: props.kDynamic.toFixed(2), unit: 'N/m' })
  if (errorPercent.value !== null) summaryStats.push({ label: 'نسبة الخطأ', value: errorPercent.value.toFixed(2), unit: '%' })

  openLabReport({
    title: '📋 تقرير تجربة النابض',
    icon: '🧪',
    experimentName: 'الحركة التوافقية البسيطة',
    dir: 'rtl',
    dateLocale: 'ar',
    params: [
      { label: 'k النظري', value: props.theoreticalK.toFixed(2), unit: 'N/m' },
      { label: 'عدد القراءات الاستاتيكية', value: props.staticReadings.length },
      { label: 'عدد القراءات الديناميكية', value: props.dynamicTrials.length },
    ],
    summaryStats,
    tables: [staticTable, dynamicTable].filter(t => t.rows.length > 0),
    htmlBlocks: [
      {
        title: 'مصادر الأخطاء المحتملة',
        html: '<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>احتكاك الهواء</li><li>دقة ساعة الإيقاف</li><li>خطأ زاوية النظر (parallax)</li><li>تشوه النابض غير الخطي</li><li>اهتزازات الطاولة</li><li>عدم مركزية الكتلة</li></ul>',
      },
    ],
    footerNote: 'تم إنشاء هذا التقرير من المحاكاة التفاعلية',
    canvasSnapshot: props.canvasSnapshot,
    openPrintDialog: true,
    sendToTeacher: true,
  })
}
</script>

<template>
  <div class="report-panel">
    <button class="close-btn" @click="emit('close')">✕</button>
    <section class="student-info">
      <h5>معلومات الطالب</h5>
      <div class="info-grid">
        <div class="info-field">
          <label>الاسم:</label>
          <input v-model="studentName" @change="saveStudentInfo" placeholder="اسم الطالب" />
        </div>
        <div class="info-field">
          <label>البريد:</label>
          <input v-model="studentEmail" @change="saveStudentInfo" placeholder="email@example.com" />
        </div>
        <div class="info-field">
          <label>الصف:</label>
          <input v-model="studentClass" @change="saveStudentInfo" placeholder="الصف / الشعبة" />
        </div>
      </div>
      <div class="info-field notes">
        <label>ملاحظات:</label>
        <textarea v-model="studentNotes" @change="saveStudentInfo" placeholder="أدخل ملاحظاتك عن التجربة..."></textarea>
      </div>
    </section>
    <section v-if="staticEdit.length">
      <h5>1. الجزء الاستاتيكي (قانون هوك) <span class="edit-hint">✏️ قابل للتعديل</span></h5>
      <table class="report-table">
        <thead>
          <tr><th>#</th><th>m (g)</th><th>Δy (cm)</th><th>F (N)</th></tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in staticEdit" :key="i">
            <td>{{ i + 1 }}</td>
            <td><input class="edit-input" :value="(r.mass * 1000).toFixed(0)" @change="e => updateStatic(i, 'mass', (e.target as HTMLInputElement).value)" /></td>
            <td><input class="edit-input" :value="r.deltaY.toFixed(2)" @change="e => updateStatic(i, 'deltaY', (e.target as HTMLInputElement).value)" /></td>
            <td>{{ r.force.toFixed(3) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="result-line" v-if="kStatic">
        <b>k (استاتيكي):</b> {{ kStatic.toFixed(2) }} N/m
      </div>
    </section>
    <section v-if="dynamicEdit.length">
      <h5>2. الجزء الديناميكي (الحركة الاهتزازية) <span class="edit-hint">✏️ قابل للتعديل</span></h5>
      <table class="report-table">
        <thead>
          <tr><th>#</th><th>m (g)</th><th>t₁ (s)</th><th>t₂ (s)</th><th>t₃ (s)</th><th>T (s)</th><th>T² (s²)</th></tr>
        </thead>
        <tbody>
          <tr v-for="(t, i) in dynamicEdit" :key="i">
            <td>{{ i + 1 }}</td>
            <td><input class="edit-input" :value="(t.mass * 1000).toFixed(0)" @change="e => updateDynamic(i, 'mass', (e.target as HTMLInputElement).value)" /></td>
            <td><input class="edit-input" :value="t.t1.toFixed(2)" @change="e => updateDynamic(i, 't1', (e.target as HTMLInputElement).value)" /></td>
            <td><input class="edit-input" :value="t.t2.toFixed(2)" @change="e => updateDynamic(i, 't2', (e.target as HTMLInputElement).value)" /></td>
            <td><input class="edit-input" :value="t.t3.toFixed(2)" @change="e => updateDynamic(i, 't3', (e.target as HTMLInputElement).value)" /></td>
            <td>{{ t.T.toFixed(3) }}</td>
            <td>{{ t.T2.toFixed(4) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="result-line" v-if="kDynamic">
        <b>k (ديناميكي):</b> {{ kDynamic.toFixed(2) }} N/m
      </div>
    </section>
    <section v-if="kAvg">
      <h5>3. المقارنة والاستنتاج</h5>
      <div class="result-line">
        <b>k المتوسط:</b> {{ kAvg.toFixed(2) }} N/m
      </div>
      <div class="result-line">
        <b>k النظري:</b> {{ theoreticalK.toFixed(2) }} N/m
      </div>
      <div class="result-line" v-if="errorPercent !== null">
        <b>نسبة الخطأ:</b> {{ errorPercent.toFixed(2) }}%
      </div>

      <div class="error-sources">
        <h6>مصادر الأخطاء المحتملة:</h6>
        <ul>
          <li v-for="err in sourcesOfError" :key="err">{{ err }}</li>
        </ul>
      </div>
    </section>
    <div class="print-bar" v-if="staticEdit.length || dynamicEdit.length">
      <button class="print-btn" @click="printReport()">🖨️ طباعة</button>
      <button class="print-btn primary" @click="openFullReport()">📋 تقرير كامل</button>
    </div>
    <div class="no-data" v-if="!staticEdit.length && !dynamicEdit.length">
      لا توجد بيانات مسجلة. قم بإجراء التجربة أولاً.
    </div>
  </div>
</template>
<style src="./SpringReport.css" scoped></style>
