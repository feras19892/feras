<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, onMounted, onUnmounted } from 'vue'
import { useSpecificHeatExperiment } from '../../../../composables/specific-heat/useSpecificHeatExperiment'

import { useResetConfirm } from '../../../../composables/useResetConfirm'
import SpecificHeatMenuBar from '../../../../components/experiment/specific-heat/SpecificHeatMenuBar.vue'
import SpecificHeatLab from '../../../../components/experiment/specific-heat/SpecificHeatLab.vue'
import SpecificHeatPanelBody from '../../../../components/experiment/specific-heat/SpecificHeatPanelBody.vue'
import SpecificHeatStatusBar from '../../../../components/experiment/specific-heat/SpecificHeatStatusBar.vue'
import SpecificHeatControlBar from '../../../../components/experiment/specific-heat/SpecificHeatControlBar.vue'
import SpecificHeatHelpModal from '../../../../components/experiment/specific-heat/SpecificHeatHelpModal.vue'
import SpecificHeatGuidePanel from '../../../../components/experiment/specific-heat/SpecificHeatGuidePanel.vue'
import SpecificHeatParamsPanel from '../../../../components/experiment/specific-heat/panels/SpecificHeatParamsPanel.vue'
import SpecificHeatOverlayPanels from '../../../../components/experiment/specific-heat/SpecificHeatOverlayPanels.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'
import ResetConfirmModal from '../../../../components/shared/ResetConfirmModal.vue'





const ex = useSpecificHeatExperiment()

const { confirmReset } = useResetConfirm()
const helpOpen = ref(false)
const showGuide = ref(true)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.lab.togglePause() }
  else if (e.key === 'r' || e.key === 'R') { confirmReset().then(ok => { if (ok) ex.resetSim() }) }
  else if (e.key === 's' || e.key === 'S') ex.trials.recordTrial()
  else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (e.shiftKey) ex.trials.redo(); else ex.trials.undo() }
  else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ex.trials.redo() }
  else if (e.key === '?') { helpOpen.value = !helpOpen.value }
}

onMounted(() => { window.addEventListener('keydown', onKeyDown); ex.layout.applyPersistedLayout(); ex.trials.autoLoad() })
onUnmounted(() => { window.removeEventListener('keydown', onKeyDown) })
</script>

<template>
  <div class="specific-heat-lab">
    <SpecificHeatMenuBar
      :title="t('experiments.expSpecificHeat')"
      icon="🌡️"
      @show-all-panels="ex.layout.showAllPanels"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <SpecificHeatHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.layout.widths.data + 'px' }">
        <template v-for="id in ex.layout.columnMap.data" :key="id">
          <DraggablePanel
            v-if="ex.layout.isPanelVisible(id)"
            class="lab-card"
            :id="id"
            :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel"
            @hide="ex.layout.togglePanel"
            @drop="ex.handleDrop"
          >
            <SpecificHeatPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :metal-temp="ex.lab.metalTemp.value"
              :display-t="ex.lab.displayT.value"
              :final-temp="ex.lab.finalTemp.value"
              :c-extracted="ex.lab.cExtracted.value"
              :c-true="ex.lab.cTrue.value"
              :regression-slope="ex.regression.value.m"
              :regression-intercept="ex.regression.value.b"
              :r-squared="ex.regression.value.r2"
              :c-from-slope="ex.cFromSlope.value"
              :unknown-mode="ex.lab.unknownMode.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <div class="vis-canvas-wrap">
          <SpecificHeatLab
            :metal-type="ex.params.metalType"
            :metal-mass="ex.params.metalMass"
            :water-mass="ex.params.waterMass"
            :water-temp="ex.params.waterTemp"
            :metal-temp="ex.lab.metalTemp.value"
            :display-t="ex.lab.displayT.value"
            :final-t="ex.lab.finalTemp.value"
            :phase="ex.lab.phase.value"
            :running="ex.lab.running.value"
            :paused="ex.lab.paused.value"
            :unknown-mode="ex.lab.unknownMode.value"
            @update-sim="ex.lab.updateSim"
            @transfer="ex.lab.transferMetal"
            @toggle-pause="ex.lab.togglePause"
            @record-trial="ex.trials.recordTrial"
          />
        </div>
        <SpecificHeatControlBar
          :launch-label="ex.lab.running.value && !ex.lab.paused.value ? '⏸️ ' + t('experiments.pauseBtn') : '▶️ ' + t('experiments.startBtn')"
          :can-transfer="ex.lab.phase.value === 'transfer'"
          :can-undo="ex.trials.canUndo()"
          :can-redo="ex.trials.canRedo()"
          :unknown-mode="ex.lab.unknownMode.value"
          @toggle-pause="ex.lab.togglePause"
          @transfer="ex.lab.transferMetal"
          @reset="ex.resetSim"
          @record-trial="ex.trials.recordTrial"
          @clear-trials="ex.trials.clearTrials"
          @export-csv="ex.trials.exportCsv"
          @undo="ex.trials.undo"
          @redo="ex.trials.redo"
          @toggle-unknown="ex.lab.unknownMode.value = !ex.lab.unknownMode.value"
        />
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('ctrl', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.layout.widths.ctrl + 'px' }">
        <template v-for="id in ex.layout.columnMap.ctrl" :key="id">
          <DraggablePanel
            v-if="id !== 'params' && ex.layout.isPanelVisible(id)"
            class="lab-card"
            :id="id"
            :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel"
            @hide="ex.layout.togglePanel"
            @drop="ex.handleDrop"
          >
            <SpecificHeatPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :metal-temp="ex.lab.metalTemp.value"
              :display-t="ex.lab.displayT.value"
              :final-temp="ex.lab.finalTemp.value"
              :c-extracted="ex.lab.cExtracted.value"
              :c-true="ex.lab.cTrue.value"
              :regression-slope="ex.regression.value.m"
              :regression-intercept="ex.regression.value.b"
              :r-squared="ex.regression.value.r2"
              :c-from-slope="ex.cFromSlope.value"
              :unknown-mode="ex.lab.unknownMode.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
          <div v-else-if="id === 'params'" class="params-embedded">
            <SpecificHeatParamsPanel
              :params="ex.params"
              :unknown-mode="ex.lab.unknownMode.value"
              @update:params="Object.assign(ex.params, $event)"
            />
          </div>
        </template>
        <SpecificHeatGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <SpecificHeatOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :params="ex.params"
      :metal-temp="ex.lab.metalTemp.value"
      :display-t="ex.lab.displayT.value"
      :final-temp="ex.lab.finalTemp.value"
      :c-extracted="ex.lab.cExtracted.value"
      :c-true="ex.lab.cTrue.value"
      :regression-slope="ex.regression.value.m"
      :regression-intercept="ex.regression.value.b"
      :r-squared="ex.regression.value.r2"
      :c-from-slope="ex.cFromSlope.value"
      :unknown-mode="ex.lab.unknownMode.value"
      @maximize="ex.layout.maximizePanel"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
      @update:params="Object.assign(ex.params, $event)"
    />

    <div class="hint-bar" v-if="!ex.lab.running.value"><span>💡 {{ t('experiments.hintStart') }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.paused.value"><span>⏸️ {{ t('experiments.hintPaused') }}</span></div>
    <div class="hint-bar success" v-else><span>✅ {{ t('experiments.hintRunning') }}</span></div>

    <SpecificHeatStatusBar
      :running="ex.lab.running.value"
      :paused="ex.lab.paused.value"
      :metal-type="ex.params.metalType"
      :metal-mass="ex.params.metalMass"
      :water-mass="ex.params.waterMass"
      :water-temp="ex.params.waterTemp"
      :display-t="ex.lab.displayT.value"
      :phase="ex.lab.phase.value"
      :c-extracted="ex.lab.cExtracted.value"
      :unknown-mode="ex.lab.unknownMode.value"
    />
  </div>
  <ResetConfirmModal />
</template>

<style scoped>
.specific-heat-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 360px; position: relative; }
.vis-canvas-wrap { flex: 1; min-height: 0; position: relative; width: 100%; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.lab-card { min-height: 0; }
.params-embedded { padding: .6rem; }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
