<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, onMounted, onUnmounted } from 'vue'
import { useThermalExpansionExperiment } from '../../../../composables/thermal-expansion/useThermalExpansionExperiment'

import { useResetConfirm } from '../../../../composables/useResetConfirm'
import ThermalExpansionMenuBar from '../../../../components/experiment/thermal-expansion/ThermalExpansionMenuBar.vue'
import ThermalExpansionCanvas from '../../../../components/experiment/thermal-expansion/ThermalExpansionCanvas.vue'
import ThermalExpansionStatusBar from '../../../../components/experiment/thermal-expansion/ThermalExpansionStatusBar.vue'
import ThermalExpansionControlBar from '../../../../components/experiment/thermal-expansion/ThermalExpansionControlBar.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'
import ThermalExpansionPanelBody from '../../../../components/experiment/thermal-expansion/ThermalExpansionPanelBody.vue'
import ThermalExpansionOverlayPanels from '../../../../components/experiment/thermal-expansion/ThermalExpansionOverlayPanels.vue'
import ThermalExpansionHelpModal from '../../../../components/experiment/thermal-expansion/ThermalExpansionHelpModal.vue'
import ThermalExpansionGuidePanel from '../../../../components/experiment/thermal-expansion/ThermalExpansionGuidePanel.vue'
import ResetConfirmModal from '../../../../components/shared/ResetConfirmModal.vue'





const ex = useThermalExpansionExperiment()

const { confirmReset } = useResetConfirm()
const helpOpen = ref(false)
const showGuide = ref(true)
const hoveredField = ref('')

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.lab.togglePause() }
  else if (e.key === 'r' || e.key === 'R') { confirmReset().then(ok => { if (ok) ex.resetSim() }) }
  else if (e.key === 's' || e.key === 'S') { ex.trials.recordTrial() }
  else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.shiftKey ? ex.trials.redo() : ex.trials.undo() }
  else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ex.trials.redo() }
  else if (e.key === '?') { helpOpen.value = !helpOpen.value }
}

onMounted(() => { window.addEventListener('keydown', onKeyDown); ex.layout.applyPersistedLayout(); ex.trials.autoLoad() })
onUnmounted(() => { window.removeEventListener('keydown', onKeyDown) })
</script>

<template>
  <div class="thermal-lab">
    <ThermalExpansionMenuBar
      :title="t('experiments.thermalTitle')"
      icon="🔥"
      @show-all-panels="ex.layout.showAllPanels"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />
    <ThermalExpansionHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.layout.widths.data + 'px' }">
        <template v-for="id in ex.layout.columnMap.data" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <ThermalExpansionPanelBody :id="id" :trials="ex.trials.trials.value" :params="ex.params"
              :alpha="ex.lab.alpha.value" :d-l="ex.lab.dL.value" :L1="ex.lab.L1.value"
              @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials" @update:params="Object.assign(ex.params, $event)"
              @hover-field="hoveredField = $event" />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <div class="vis-canvas-wrap">
          <ThermalExpansionCanvas
            :material="ex.params.material" :L0="ex.params.L0" :t0="ex.params.t0" :t1="ex.params.t1"
            :current-t="ex.lab.currentT.value" :phase="ex.lab.phase.value"
            :running="ex.lab.running.value" :paused="ex.lab.paused.value"
            :highlight-field="hoveredField"
            @update-sim="ex.lab.updateSim" />
        </div>
        <ThermalExpansionControlBar
          :launch-label="ex.lab.running.value && !ex.lab.paused.value ? '⏸️ ' + t('experiments.pauseBtn') : '▶️ ' + t('experiments.startBtn')"
          :can-undo="ex.trials.canUndo()" :can-redo="ex.trials.canRedo()"
          @toggle-pause="ex.lab.togglePause" @reset="ex.resetSim" @record-trial="ex.trials.recordTrial"
          @clear-trials="ex.trials.clearTrials" @export-csv="ex.trials.exportCsv"
          @undo="ex.trials.undo" @redo="ex.trials.redo" />
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('ctrl', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.layout.widths.ctrl + 'px' }">
        <template v-for="id in ex.layout.columnMap.ctrl" :key="id">
          <DraggablePanel v-if="id !== 'params' && ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <ThermalExpansionPanelBody :id="id" :trials="ex.trials.trials.value" :params="ex.params"
              :alpha="ex.lab.alpha.value" :d-l="ex.lab.dL.value" :L1="ex.lab.L1.value"
              @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials" @update:params="Object.assign(ex.params, $event)"
              @hover-field="hoveredField = $event" />
          </DraggablePanel>
          <div v-else-if="id === 'params'" class="params-embedded">
            <ThermalExpansionPanelBody id="params" :trials="ex.trials.trials.value" :params="ex.params"
              :alpha="ex.lab.alpha.value" :d-l="ex.lab.dL.value" :L1="ex.lab.L1.value"
              @update:params="Object.assign(ex.params, $event)"
              @hover-field="hoveredField = $event" />
          </div>
        </template>
        <ThermalExpansionGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>
    <ThermalExpansionOverlayPanels
      :maximized="ex.layout.maximized" :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value" :params="ex.params"
      :alpha="ex.lab.alpha.value" :d-l="ex.lab.dL.value" :L1="ex.lab.L1.value"
      @maximize="ex.layout.maximizePanel" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
      @update:params="Object.assign(ex.params, $event)" />

    <div class="hint-bar" v-if="!ex.lab.running.value"><span>&#x1F4A1; {{ t('experiments.hintStart') }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.paused.value"><span>&#x23F8; {{ t('experiments.hintPaused') }}</span></div>
    <div class="hint-bar success" v-else><span>&#x2705; {{ t('experiments.hintRunning') }}</span></div>

    <ThermalExpansionStatusBar
      :running="ex.lab.running.value"
      :paused="ex.lab.paused.value"
      :material="ex.params.material"
      :L0="ex.params.L0"
      :t0="ex.params.t0"
      :t1="ex.params.t1"
      :current-t="ex.lab.currentT.value"
      :d-l="ex.lab.dL.value"
      :phase="ex.lab.phase.value"
    />
  </div>
  <ResetConfirmModal />
</template>

<style scoped>
.thermal-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 360px; position: relative; }
.vis-canvas-wrap { flex: 1; min-height: 0; position: relative; width: 100%; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.params-embedded { padding: .6rem; }
.lab-card { min-height: 0; }
.lab-card :deep(.draggable-panel) { max-height: 100%; }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
