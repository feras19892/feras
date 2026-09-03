<template>
  <div class="workshop-report-toolbar">
    <button class="btn-report" :disabled="!auth.isLoggedIn" @click="openReport">
      {{ t('experiments.submitBtn') }}
    </button>
    <SubmitReportModal
      v-model:show="showReport"
      :experiment-type="reportType"
      :experiment-name="reportTitle"
      :experiment-id="reportId"
      :readings="reportReadings"
      :params="reportParams"
      :student-info="studentInfo"
      :conclusion="conclusion"
      :columns="emptyArray"
      :equations="emptyArray"
      :plots="emptyArray"
      :chart-snapshot="chartSnapshot"
      @submitted="onSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'

import { useToast } from '@/composables/useToast'
import SubmitReportModal from '@/components/experiment/SubmitReportModal.vue'
import { useWorkshop } from './useWorkshop'





const props = defineProps<{
  workshop: ReturnType<typeof useWorkshop>
  canvasRef: HTMLCanvasElement | null
  labType: 'dc' | 'ac'
}>()

const auth = useAuthStore()

const toast = useToast()
const showReport = ref(false)
const chartSnapshot = ref('')

const reportType = computed(() => props.labType === 'dc' ? 'electric-dc' : 'electric-ac')
const reportTitle = computed(() => props.labType === 'dc' ? 'DC Circuit Workshop' : 'AC Circuit Workshop')
const reportId = computed(() => props.labType + '-workshop')
const emptyArray = JSON.stringify([])

const conclusion = JSON.stringify({ conclusion: '', errors: '', improvements: '' })

const reportReadings = computed(() => {
  return JSON.stringify(props.workshop.components.map(c => ({
    type: c.type,
    value: c.value,
    voltage: c.voltage ?? 0,
    current: c.current ?? 0,
  })))
})

const reportParams = computed(() => {
  return JSON.stringify({
    totalVoltage: props.workshop.totalVoltage.value,
    totalCurrent: props.workshop.totalCurrent.value,
    totalPower: props.workshop.totalPower.value,
    faults: props.workshop.faults.value.length,
  })
})

const studentInfo = computed(() => {
  return JSON.stringify({ name: auth.user?.name ?? '' })
})

function openReport() {
  if (!auth.isLoggedIn) {
    toast.error(t('experiments.errorLogin'))
    return
  }
  if (!props.canvasRef) {
    toast.error('اللوحة غير جاهزة')
    return
  }
  chartSnapshot.value = props.canvasRef.toDataURL('image/png')
  showReport.value = true
}

function onSubmitted() {
  toast.success(t('experiments.successSubmit'))
}
</script>

<style scoped>
.workshop-report-toolbar {
  padding: 0.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.btn-report {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border: none;
  border-radius: 0.55rem;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-report:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
