<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useBiotSavartExperiment } from '../../../../composables/biot-savart/useBiotSavartExperiment'
import { useI18n } from '../../../../composables/useI18n'
import { useResetConfirm } from '../../../../composables/useResetConfirm'
import BiotSavartMenuBar from '../../../../components/experiment/biot-savart/BiotSavartMenuBar.vue'
import BiotSavartCanvas from '../../../../components/experiment/biot-savart/BiotSavartCanvas.vue'
import BiotSavartPanelBody from '../../../../components/experiment/biot-savart/BiotSavartPanelBody.vue'
import BiotSavartStatusBar from '../../../../components/experiment/biot-savart/BiotSavartStatusBar.vue'
import BiotSavartControlBar from '../../../../components/experiment/biot-savart/BiotSavartControlBar.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'
import ResetConfirmModal from '../../../../components/shared/ResetConfirmModal.vue'

const ex = useBiotSavartExperiment()
const { t } = useI18n()
const { confirmReset } = useResetConfirm()
const helpOpen = ref(false)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.lab.togglePause() }
  else if (e.key === 'r' || e.key === 'R') { confirmReset().then(ok => { if (ok) ex.resetSim() }) }
  else if (e.key === 's' || e.key === 'S') ex.trials.recordTrial()
}

onMounted(() => { window.addEventListener('keydown', onKeyDown); ex.layout.applyPersistedLayout(); ex.trials.autoLoad() })
onUnmounted(() => { window.removeEventListener('keydown', onKeyDown) })
</script>

<template>
  <div class="biot-savart-lab">
    <BiotSavartMenuBar
      :title="t('experiments.expBiotSavart')"
      icon="🧲"
      @show-all-panels="ex.layout.showAllPanels"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

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
            <BiotSavartPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :B="ex.lab.B.value"
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
          <BiotSavartCanvas
            v-bind="{
              I: ex.params.I,
              r: ex.params.r,
              R: ex.params.R,
              n: ex.params.n,
              B: ex.lab.B.value,
              shape: ex.params.shape,
              phase: ex.lab.phase.value,
              running: ex.lab.running.value,
              paused: ex.lab.paused.value
            }"
            @update-sim="ex.lab.updateSim"
          />
        </div>
        <BiotSavartControlBar
          :launch-label="ex.lab.running.value && !ex.lab.paused.value ? '⏸️ ' + t('experiments.pauseBtn') : '▶️ ' + t('experiments.startBtn')"
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
            v-if="ex.layout.isPanelVisible(id)"
            class="lab-card"
            :id="id"
            :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel"
            @hide="ex.layout.togglePanel"
            @drop="ex.handleDrop"
          >
            <BiotSavartPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :B="ex.lab.B.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
        </template>
      </div>
    </div>

    <div class="hint-bar" v-if="!ex.lab.running.value"><span>💡 {{ t('experiments.hintStart') }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.paused.value"><span>⏸️ {{ t('experiments.hintPaused') }}</span></div>
    <div class="hint-bar success" v-else><span>✅ {{ t('experiments.hintRunning') }}</span></div>

    <BiotSavartStatusBar
      :running="ex.lab.running.value"
      :paused="ex.lab.paused.value"
      :I="ex.params.I"
      :r="ex.params.r"
      :B="ex.lab.B.value"
      :shape="ex.params.shape"
    />
  </div>
  <ResetConfirmModal />
</template>

<style scoped>
.biot-savart-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 360px; position: relative; }
.vis-canvas-wrap { flex: 1; min-height: 0; position: relative; width: 100%; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.lab-card { min-height: 0; }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
