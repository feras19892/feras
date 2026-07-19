<script setup lang="ts">
import { shallowRef } from 'vue'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  studentStorageKey: string
  hasData: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-full-report'): void
}>()

const studentName = shallowRef('')
const studentEmail = shallowRef('')
const studentClass = shallowRef('')
const studentNotes = shallowRef('')

function loadStudentInfo() {
  try {
    const raw = localStorage.getItem(props.studentStorageKey)
    if (!raw) return
    const d = JSON.parse(raw)
    studentName.value = d.name || ''
    studentEmail.value = d.email || ''
    studentClass.value = d.class || ''
    studentNotes.value = d.notes || ''
  } catch { /* ignore */ }
}

function saveStudentInfo() {
  localStorage.setItem(props.studentStorageKey, JSON.stringify({
    name: studentName.value,
    email: studentEmail.value,
    class: studentClass.value,
    notes: studentNotes.value,
  }))
}

loadStudentInfo()

function printReport() {
  const el = document.getElementById('printable-report')
  if (el) el.scrollTop = 0
  window.print()
}
</script>

<template>
  <div id="printable-report" class="experiment-report-panel">
    <button class="close-btn" @click="emit('close')">âœ•</button>

    <section class="student-info">
      <h5>{{ t('experiments.studentInfo') }}</h5>
      <div class="info-grid">
        <div class="info-field">
          <label>{{ t('experiments.nameLabel') }}:</label>
          <input v-model="studentName" @change="saveStudentInfo" :placeholder="t('experiments.nameLabel')" />
        </div>
        <div class="info-field">
          <label>{{ t('experiments.emailLabel') }}:</label>
          <input v-model="studentEmail" @change="saveStudentInfo" placeholder="email@example.com" />
        </div>
        <div class="info-field">
          <label>{{ t('experiments.classLabel') }}:</label>
          <input v-model="studentClass" @change="saveStudentInfo" :placeholder="t('experiments.classLabel')" />
        </div>
      </div>
      <div class="info-field notes">
        <label>{{ t('experiments.notesLabel') }}:</label>
        <textarea v-model="studentNotes" @change="saveStudentInfo" :placeholder="t('experiments.enterExperimentNotes')"></textarea>
      </div>
    </section>

    <slot name="content" />

    <div class="print-bar" v-if="hasData">
      <button class="print-btn" @click="printReport">ðŸ–¨ï¸ {{ t('experiments.print') }}</button>
      <button class="print-btn primary" @click="emit('open-full-report')">ðŸ“‹ {{ t('experiments.fullReport') }}</button>
    </div>
    <div class="no-data" v-if="!hasData">
      <slot name="no-data">{{ t('experiments.noRecordedDataPerformExperiment') }}</slot>
    </div>
  </div>
</template>

<style scoped>
.experiment-report-panel { display: flex; flex-direction: column; gap: .6rem; position: relative; }
h5 { margin: 0 0 .2rem; font-size: .82rem; color: #5B8DB8; }
section { background: #161B22; border: 1px solid #2D3645; border-radius: 8px; padding: .5rem; }
.report-table { width: 100%; border-collapse: collapse; font-size: .72rem; margin-top: .3rem; }
.report-table th, .report-table td { border: 1px solid #2D3645; padding: .2rem .3rem; text-align: center; color: #D1D7E0; }
.report-table th { background: #252D3A; }
.result-line { font-size: .78rem; color: #D1D7E0; margin-top: .3rem; }
.error-sources ul { margin: .2rem 0; padding-inline-start: 1.2rem; font-size: .75rem; color: #8B95A5; }
.no-data { text-align: center; color: #8B95A5; font-size: .8rem; padding: 1rem; }
.print-bar { display: flex; justify-content: center; margin-top: .3rem; gap: .3rem; }
.print-btn { background: #252D3A; border: 1px solid #2D3645; color: #5B8DB8; border-radius: 4px; padding: .3rem .7rem; font-size: .75rem; cursor: pointer; }
.print-btn:hover { background: rgba(91,141,184,.15); }
.print-btn.primary { background: rgba(91,141,184,.15); border-color: #5B8DB8; color: #5B8DB8; font-weight: 700; }
.edit-hint { font-size: .65rem; color: #5B8DB8; margin-right: .3rem; font-weight: 400; }
.edit-input { width: 55px; background: #161B22; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 3px; padding: .15rem; font-size: .72rem; text-align: center; }
.edit-input:focus { border-color: #5B8DB8; outline: none; }
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin-top: .3rem; }
.info-field { display: flex; flex-direction: column; gap: .2rem; }
.info-field label { font-size: .72rem; color: #8B95A5; }
.info-field input, .info-field textarea { background: #161B22; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 4px; padding: .25rem .4rem; font-size: .75rem; }
.info-field input:focus, .info-field textarea:focus { border-color: #5B8DB8; outline: none; }
.info-field.notes { grid-column: 1 / -1; }
.info-field textarea { min-height: 60px; resize: vertical; }
.close-btn { position: absolute; top: 6px; left: 6px; z-index: 10; background: #252D3A; border: 1px solid #2D3645; color: #8B95A5; border-radius: 4px; padding: .15rem .4rem; font-size: .75rem; cursor: pointer; }
.close-btn:hover { background: #3a4555; color: #D1D7E0; }
@media print {
  .experiment-report-panel {
    position: static !important;
    inset: auto !important;
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: none !important;
    overflow: visible !important;
    background: #fff !important;
    color: #000 !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
    gap: .4rem !important;
  }
  section { background: #fff !important; border: 1px solid #ccc !important; box-shadow: none !important; break-inside: avoid; page-break-inside: avoid; }
  h5 { color: #000 !important; }
  .report-table th { background: #f0f0f0 !important; color: #000 !important; }
  .report-table td { color: #000 !important; border-color: #ccc !important; }
  .result-line { color: #000 !important; }
  .error-sources ul { color: #333 !important; }
  .print-bar, .close-btn, .no-data { display: none !important; }
}
</style>

<style>
@media print {
  body * { visibility: hidden !important; }
  #printable-report, #printable-report * { visibility: visible !important; }
  #printable-report {
    position: absolute !important;
    left: 0 !important; top: 0 !important;
    width: 100% !important; height: auto !important;
    max-width: 100% !important; max-height: none !important;
    overflow: visible !important;
    background: #fff !important; color: #000 !important;
    border: none !important; border-radius: 0 !important;
    box-shadow: none !important;
    padding: 1rem !important; margin: 0 !important;
    gap: .6rem !important;
  }
  #printable-report .print-bar,
  #printable-report .close-btn,
  #printable-report .no-data { display: none !important; }
  #printable-report section {
    background: #fff !important;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  #printable-report h5 { color: #000 !important; }
  #printable-report .report-table th { background: #f0f0f0 !important; color: #000 !important; }
  #printable-report .report-table td { color: #000 !important; border-color: #ccc !important; }
  #printable-report .result-line { color: #000 !important; }
  #printable-report .error-sources ul { color: #333 !important; }
}
</style>
