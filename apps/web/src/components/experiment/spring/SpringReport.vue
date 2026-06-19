<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import ExperimentReport from '../ExperimentReport.vue'
import DeletableSection from '../DeletableSection.vue'

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
  (e: 'open-full-report'): void
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

const sourcesOfError = [
  'احتكاك الهواء',
  'دقة ساعة الإيقاف',
  'خطأ زاوية النظر (parallax)',
  'تشوه النابض غير الخطي',
  'اهتزازات الطاولة',
  'عدم مركزية الكتلة',
]
</script>

<template>
  <ExperimentReport student-storage-key="spring_report_student" :has-data="staticEdit.length > 0 || dynamicEdit.length > 0" @close="emit('close')" @open-full-report="emit('open-full-report')">
    <template #content>
      <DeletableSection v-if="staticEdit.length">
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
      </DeletableSection>
      <DeletableSection v-if="dynamicEdit.length">
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
      </DeletableSection>
      <DeletableSection v-if="kAvg">
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
      </DeletableSection>
    </template>
  </ExperimentReport>
</template>
<style src="./SpringReport.css" scoped></style>
