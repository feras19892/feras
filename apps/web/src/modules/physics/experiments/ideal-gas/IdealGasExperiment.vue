<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, onMounted, onUnmounted } from 'vue'
import { useIdealGasExperiment } from '../../../../composables/ideal-gas/useIdealGasExperiment'

import { useResetConfirm } from '../../../../composables/useResetConfirm'
import IdealGasMenuBar from '../../../../components/experiment/ideal-gas/IdealGasMenuBar.vue'
import IdealGasCanvas from '../../../../components/experiment/ideal-gas/IdealGasCanvas.vue'
import IdealGasPanelBody from '../../../../components/experiment/ideal-gas/IdealGasPanelBody.vue'
import IdealGasStatusBar from '../../../../components/experiment/ideal-gas/IdealGasStatusBar.vue'
import IdealGasControlBar from '../../../../components/experiment/ideal-gas/IdealGasControlBar.vue'
import IdealGasHelpModal from '../../../../components/experiment/ideal-gas/IdealGasHelpModal.vue'
import IdealGasGuidePanel from '../../../../components/experiment/ideal-gas/IdealGasGuidePanel.vue'
import IdealGasOverlayPanels from '../../../../components/experiment/ideal-gas/IdealGasOverlayPanels.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'
import ResetConfirmModal from '../../../../components/shared/ResetConfirmModal.vue'





const ex = useIdealGasExperiment()

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
  else if (e.key === '?') helpOpen.value = !helpOpen.value
}

onMounted(() => { ex.layout.applyPersistedLayout(); ex.trials.autoLoad(); window.addEventListener('keydown', onKeyDown) })
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="ideal-gas-lab">
    <IdealGasMenuBar
      :title="t('experiments.expIdealGas')"
      icon="&#x1F4A8;"
      @show-all-panels="ex.layout.showAllPanels"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />
    <IdealGasHelpModal :open="helpOpen" @close="helpOpen = false" />

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
            <IdealGasPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :p="ex.lab.P.value"
              :v-rms="ex.lab.vRms.value"
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
          <IdealGasCanvas
            :n="ex.params.n"
            :T="ex.params.T"
            :V="ex.params.V"
            :P="ex.lab.P.value"
            :particles="ex.lab.particles.value"
            :running="ex.lab.running.value"
            @update:v="ex.params.V = $event"
          />
        </div>
        <div class="mode-bar">
          <button class="mode-btn" :class="{ active: ex.lab.mode.value === 'free' }" @click="ex.lab.setMode('free')">{{ t('experiments.modeFree') }}</button>
          <button class="mode-btn" :class="{ active: ex.lab.mode.value === 'isothermal' }" @click="ex.lab.setMode('isothermal')">{{ t('experiments.modeIsothermal') }}</button>
          <button class="mode-btn" :class="{ active: ex.lab.mode.value === 'isobaric' }" @click="ex.lab.setMode('isobaric')">{{ t('experiments.modeIsobaric') }}</button>
          <button class="mode-btn" :class="{ active: ex.lab.mode.value === 'isochoric' }" @click="ex.lab.setMode('isochoric')">{{ t('experiments.modeIsochoric') }}</button>
        </div>
        <IdealGasControlBar
          :launch-label="ex.lab.running.value && !ex.lab.paused.value ? '&#x23F8; ' + t('experiments.pauseBtn') : '&#x25B6; ' + t('experiments.startBtn')"
          :can-undo="ex.trials.canUndo()"
          :can-redo="ex.trials.canRedo()"
          @toggle-pause="ex.lab.togglePause"
          @reset="ex.resetSim"
          @record-trial="ex.trials.recordTrial"
          @clear-trials="ex.trials.clearTrials"
          @export-csv="ex.trials.exportCsv"
          @undo="ex.trials.undo"
          @redo="ex.trials.redo"
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
            <IdealGasPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :p="ex.lab.P.value"
              :v-rms="ex.lab.vRms.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
          <div v-else-if="id === 'params'" class="params-embedded">
            <IdealGasPanelBody
              id="params"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :p="ex.lab.P.value"
              :v-rms="ex.lab.vRms.value"
              @update:params="Object.assign(ex.params, $event)"
            />
          </div>
        </template>
        <IdealGasGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <IdealGasOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :params="ex.params"
      :P="ex.lab.P.value"
      :v-rms="ex.lab.vRms.value"
      @maximize="ex.layout.maximizePanel"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
      @update:params="Object.assign(ex.params, $event)"
    />

    <div class="hint-bar" v-if="!ex.lab.running.value"><span>&#x1F4A1; {{ t('experiments.hintStart') }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.paused.value"><span>&#x23F8; {{ t('experiments.hintPaused') }}</span></div>
    <div class="hint-bar success" v-else><span>&#x2705; {{ t('experiments.hintRunning') }}</span></div>

    <IdealGasStatusBar
      :running="ex.lab.running.value"
      :paused="ex.lab.paused.value"
      :n="ex.params.n"
      :T="ex.params.T"
      :V="ex.params.V"
      :P="ex.lab.P.value"
    />
  </div>
  <ResetConfirmModal />
</template>

<style scoped>
.ideal-gas-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
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
.mode-bar { display: flex; justify-content: center; gap: .4rem; padding: .3rem; background: #0d1117; border-top: 1px solid #1e2530; flex-shrink: 0; }
.mode-btn { padding: .25rem .7rem; border-radius: 6px; border: 1px solid #1e2530; background: #161B22; color: #64748b; font-size: .72rem; cursor: pointer; font-weight: 600; transition: all .15s; }
.mode-btn:hover { border-color: #2D3645; color: #D1D7E0; }
.mode-btn.active { background: rgba(91,141,184,.12); border-color: #5B8DB8; color: #5B8DB8; }
</style>
