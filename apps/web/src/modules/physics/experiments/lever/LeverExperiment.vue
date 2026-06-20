<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLeverExperiment } from '../../../../composables/lever/useLeverExperiment'
import LeverMenuBar from '../../../../components/experiment/lever/LeverMenuBar.vue'
import LeverCanvas from '../../../../components/experiment/lever/LeverCanvas.vue'
import LeverControlBar from '../../../../components/experiment/lever/LeverControlBar.vue'
import LeverStatusBar from '../../../../components/experiment/lever/LeverStatusBar.vue'
import LeverHelpModal from '../../../../components/experiment/lever/LeverHelpModal.vue'
import LeverBallTable from '../../../../components/experiment/lever/LeverBallTable.vue'
import LeverPanelBody from '../../../../components/experiment/lever/LeverPanelBody.vue'
import LeverOverlayPanels from '../../../../components/experiment/lever/LeverOverlayPanels.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'

const ex = useLeverExperiment()
const helpOpen = ref(false)

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
  <div class="lever-lab">
    <LeverMenuBar
      title="توازن العارضة"
      icon="⚖️"
      experiment-route="/physics/mechanics/lever"
      experiment-name="Lever Balance"
      @toggle-panel="ex.layout.togglePanel"
      @show-all-panels="ex.layout.showAllPanels"
      @export-csv="ex.trials.exportCsv"
      @toggle-pause="ex.lab.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <LeverHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.colWidths.data + 'px' }">
        <template v-for="id in ex.getColumnPanels('data')" :key="id">
          <DraggablePanel
            v-if="ex.layout.isPanelVisible(id)"
            class="lab-card"
            :id="id"
            :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel"
            @hide="ex.layout.togglePanel"
            @drop="ex.handleDrop"
          >
            <LeverPanelBody
              v-if="id !== 'balls'"
              :id="id"
              :sim="ex.lab.sim"
              :trials="ex.trials.trials.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
            />
            <LeverBallTable
              v-else
              :balls="ex.lab.sim.balls"
              :forces="ex.lab.sim.forces"
              @add-ball="ex.lab.addBall(1, 0)"
              @add-force="ex.lab.addForce(20, 0)"
              @update-mass="ex.lab.setBallMass"
              @update-x="ex.lab.moveBall"
              @update-force="ex.lab.setForceValue"
              @update-force-x="ex.lab.moveForce"
              @remove="ex.lab.removeBall"
              @toggle-force-direction="ex.lab.toggleForceDirection"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <LeverCanvas
          :params="ex.params"
          :sim-state="ex.lab.sim"
          @remove-ball="ex.lab.removeBall"
          @move-ball="ex.lab.moveBall"
          @set-ball-mass="ex.lab.setBallMass"
          @remove-force="ex.lab.removeForce"
          @move-force="ex.lab.moveForce"
        />
      </div>
    </div>

    <LeverOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :sim="ex.lab.sim"
      @maximize="ex.layout.maximizePanel"
      @drop="ex.handleDrop"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
    />

    <div class="hint-bar" v-if="ex.lab.sim.balls.length === 0 && ex.lab.sim.forces.length === 0"><span>💡 اضغط "+ كرة" أو "+ قوة" لإضافة</span></div>
    <div class="hint-bar active" v-else-if="!ex.lab.sim.isBalanced"><span>{{ ex.tutorMessage.value }}</span></div>
    <div class="hint-bar success" v-else><span>⚖️ متوازن! اضغط "تسجيل" لحفظ القراءة</span></div>

    <LeverStatusBar
      :net-torque="ex.lab.sim.netTorque"
      :is-balanced="ex.lab.sim.isBalanced"
      :tilt-deg="ex.lab.sim.tiltDeg"
      :ball-count="ex.lab.sim.balls.length"
      :force-count="ex.lab.sim.forces.length"
    />

    <LeverControlBar
      :launch-label="'▶️ بدء'"
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
</template>

<style scoped>
.lever-lab { background:linear-gradient(180deg,#0f172a,#1e293b); color:#D1D7E0; padding:.4rem .5rem; height:100vh; display:flex; flex-direction:column; gap:.3rem; overflow:hidden; }
.lab-grid { display:flex; flex-direction:row; flex:1; min-height:0; overflow:hidden; }
.lab-col { display:flex; flex-direction:column; gap:.3rem; overflow-y:auto; min-height:0; }
.data-col { flex-shrink:0; }
.vis-col { align-items:stretch; justify-content:flex-start; background:transparent; flex:1; min-width:0; }
.resizer { width:6px; cursor:col-resize; background:rgba(45,54,69,0.5); transition:background .2s; flex-shrink:0; }
.resizer:hover, .resizer:active { background:#5B8DB8; }
.chart-row { display:flex; gap:.5rem; width:100%; margin-top:.3rem; flex:0 0 180px; min-height:0; align-items:stretch; }
.chart-row:empty { display:none; }
.chart-panel { flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden; }
.hint-bar { background:rgba(30,41,59,0.6); backdrop-filter:blur(8px); border:1px solid rgba(91,141,184,0.15); border-radius:6px; padding:.25rem .5rem; font-size:.7rem; color:#8B95A5; text-align:center; flex-shrink:0; }
.hint-bar.active { border-color:rgba(91,141,184,0.4); color:#5B8DB8; background:rgba(91,141,184,.1); }
.hint-bar.success { border-color:rgba(34,197,94,0.4); color:#22c55e; background:rgba(34,197,94,.12); }
</style>
