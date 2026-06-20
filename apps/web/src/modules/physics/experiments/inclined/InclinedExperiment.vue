<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useInclinedExperiment } from '../../../../composables/inclined/useInclinedExperiment'
import InclinedMenuBar from '../../../../components/experiment/inclined/InclinedMenuBar.vue'
import InclinedCanvas from '../../../../components/experiment/inclined/InclinedCanvas.vue'
import InclinedPanelBody from '../../../../components/experiment/inclined/InclinedPanelBody.vue'
import InclinedOverlayPanels from '../../../../components/experiment/inclined/InclinedOverlayPanels.vue'
import InclinedControlBar from '../../../../components/experiment/inclined/InclinedControlBar.vue'
import InclinedHelpModal from '../../../../components/experiment/inclined/InclinedHelpModal.vue'
import InclinedReport from '../../../../components/experiment/inclined/InclinedReport.vue'
import InclinedStatusBar from '../../../../components/experiment/inclined/InclinedStatusBar.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'

const ex = useInclinedExperiment()
const helpOpen = ref(false)
const reportOpen = ref(false)
const canvasRef = ref<InstanceType<typeof InclinedCanvas> | null>(null)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.lab.togglePause() }
  else if (e.key === 'r' || e.key === 'R') { if (confirm('هل تريد إعادة تعيين المحاكاة؟')) ex.resetSim() }
  else if (e.key === 's' || e.key === 'S') { ex.trials.recordTrial() }
  else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (e.shiftKey) ex.trials.redo(); else ex.trials.undo() }
  else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ex.trials.redo() }
  else if (e.key === '?') { helpOpen.value = !helpOpen.value }
}
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="inclined-lab">
    <InclinedMenuBar
      @toggle-panel="ex.layout.togglePanel" @show-all-panels="ex.layout.showAllPanels" @export-csv="ex.trials.exportCsv"
      @toggle-pause="ex.lab.togglePause" @reset="ex.resetSim" @record-trial="ex.trials.recordTrial" @run-lab="ex.runInclinedLab"
      @toggle-help="helpOpen = !helpOpen" @print-report="reportOpen = true"
      @analyze-results="ex.exportToAnalysis"
    />

    <InclinedHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.colWidths.data + 'px' }">
        <template v-for="id in ex.getColumnPanels('data')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <InclinedPanelBody :id="id" :trials="ex.trials.trials.value" :params="ex.params" :sim="ex.lab.sim"
              :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :calc-result="ex.trials.calcResult.value"
              @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial" @calc-acceleration="ex.trials.calcAcceleration" @calc-time="ex.trials.calcTime" @calc-velocity="ex.trials.calcVelocity" @calc-normal="ex.trials.calcNormal"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <InclinedCanvas ref="canvasRef" :params="ex.params" :sim-state="ex.lab.sim" />
        <div v-if="ex.hasVisibleVisPanels" class="chart-row">
          <template v-for="id in ex.getColumnPanels('vis')" :key="id">
            <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="chart-panel lab-card" :id="id" :title="ex.layout.panelTitle(id)"
              @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
              <InclinedPanelBody :id="id" :trials="ex.trials.trials.value" :params="ex.params" :sim="ex.lab.sim"
                :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :calc-result="ex.trials.calcResult.value"
                @remove="ex.trials.removeTrial" @calc-acceleration="ex.trials.calcAcceleration" @calc-time="ex.trials.calcTime" @calc-velocity="ex.trials.calcVelocity" @calc-normal="ex.trials.calcNormal"
              />
            </DraggablePanel>
          </template>
        </div>
        <InclinedControlBar
          :launch-label="ex.lab.sim.running && !ex.lab.sim.paused ? '⏸️ توقف' : '▶️ بدء'"
          :speed="ex.lab.speed.value"
          :can-undo="ex.trials.canUndo()"
          :can-redo="ex.trials.canRedo()"
          @toggle-pause="ex.lab.togglePause"
          @reset="ex.resetSim"
          @record-trial="ex.trials.recordTrial"
          @clear-trials="ex.trials.clearTrials"
          @export-csv="ex.trials.exportCsv"
          @undo="ex.trials.undo"
          @redo="ex.trials.redo"
          @update:speed="v => ex.lab.speed.value = v"
        />
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('vis', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.colWidths.ctrl + 'px' }">
        <template v-for="id in ex.getColumnPanels('ctrl')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <InclinedPanelBody :id="id" :trials="ex.trials.trials.value" :params="ex.params" :sim="ex.lab.sim"
              :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :calc-result="ex.trials.calcResult.value"
              @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial" @calc-acceleration="ex.trials.calcAcceleration" @calc-time="ex.trials.calcTime" @calc-velocity="ex.trials.calcVelocity" @calc-normal="ex.trials.calcNormal"
            />
          </DraggablePanel>
        </template>
      </div>
    </div>

    <InclinedOverlayPanels :maximized="ex.layout.maximized" :panel-title="(id: string) => ex.layout.panelTitle(id as any)" :trials="ex.trials.trials.value"
      :params="ex.params" :sim="ex.lab.sim" :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :calc-result="ex.trials.calcResult.value"
      @maximize="ex.layout.maximizePanel" @drop="ex.handleDrop" @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial"
      @calc-acceleration="ex.trials.calcAcceleration" @calc-time="ex.trials.calcTime" @calc-velocity="ex.trials.calcVelocity" @calc-normal="ex.trials.calcNormal"
    />

    <InclinedStatusBar :running="ex.lab.sim.running" :paused="ex.lab.sim.paused" :arrived="ex.lab.sim.arrived" />
    <InclinedReport v-if="reportOpen" style="position:fixed;inset:5%;z-index:200;overflow:auto;background:#0d1117;border-radius:12px;border:1px solid #2D3645;box-shadow:0 20px 60px rgba(0,0,0,.5)"
      :trials="ex.trials.trials.value" :params="ex.params" :trial-stats="ex.trials.trialStats.value"
      @close="reportOpen = false"
    />
  </div>
</template>

<style scoped>
.inclined-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; gap: .3rem; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; padding: .3rem; border-radius: 10px; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.chart-row { display: flex; gap: .5rem; width: 100%; margin-top: .3rem; flex: 0 0 220px; min-height: 0; align-items: stretch; }
.chart-row:empty { display: none; }
.chart-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.lab-col > .lab-card { flex: 1 1 auto; min-height: 0; }
.lab-col > .lab-card + .lab-card { flex: 0 0 auto; }
</style>
