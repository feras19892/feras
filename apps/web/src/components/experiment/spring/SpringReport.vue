<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

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
  staticEdit.value[i] = { ...staticEdit.value[i], [key]: n }
  // Recalculate derived values
  const r = staticEdit.value[i]
  if (key === 'mass' || key === 'deltaY') {
    r.force = r.mass * 9.81
  }
  staticEdit.value = [...staticEdit.value]
  emitStatic()
}

function updateDynamic(i: number, key: keyof DynamicTrial, raw: string) {
  const n = parseFloat(raw)
  if (Number.isNaN(n)) return
  const t = { ...dynamicEdit.value[i], [key]: n }
  // Recalculate derived: tAvg, T, T2
  if (key.startsWith('t')) {
    const times = [t.t1, t.t2, t.t3].filter(v => v > 0)
    t.tAvg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
    t.T = t.tAvg / 20  // 20 oscillations
    t.T2 = t.T * t.T
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
</script>

<template>
  <div class="report-panel">
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
            <td><input class="edit-input" :value="(r.mass * 1000).toFixed(0)" @change="e => updateStatic(i, 'mass', (+(e.target as HTMLInputElement).value / 1000).toString())" /></td>
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
            <td><input class="edit-input" :value="(t.mass * 1000).toFixed(0)" @change="e => updateDynamic(i, 'mass', (+(e.target as HTMLInputElement).value / 1000).toString())" /></td>
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
      <button class="print-btn" @click="printReport()">&#x1F5A8; طباعة التقرير</button>
    </div>

    <div class="no-data" v-if="!staticEdit.length && !dynamicEdit.length">
      لا توجد بيانات مسجلة. قم بإجراء التجربة أولاً.
    </div>
  </div>
</template>

<style scoped>
.report-panel { display: flex; flex-direction: column; gap: .6rem; }
h4 { margin: 0 0 .3rem; font-size: .9rem; color: #D1D7E0; }
h5 { margin: 0; font-size: .82rem; color: #5B8DB8; }
h6 { margin: 0 0 .2rem; font-size: .75rem; color: #8B95A5; }
section { background: #161B22; border: 1px solid #2D3645; border-radius: 8px; padding: .5rem; }
.report-table { width: 100%; border-collapse: collapse; font-size: .72rem; margin-top: .3rem; }
.report-table th, .report-table td { border: 1px solid #2D3645; padding: .2rem .3rem; text-align: center; color: #D1D7E0; }
.report-table th { background: #252D3A; }
.result-line { font-size: .78rem; color: #D1D7E0; margin-top: .3rem; }
.error-sources ul { margin: .2rem 0; padding-right: 1.2rem; font-size: .75rem; color: #8B95A5; }
.no-data { text-align: center; color: #8B95A5; font-size: .8rem; padding: 1rem; }
.print-bar { display: flex; justify-content: center; margin-top: .3rem; }
.print-btn { background: #252D3A; border: 1px solid #2D3645; color: #5B8DB8; border-radius: 4px; padding: .3rem .7rem; font-size: .75rem; cursor: pointer; }
.print-btn:hover { background: rgba(91,141,184,.15); }
.edit-hint { font-size: .65rem; color: #5B8DB8; margin-right: .3rem; font-weight: 400; }
.edit-input { width: 55px; background: #161B22; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 3px; padding: .15rem; font-size: .72rem; text-align: center; }
.edit-input:focus { border-color: #5B8DB8; outline: none; }

.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin-top: .3rem; }
.info-field { display: flex; flex-direction: column; gap: .2rem; }
.info-field label { font-size: .72rem; color: #8B95A5; }
.info-field input, .info-field textarea {
  background: #161B22; border: 1px solid #2D3645; color: #D1D7E0;
  border-radius: 4px; padding: .25rem .4rem; font-size: .75rem;
}
.info-field input:focus, .info-field textarea:focus { border-color: #5B8DB8; outline: none; }
.info-field.notes { grid-column: 1 / -1; }
.info-field textarea { min-height: 60px; resize: vertical; }

@media print {
  .modal-overlay { position: static; background: transparent !important; }
  .report-panel { max-width: 100%; max-height: none; overflow: visible; background: #fff !important; color: #000 !important; border: none !important; }
  section { background: #fff !important; border: 1px solid #ccc !important; box-shadow: none !important; }
  h4, h5, h6 { color: #000 !important; }
  .report-table th { background: #f0f0f0 !important; color: #000 !important; }
  .report-table td { color: #000 !important; border-color: #ccc !important; }
  .result-line { color: #000 !important; }
  .error-sources ul { color: #333 !important; }
  .print-bar, .close-btn { display: none !important; }
}
</style>
