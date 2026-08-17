<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useGeneratorExperiment } from '../../../../composables/electromagnetism/useGeneratorExperiment'
import { useI18n } from '../../../../composables/useI18n'
import MenuBar from '../../../../components/experiment/electromagnetism/MenuBar.vue'
import ControlBar from '../../../../components/experiment/electromagnetism/ControlBar.vue'
import GeneratorCanvas from '../../../../components/experiment/electromagnetism/GeneratorCanvas.vue'
import GeneratorParamPanel from '../../../../components/experiment/electromagnetism/GeneratorParamPanel.vue'
import GeneratorReadingsPanel from '../../../../components/experiment/electromagnetism/GeneratorReadingsPanel.vue'
import GeneratorDataPanel from '../../../../components/experiment/electromagnetism/GeneratorDataPanel.vue'
import GeneratorGuidePanel from '../../../../components/experiment/electromagnetism/GeneratorGuidePanel.vue'
import ElectromagnetismHelpModal from '../../../../components/experiment/electromagnetism/ElectromagnetismHelpModal.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'

const ex = useGeneratorExperiment()
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
  <div class="gen-lab">
    <MenuBar
      :title="t('experiments.genTitle')"
      icon="⚙️"
      @toggle-help="helpOpen = !helpOpen"
    />

    <ElectromagnetismHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col">
        <DraggablePanel id="readings" :title="t('experiments.emLiveReadings')" @maximize="() => {}" @hide="() => {}" @drop="() => {}">
          <GeneratorReadingsPanel
            :B="ex.params.B"
            :N="ex.params.N"
            :A="ex.params.A"
            :omega="ex.params.omega"
            :R="ex.params.R"
            :emf-peak="ex.probeData.value ? ex.probeData.value.emf : ex.emfPeak.value"
            :i-peak="ex.probeData.value ? ex.probeData.value.i : ex.iPeak.value"
            :frequency="ex.frequency.value"
            :power-peak="ex.powerPeak.value"
            :running="ex.running.value"
            :has-probe="!!ex.probeData.value"
          />
        </DraggablePanel>
        <DraggablePanel id="data" :title="t('experiments.emRecordedTrials')" @maximize="() => {}" @hide="() => {}" @drop="() => {}">
          <GeneratorDataPanel
            :trials="ex.trials.value"
            @remove="ex.removeTrial"
            @clear="ex.clearTrials"
          />
        </DraggablePanel>
      </div>

      <div class="lab-col vis-col">
        <div class="vis-canvas-wrap">
          <GeneratorCanvas
            :B="ex.params.B"
            :N="ex.params.N"
            :A="ex.params.A"
            :omega="ex.params.omega"
            :R="ex.params.R"
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
        <GeneratorParamPanel
          :B="ex.params.B"
          :N="ex.params.N"
          :A="ex.params.A"
          :omega="ex.params.omega"
          :R="ex.params.R"
          @update:b="ex.params.B = $event"
          @update:n="ex.params.N = $event"
          @update:a="ex.params.A = $event"
          @update:omega="ex.params.omega = $event"
          @update:r="ex.params.R = $event"
        />
        <GeneratorGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <div class="hint-bar" v-if="!ex.running.value">
      <span>{{ t('experiments.genHintIdle') }}</span>
    </div>
    <div class="hint-bar success" v-else-if="!ex.paused.value">
      <span>{{ t('experiments.genHintRunning') }}</span>
    </div>
    <div class="hint-bar active" v-else>
      <span>{{ t('experiments.genHintPaused') }}</span>
    </div>
  </div>
</template>

<style scoped>
.gen-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
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
