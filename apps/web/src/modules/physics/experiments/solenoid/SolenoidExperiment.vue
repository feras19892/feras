<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSolenoidExperiment } from '../../../../composables/electromagnetism/useSolenoidExperiment'
import { useI18n } from '../../../../composables/useI18n'
import MenuBar from '../../../../components/experiment/electromagnetism/MenuBar.vue'
import ControlBar from '../../../../components/experiment/electromagnetism/ControlBar.vue'
import SolenoidCanvas from '../../../../components/experiment/electromagnetism/SolenoidCanvas.vue'
import SolenoidParamPanel from '../../../../components/experiment/electromagnetism/SolenoidParamPanel.vue'
import SolenoidReadingsPanel from '../../../../components/experiment/electromagnetism/SolenoidReadingsPanel.vue'
import SolenoidDataPanel from '../../../../components/experiment/electromagnetism/SolenoidDataPanel.vue'
import SolenoidGuidePanel from '../../../../components/experiment/electromagnetism/SolenoidGuidePanel.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'
import { ref } from 'vue'

const ex = useSolenoidExperiment()
const { t } = useI18n()
const showGuide = ref(true)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.togglePause() }
  else if (e.key === 's' || e.key === 'S') { ex.recordTrial() }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="em-lab">
    <MenuBar
      :title="t('experiments.solTitle')"
      icon="🌀"
      experiment-route="/physics/electromagnetism/solenoid"
      :experiment-name="t('experiments.solTitle')"
      @export-csv="ex.exportCsv"
      @toggle-pause="ex.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.recordTrial"
      @analyze-results="ex.exportToAnalysis"
    />

    <div class="lab-grid">
      <div class="lab-col data-col">
        <DraggablePanel id="readings" :title="t('experiments.emLiveReadings')" @maximize="() => {}" @hide="() => {}" @drop="() => {}">
          <SolenoidReadingsPanel
            :I="ex.params.I"
            :N="ex.params.N"
            :L="ex.probeData.value ? ex.probeData.value.L : ex.params.L"
            :B="ex.probeData.value ? ex.probeData.value.B : ex.B.value"
            :running="ex.running.value"
            :has-probe="!!ex.probeData.value"
          />
        </DraggablePanel>
        <DraggablePanel id="data" :title="t('experiments.emRecordedTrials')" @maximize="() => {}" @hide="() => {}" @drop="() => {}">
          <SolenoidDataPanel
            :trials="ex.trials.value"
            @remove="ex.removeTrial"
            @clear="ex.clearTrials"
          />
        </DraggablePanel>
      </div>

      <div class="lab-col vis-col">
        <div class="vis-canvas-wrap">
          <SolenoidCanvas
            :I="ex.params.I"
            :N="ex.params.N"
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
        <SolenoidParamPanel
          :I="ex.params.I"
          :N="ex.params.N"
          @update:i="ex.params.I = $event"
          @update:n="ex.params.N = $event"
        />
        <SolenoidGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <div class="hint-bar" v-if="!ex.running.value">
      <span>{{ t('experiments.solHintIdle') }}</span>
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
