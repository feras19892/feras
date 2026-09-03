<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { onMounted, onUnmounted } from 'vue'
import { useFaradayLawExperiment } from '../../../../composables/electromagnetism/useFaradayLawExperiment'

import MenuBar from '../../../../components/experiment/electromagnetism/MenuBar.vue'
import ControlBar from '../../../../components/experiment/electromagnetism/ControlBar.vue'
import FaradayLawCanvas from '../../../../components/experiment/electromagnetism/FaradayLawCanvas.vue'
import FaradayLawParamPanel from '../../../../components/experiment/electromagnetism/FaradayLawParamPanel.vue'
import FaradayLawReadingsPanel from '../../../../components/experiment/electromagnetism/FaradayLawReadingsPanel.vue'
import FaradayLawDataPanel from '../../../../components/experiment/electromagnetism/FaradayLawDataPanel.vue'
import FaradayLawGuidePanel from '../../../../components/experiment/electromagnetism/FaradayLawGuidePanel.vue'
import ElectromagnetismHelpModal from '../../../../components/experiment/electromagnetism/ElectromagnetismHelpModal.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'
import { ref } from 'vue'





const ex = useFaradayLawExperiment()

const showGuide = ref(true)
const helpOpen = ref(false)
const activeTab = ref<'faraday' | 'lenz'>('faraday')

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
      :title="activeTab === 'lenz' ? t('experiments.lenzTitle') : t('experiments.faradayTitle')"
      icon="🔋"
      @toggle-help="helpOpen = !helpOpen"
    />

    <ElectromagnetismHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'faraday' }" @click="activeTab = 'faraday'">⚡ {{ t('experiments.faradayTab') }}</button>
      <button class="tab-btn" :class="{ active: activeTab === 'lenz' }" @click="activeTab = 'lenz'">↩️ {{ t('experiments.lenzTab') }}</button>
    </div>

    <div class="lab-grid">
      <div class="lab-col data-col">
        <DraggablePanel id="readings" :title="t('experiments.emLiveReadings')" @maximize="() => {}" @hide="() => {}" @drop="() => {}">
          <FaradayLawReadingsPanel
            :B="ex.params.B"
            :N="ex.params.N"
            :A="ex.params.A"
            :v="ex.params.v"
            :R="ex.params.R"
            :emf-max="ex.probeData.value ? ex.probeData.value.emf : ex.emfMax.value"
            :i-max="ex.probeData.value ? ex.probeData.value.i : ex.iMax.value"
            :flux-max="ex.probeData.value ? ex.probeData.value.flux : ex.fluxMax.value"
            :direction="ex.probeData.value ? ex.probeData.value.direction : ex.directionNow.value"
            :running="ex.running.value"
            :has-probe="!!ex.probeData.value"
            :mode="activeTab"
          />
        </DraggablePanel>
        <DraggablePanel id="data" :title="t('experiments.emRecordedTrials')" @maximize="() => {}" @hide="() => {}" @drop="() => {}">
          <FaradayLawDataPanel
            :trials="ex.trials.value"
            :mode="activeTab"
            @remove="ex.removeTrial"
            @clear="ex.clearTrials"
          />
        </DraggablePanel>
      </div>

      <div class="lab-col vis-col">
        <div class="vis-canvas-wrap">
          <FaradayLawCanvas
            :B="ex.params.B"
            :N="ex.params.N"
            :A="ex.params.A"
            :v="ex.params.v"
            :R="ex.params.R"
            :d="ex.params.d"
            :running="ex.running.value"
            :paused="ex.paused.value"
            :mode="activeTab"
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
        <FaradayLawParamPanel
          :B="ex.params.B"
          :N="ex.params.N"
          :A="ex.params.A"
          :v="ex.params.v"
          :R="ex.params.R"
          :d="ex.params.d"
          :mode="activeTab"
          @update:b="ex.params.B = $event"
          @update:n="ex.params.N = $event"
          @update:a="ex.params.A = $event"
          @update:v="ex.params.v = $event"
          @update:r="ex.params.R = $event"
          @update:d="ex.params.d = $event"
        />
        <FaradayLawGuidePanel :visible="showGuide" :mode="activeTab" @close="showGuide = false" />
      </div>
    </div>

    <div class="hint-bar" v-if="!ex.running.value">
      <span>{{ t('experiments.faradayHintIdle') }}</span>
    </div>
    <div class="hint-bar success" v-else-if="!ex.paused.value">
      <span>{{ t('experiments.faradayHintRunning') }}</span>
    </div>
    <div class="hint-bar active" v-else>
      <span>{{ t('experiments.faradayHintPaused') }}</span>
    </div>
  </div>
</template>

<style scoped>
.em-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.tab-bar { display: flex; gap: .5rem; flex-shrink: 0; }
.tab-btn { flex: 1; padding: .5rem; background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; color: #8B95A5; font-size: .85rem; font-weight: 700; cursor: pointer; transition: all .2s; }
.tab-btn:hover { background: #2D3645; color: #D1D7E0; }
.tab-btn.active { background: rgba(34,197,94,.12); border-color: #22c55e; color: #22c55e; }
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
