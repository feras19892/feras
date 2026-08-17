<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePendulumExperiment } from '../../../../composables/pendulum/usePendulumExperiment'
import { usePendulumReport } from '../../../../composables/pendulum/usePendulumReport'
import { useI18n } from '../../../../composables/useI18n'
import { useResetConfirm } from '../../../../composables/useResetConfirm'
import PendulumMenuBar from '../../../../components/experiment/pendulum/PendulumMenuBar.vue'
import PendulumCanvas from '../../../../components/experiment/pendulum/PendulumCanvas.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'
import PendulumPanelBody from '../../../../components/experiment/pendulum/PendulumPanelBody.vue'
import PendulumOverlayPanels from '../../../../components/experiment/pendulum/PendulumOverlayPanels.vue'
import PendulumControlBar from '../../../../components/experiment/pendulum/PendulumControlBar.vue'
import PendulumHelpModal from '../../../../components/experiment/pendulum/PendulumHelpModal.vue'
import PendulumGuidePanel from '../../../../components/experiment/pendulum/PendulumGuidePanel.vue'
import PendulumReport from '../../../../components/experiment/pendulum/PendulumReport.vue'
import ResetConfirmModal from '../../../../components/shared/ResetConfirmModal.vue'

const ex = usePendulumExperiment()
const rep = usePendulumReport()
const { t } = useI18n()
const { confirmReset } = useResetConfirm()
const helpOpen = ref(false)
const showGuide = ref(true)
const reportOpen = ref(false)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.lab.togglePause() }
  else if (e.key === 'r' || e.key === 'R') { confirmReset().then(ok => { if (ok) ex.resetSim() }) }
  else if (e.key === 's' || e.key === 'S') { ex.trials.recordTrial() }
  else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (e.shiftKey) ex.trials.redo(); else ex.trials.undo() }
  else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ex.trials.redo() }
  else if (e.key === '?') { helpOpen.value = !helpOpen.value }
}
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="pendulum-lab">
    <PendulumMenuBar
      :title="t('experiments.pendulumTitle')"
      icon="🕰️"
      @show-all-panels="ex.layout.showAllPanels"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <PendulumHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.colWidths.data + 'px' }">
        <template v-for="id in ex.getColumnPanels('data')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <PendulumPanelBody :id="id" :trials="ex.trials.trials.value" :params="ex.params" :sim="ex.lab.sim" :measured="ex.getMeasured()"
              @update:trials="ex.trials.trials.value = $event" @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <PendulumCanvas :params="ex.params" :sim-state="ex.lab.sim" :oscillation-count="Math.floor(ex.lab.sim.zeroCrossings.length / 2)" />
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('vis', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.colWidths.ctrl + 'px' }">
        <template v-for="id in ex.getColumnPanels('ctrl')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <PendulumPanelBody :id="id" :trials="ex.trials.trials.value" :params="ex.params" :sim="ex.lab.sim" :measured="ex.getMeasured()"
              @update:trials="ex.trials.trials.value = $event" @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
            />
          </DraggablePanel>
        </template>
        <PendulumGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <PendulumOverlayPanels :maximized="ex.layout.maximized" :panel-title="ex.layout.panelTitle" :trials="ex.trials.trials.value"
      :params="ex.params" :sim="ex.lab.sim" :measured="ex.getMeasured()"
      @maximize="ex.layout.maximizePanel" @drop="ex.handleDrop" @update:trials="ex.trials.trials.value = $event" @update:params="Object.assign(ex.params, $event)"
      @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
    />

    <PendulumControlBar
      :launch-label="ex.lab.sim.running && !ex.lab.sim.paused ? '⏸️ ' + t('experiments.pauseBtn') : '▶️ ' + t('experiments.startBtn')"
      :speed="ex.lab.speed.value"
      :can-undo="ex.trials.canUndo()"
      :can-redo="ex.trials.canRedo()"
      :step-index="ex.stepIndex.value"
      :running="ex.lab.sim.running"
      :paused="ex.lab.sim.paused"
      @toggle-pause="ex.lab.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @clear-trials="ex.trials.clearTrials"
      @export-csv="ex.trials.exportCsv"
      @undo="ex.trials.undo"
      @redo="ex.trials.redo"
      @update:speed="v => ex.lab.speed.value = v"
    />

    <div class="hint-bar" v-if="!ex.lab.sim.running"><span>💡 {{ t('experiments.hintStart') }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.sim.measurementPeriod === null"><span>⏳ {{ t('experiments.hintWaitStable') }}</span></div>
    <div class="hint-bar success" v-else><span>✅ {{ t('experiments.hintStable') }}</span></div>

    <PendulumReport v-if="reportOpen" style="position:fixed;inset:5%;z-index:200;overflow:auto;background:#0d1117;border-radius:12px;border:1px solid #2D3645;box-shadow:0 20px 60px rgba(0,0,0,.5)"
      :trials="ex.trials.trials.value" :g-theoretical="ex.params.g"
      @close="reportOpen = false" @open-full-report="rep.openFullReport(ex)"
    />
  </div>
  <ResetConfirmModal />
</template>

<style scoped>
.pendulum-lab { background: linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); color: #e2e8f0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; gap: .3rem; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; padding: .3rem; border-radius: 10px; }
.data-col { background: rgba(30,41,59,0.5); border: 1px solid rgba(71,85,105,0.3); backdrop-filter: blur(4px); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; }
.ctrl-col { background: rgba(30,41,59,0.5); border: 1px solid rgba(71,85,105,0.3); backdrop-filter: blur(4px); }
.resizer { width: 5px; cursor: col-resize; background: #334155; transition: background .2s; flex-shrink: 0; border-radius: 3px; }
.resizer:hover, .resizer:active { background: #60a5fa; box-shadow: 0 0 6px rgba(96,165,250,0.4); }
.chart-row { display: flex; gap: .5rem; width: 100%; margin-top: .3rem; flex: 0 0 200px; min-height: 0; align-items: stretch; }
.chart-row:empty { display: none; }
.chart-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; border-radius: 8px; }
.hint-bar { background: linear-gradient(90deg, rgba(30,41,59,0.8), rgba(51,65,85,0.6)); border: 1px solid rgba(71,85,105,0.4); border-radius: 8px; padding: .4rem .8rem; font-size: .78rem; color: #94a3b8; text-align: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.hint-bar.active { border-color: #60a5fa; color: #60a5fa; background: rgba(96,165,250,0.08); }
.hint-bar.success { border-color: #34d399; color: #34d399; background: rgba(52,211,153,0.08); }
</style>
