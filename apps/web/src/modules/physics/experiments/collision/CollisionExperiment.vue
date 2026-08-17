<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCollisionExperiment } from '../../../../composables/collision/useCollisionExperiment'
import { useCollisionReport } from '../../../../composables/collision/useCollisionReport'
import { useI18n } from '../../../../composables/useI18n'
import { useResetConfirm } from '../../../../composables/useResetConfirm'
import CollisionMenuBar from '../../../../components/experiment/collision/CollisionMenuBar.vue'
import CollisionCanvas from '../../../../components/experiment/collision/CollisionCanvas.vue'
import CollisionControlBar from '../../../../components/experiment/collision/CollisionControlBar.vue'
import CollisionStatusBar from '../../../../components/experiment/collision/CollisionStatusBar.vue'
import CollisionHelpModal from '../../../../components/experiment/collision/CollisionHelpModal.vue'
import CollisionGuidePanel from '../../../../components/experiment/collision/CollisionGuidePanel.vue'
import CollisionPanelBody from '../../../../components/experiment/collision/CollisionPanelBody.vue'
import CollisionOverlayPanels from '../../../../components/experiment/collision/CollisionOverlayPanels.vue'
import CollisionReport from '../../../../components/experiment/collision/CollisionReport.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'
import ResetConfirmModal from '../../../../components/shared/ResetConfirmModal.vue'

const { t } = useI18n()
const { confirmReset } = useResetConfirm()
const ex = useCollisionExperiment()
const rep = useCollisionReport()
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
  <div class="collision-lab">
    <CollisionMenuBar
      :title="t('experiments.collision1DTitle')"
      icon="💥"
      @show-all-panels="ex.layout.showAllPanels"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <CollisionHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.colWidths.data + 'px' }">
        <template v-for="id in ex.getColumnPanels('data')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <CollisionPanelBody :id="id" :params="ex.params" :sim="ex.lab.sim" :trials="ex.trials.trials.value" :signal-series="ex.lab.signalSeries.value"
              @update:params="ex.updateParams($event)" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <CollisionCanvas :params="ex.params" :sim-state="ex.lab.sim" />
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('vis', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.colWidths.ctrl + 'px' }">
        <template v-for="id in ex.getColumnPanels('ctrl')" :key="id">
          <DraggablePanel v-if="id !== 'params' && ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <CollisionPanelBody :id="id" :params="ex.params" :sim="ex.lab.sim" :trials="ex.trials.trials.value" :signal-series="ex.lab.signalSeries.value"
              @update:params="ex.updateParams($event)" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
            />
          </DraggablePanel>
          <div v-else-if="id === 'params'" class="params-embedded">
            <CollisionPanelBody id="params" :params="ex.params" :sim="ex.lab.sim" :trials="ex.trials.trials.value" :signal-series="ex.lab.signalSeries.value"
              @update:params="ex.updateParams($event)"
            />
          </div>
        </template>
        <CollisionGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <CollisionOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :params="ex.params"
      :sim="ex.lab.sim"
      :trials="ex.trials.trials.value" :signal-series="ex.lab.signalSeries.value"
      @maximize="ex.layout.maximizePanel"
      @update:params="ex.updateParams($event)"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
    />

    <div class="hint-bar" v-if="!ex.lab.sim.running"><span>💡 {{ t('experiments.setParamsAndStartHint') }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.sim.running && !ex.lab.sim.paused && !ex.lab.sim.collided"><span>⏳ {{ t('experiments.ballsMovingHint') }}</span></div>
    <div class="hint-bar success" v-else-if="ex.lab.sim.collided"><span>💥 {{ t('experiments.collisionRecordHint') }}</span></div>
    <div class="hint-bar" v-else><span>⏸️ {{ t('experiments.pausedTemporarily') }}</span></div>

    <CollisionStatusBar :running="ex.lab.sim.running" :paused="ex.lab.sim.paused" :collided="ex.lab.sim.collided" />

    <CollisionReport v-if="reportOpen" style="position:fixed;inset:5%;z-index:200;overflow:auto;background:#0d1117;border-radius:12px;border:1px solid #2D3645;box-shadow:0 20px 60px rgba(0,0,0,.5)"
      :trials="ex.trials.trials.value" :trial-stats="ex.trials.trialStats.value"
      @close="reportOpen = false" @open-full-report="rep.openFullReport(ex)"
    />

    <CollisionControlBar
      :launch-label="ex.lab.sim.running && !ex.lab.sim.paused ? '⏸️ ' + t('experiments.pauseBtn') : '▶️ ' + t('experiments.startBtn')"
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
  <ResetConfirmModal />
</template>

<style scoped>
.collision-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.params-embedded { padding: .6rem; }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.chart-row { display: flex; gap: .5rem; width: 100%; margin-top: .3rem; flex: 0 0 180px; min-height: 0; align-items: stretch; }
.chart-row:empty { display: none; }
.chart-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
