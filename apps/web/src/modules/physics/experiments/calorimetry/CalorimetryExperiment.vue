<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCalorimetryExperiment } from '../../../../composables/calorimetry/useCalorimetryExperiment'
import { useI18n } from '../../../../composables/useI18n'
import CalorimetryMenuBar from '../../../../components/experiment/calorimetry/CalorimetryMenuBar.vue'
import CalorimetryCanvas from '../../../../components/experiment/calorimetry/CalorimetryCanvas.vue'
import CalorimetryStatusBar from '../../../../components/experiment/calorimetry/CalorimetryStatusBar.vue'
import CalorimetryControlBar from '../../../../components/experiment/calorimetry/CalorimetryControlBar.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'
import CalorimetryPanelBody from '../../../../components/experiment/calorimetry/CalorimetryPanelBody.vue'
import CalorimetryOverlayPanels from '../../../../components/experiment/calorimetry/CalorimetryOverlayPanels.vue'
import CalorimetryHelpModal from '../../../../components/experiment/calorimetry/CalorimetryHelpModal.vue'

const ex = useCalorimetryExperiment()
const { t } = useI18n()
const helpOpen = ref(false)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.lab.togglePause() }
  else if (e.key === 'r' || e.key === 'R') { if (confirm(t('experiments.resetConfirm'))) ex.resetSim() }
  else if (e.key === 's' || e.key === 'S') { ex.trials.recordTrial() }
  else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.shiftKey ? ex.trials.redo() : ex.trials.undo() }
  else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ex.trials.redo() }
  else if (e.key === '?') { helpOpen.value = !helpOpen.value }
}

onMounted(() => { window.addEventListener('keydown', onKeyDown); ex.layout.applyPersistedLayout(); ex.trials.autoLoad() })
onUnmounted(() => { window.removeEventListener('keydown', onKeyDown) })
</script>

<template>
  <div class="calorimetry-lab">
    <CalorimetryMenuBar
      :title="t('experiments.calorimetryTitle')"
      icon="🔥"
      experiment-route="/physics/heat/calorimetry"
      experiment-name="Calorimetry"
      @toggle-panel="ex.layout.togglePanel"
      @show-all-panels="ex.layout.showAllPanels"
      @export-csv="ex.trials.exportCsv"
      @toggle-pause="ex.lab.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <CalorimetryHelpModal :open="helpOpen" @close="helpOpen = false" />

    <CalorimetryStatusBar
      :m-water="ex.params.mWater"
      :t-water="ex.params.tWater"
      :m-metal="ex.params.mMetal"
      :t-metal="ex.params.tMetal"
      :tf="ex.lab.tf.value"
      :c-metal="ex.lab.cMetalMeasured.value"
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
            <CalorimetryPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :metal-options="ex.lab.METAL_OPTIONS"
              :tf="ex.lab.tf.value"
              :c-metal="ex.lab.cMetalMeasured.value"
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
          <CalorimetryCanvas
            :m-water="ex.params.mWater"
            :t-water="ex.params.tWater"
            :m-metal="ex.params.mMetal"
            :t-metal="ex.params.tMetal"
            :tf="ex.lab.tf.value"
            :sim-time="ex.lab.simTime.value"
            :phase="ex.lab.phase.value"
            :current-water-temp="ex.lab.currentWaterTemp.value"
            :current-metal-temp="ex.lab.currentMetalTemp.value"
            :running="ex.lab.running.value"
            :paused="ex.lab.paused.value"
            @update-sim="ex.lab.updateSim"
          />
        </div>
        <CalorimetryControlBar
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
            <CalorimetryPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :metal-options="ex.lab.METAL_OPTIONS"
              :tf="ex.lab.tf.value"
              :c-metal="ex.lab.cMetalMeasured.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
        </template>
      </div>
    </div>

    <CalorimetryOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :params="ex.params"
      :metal-options="ex.lab.METAL_OPTIONS"
      :tf="ex.lab.tf.value"
      :c-metal="ex.lab.cMetalMeasured.value"
      @maximize="ex.layout.maximizePanel"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
      @update:params="Object.assign(ex.params, $event)"
    />
  </div>
</template>

<style scoped>
.calorimetry-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 360px; position: relative; }
.vis-canvas-wrap { flex: 1; min-height: 0; position: relative; width: 100%; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.lab-card { min-height: 0; }
.lab-card :deep(.draggable-panel) { max-height: 100%; }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
</style>
