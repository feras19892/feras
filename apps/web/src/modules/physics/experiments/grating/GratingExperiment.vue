<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGratingExperiment } from '../../../../composables/grating/useGratingExperiment'
import { useI18n } from '../../../../composables/useI18n'
import { useResetConfirm } from '../../../../composables/useResetConfirm'
import GratingMenuBar from '../../../../components/experiment/grating/GratingMenuBar.vue'
import GratingCanvas from '../../../../components/experiment/grating/GratingCanvas.vue'
import GratingPanelBody from '../../../../components/experiment/grating/GratingPanelBody.vue'
import GratingStatusBar from '../../../../components/experiment/grating/GratingStatusBar.vue'
import GratingControlBar from '../../../../components/experiment/grating/GratingControlBar.vue'
import GratingHelpModal from '../../../../components/experiment/grating/GratingHelpModal.vue'
import GratingOverlayPanels from '../../../../components/experiment/grating/GratingOverlayPanels.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'
import ResetConfirmModal from '../../../../components/shared/ResetConfirmModal.vue'

const ex = useGratingExperiment()
const { t } = useI18n()
const { confirmReset } = useResetConfirm()
const helpOpen = ref(false)

function onReset() {
  confirmReset().then(ok => { if (ok) ex.resetSim() })
}

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') {
    e.preventDefault()
    ex.lab.togglePause()
  } else if (e.key === 'r' || e.key === 'R') {
    confirmReset().then(ok => { if (ok) ex.resetSim() })
  } else if (e.key === 's' || e.key === 'S') {
    ex.trials.recordTrial()
  } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    if (e.shiftKey) ex.trials.redo()
    else ex.trials.undo()
  } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    ex.trials.redo()
  } else if (e.key === '?') {
    helpOpen.value = !helpOpen.value
  }
}

onMounted(() => {
  ex.layout.applyPersistedLayout()
  ex.trials.autoLoad()
  window.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="grating-lab">
    <GratingMenuBar
      :title="t('experiments.expGrating')"
      icon="&#x1F4A1;"
      @show-all-panels="ex.layout.showAllPanels"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <GratingHelpModal :open="helpOpen" @close="helpOpen = false" />

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
            <GratingPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :first-order-angle="ex.lab.firstOrderAngle.value"
              :first-order-y="ex.lab.firstOrderY.value"
              :max-order="ex.lab.maxOrder.value"
              :order-positions="ex.lab.orderPositions.value"
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
          <GratingCanvas
            :lines-per-mm="ex.params.linesPerMm"
            :screen-distance="ex.params.screenDistance"
            :wavelength="ex.params.wavelength"
            :order-positions="ex.lab.orderPositions.value"
            :light-color="ex.lab.lightColor.value"
            :running="ex.lab.running.value"
          />
        </div>
        <GratingControlBar
          :launch-label="ex.lab.running.value && !ex.lab.paused.value ? '&#x23F8; ' + t('experiments.pauseBtn') : '&#x25B6; ' + t('experiments.startBtn')"
          :can-undo="ex.trials.canUndo()"
          :can-redo="ex.trials.canRedo()"
          @toggle-pause="ex.lab.togglePause"
          @reset="onReset"
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
            v-if="ex.layout.isPanelVisible(id)"
            class="lab-card"
            :id="id"
            :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel"
            @hide="ex.layout.togglePanel"
            @drop="ex.handleDrop"
          >
            <GratingPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :first-order-angle="ex.lab.firstOrderAngle.value"
              :first-order-y="ex.lab.firstOrderY.value"
              :max-order="ex.lab.maxOrder.value"
              :order-positions="ex.lab.orderPositions.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
        </template>
      </div>
    </div>

    <GratingOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :params="ex.params"
      :first-order-angle="ex.lab.firstOrderAngle.value"
      :first-order-y="ex.lab.firstOrderY.value"
      :max-order="ex.lab.maxOrder.value"
      :order-positions="ex.lab.orderPositions.value"
      @maximize="ex.layout.maximizePanel"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
      @update:params="Object.assign(ex.params, $event)"
    />

    <div class="hint-bar" v-if="!ex.lab.running.value">
      <span>&#x1F4A1; {{ t('experiments.hintStart') }}</span>
    </div>
    <div class="hint-bar active" v-else-if="ex.lab.paused.value">
      <span>&#x23F8; {{ t('experiments.hintPaused') }}</span>
    </div>
    <div class="hint-bar success" v-else>
      <span>&#x2705; {{ t('experiments.hintRunning') }}</span>
    </div>

    <GratingStatusBar
      :running="ex.lab.running.value"
      :paused="ex.lab.paused.value"
      :lines-per-mm="ex.params.linesPerMm"
      :screen-distance="ex.params.screenDistance"
      :wavelength="ex.params.wavelength"
      :first-order-angle="ex.lab.firstOrderAngle.value"
    />
  </div>
  <ResetConfirmModal />
</template>

<style scoped>
.grating-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; position: relative; }
.vis-canvas-wrap { flex: 1; min-height: 0; position: relative; width: 100%; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
