<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useTorqueCoilExperiment } from '../../../../composables/electromagnetism/useTorqueCoilExperiment'
import { useI18n } from '../../../../composables/useI18n'
import MenuBar from '../../../../components/experiment/electromagnetism/MenuBar.vue'
import ControlBar from '../../../../components/experiment/electromagnetism/ControlBar.vue'
import TorqueCoilCanvas from '../../../../components/experiment/electromagnetism/TorqueCoilCanvas.vue'
import TorqueCoilParamPanel from '../../../../components/experiment/electromagnetism/TorqueCoilParamPanel.vue'
import TorqueCoilReadingsPanel from '../../../../components/experiment/electromagnetism/TorqueCoilReadingsPanel.vue'
import TorqueCoilDataPanel from '../../../../components/experiment/electromagnetism/TorqueCoilDataPanel.vue'
import TorqueCoilGuidePanel from '../../../../components/experiment/electromagnetism/TorqueCoilGuidePanel.vue'
import ElectromagnetismHelpModal from '../../../../components/experiment/electromagnetism/ElectromagnetismHelpModal.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'
import { ref } from 'vue'

const ex = useTorqueCoilExperiment()
const { t } = useI18n()
const showGuide = ref(true)
const helpOpen = ref(false)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.togglePause() }
  else if (e.key === 's' || e.key === 'S') { ex.recordTrial() }
  else if (e.key === '?') { helpOpen.value = !helpOpen.value }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="em-lab">
    <MenuBar
      :title="t('experiments.tcTitle')"
      icon="🔄"
      experiment-route="/physics/electromagnetism/torque-coil"
      :experiment-name="t('experiments.tcTitle')"
      @export-csv="ex.exportCsv"
      @toggle-pause="ex.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.recordTrial"
      @analyze-results="ex.exportToAnalysis"
      @toggle-help="helpOpen = !helpOpen"
    />

    <ElectromagnetismHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col">
        <DraggablePanel id="readings" :title="t('experiments.emLiveReadings')" @maximize="() => {}" @hide="() => {}" @drop="() => {}">
          <TorqueCoilReadingsPanel
            :I="ex.params.I"
            :N="ex.params.N"
            :a="ex.params.a"
            :b="ex.params.b"
            :b-field="ex.params.B"
            :theta="ex.probeData.value ? ex.probeData.value.theta : ex.params.theta"
            :area-val="ex.A.value"
            :mu="ex.mu.value"
            :tau="ex.probeData.value ? ex.probeData.value.tau : ex.tau.value"
            :running="ex.running.value"
            :has-probe="!!ex.probeData.value"
          />
        </DraggablePanel>
        <DraggablePanel id="data" :title="t('experiments.emRecordedTrials')" @maximize="() => {}" @hide="() => {}" @drop="() => {}">
          <TorqueCoilDataPanel
            :trials="ex.trials.value"
            @remove="ex.removeTrial"
            @clear="ex.clearTrials"
          />
        </DraggablePanel>
      </div>

      <div class="lab-col vis-col">
        <div class="vis-canvas-wrap">
          <TorqueCoilCanvas
            :I="ex.params.I"
            :N="ex.params.N"
            :a="ex.params.a"
            :b="ex.params.b"
            :b-field="ex.params.B"
            :theta="ex.params.theta"
            :running="ex.running.value"
            :paused="ex.paused.value"
            @probe-placed="ex.setProbeData"
          />
        </div>
        <ControlBar
          :launch-label="ex.running.value && !ex.paused.value ? t('experiments.emPause') : t('experiments.emPlay')"
          :can-undo="false"
          :can-redo="false"
          @toggle-pause="ex.togglePause"
          @reset="ex.resetSim"
          @record-trial="ex.recordTrial"
          @clear-trials="ex.clearTrials"
          @export-csv="ex.exportCsv"
          @analyze="ex.exportToAnalysis"
        />
      </div>

      <div class="lab-col ctrl-col">
        <TorqueCoilParamPanel
          :I="ex.params.I"
          :N="ex.params.N"
          :a="ex.params.a"
          :b="ex.params.b"
          :b-field="ex.params.B"
          :theta="ex.params.theta"
          @update:i="ex.params.I = $event"
          @update:n="ex.params.N = $event"
          @update:a="ex.params.a = $event"
          @update:b="ex.params.b = $event"
          @update:b-field="ex.params.B = $event"
          @update:theta="ex.params.theta = $event"
        />
        <TorqueCoilGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <div class="hint-bar" v-if="!ex.running.value">
      <span>{{ t('experiments.tcHintIdle') }}</span>
    </div>
    <div class="hint-bar success" v-else-if="!ex.paused.value">
      <span>{{ t('experiments.emHintRunning') }}</span>
    </div>
    <div class="hint-bar active" v-else>
      <span>{{ t('experiments.emHintPaused') }}</span>
    </div>
  </div>
</template>

<style scoped>
.em-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; gap: .5rem; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { width: 280px; flex-shrink: 0; }
.vis-col { flex: 1; min-width: 0; align-items: stretch; }
.vis-canvas-wrap { flex: 1; min-height: 0; position: relative; background: #0b1220; border-radius: 8px; overflow: hidden; }
.ctrl-col { width: 280px; flex-shrink: 0; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
@media (max-width: 900px) {
  .lab-grid { flex-direction: column; }
  .data-col, .ctrl-col { width: 100%; }
}
</style>
