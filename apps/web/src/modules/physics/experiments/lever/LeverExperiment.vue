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
      @start-challenge="ex.startChallenge"
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
              :challenge-solved="ex.challengeSolved.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @start-challenge="ex.startChallenge"
              @check-challenge="ex.checkChallenge"
            />
            <LeverBallTable
              v-else
              :balls="ex.lab.sim.balls"
              :forces="ex.lab.sim.forces"
              @add-ball="ex.lab.addBall(1, 0)"
              @add-force="ex.lab.addForce(20, 0, -1)"
              @update-mass="ex.lab.setBallMass"
              @update-x="ex.lab.moveBall"
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
          @add-ball="ex.lab.addBall"
          @add-force="ex.lab.addForce"
          @remove-ball="ex.lab.removeBall"
          @move-ball="ex.lab.moveBall"
          @set-ball-mass="ex.lab.setBallMass"
          @remove-force="ex.lab.removeForce"
          @move-force="ex.lab.moveForce"
          @toggle-force-direction="ex.lab.toggleForceDirection"
        />
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('vis', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.colWidths.ctrl + 'px' }">
        <template v-for="id in ex.getColumnPanels('ctrl')" :key="id">
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
              :challenge-solved="ex.challengeSolved.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @start-challenge="ex.startChallenge"
              @check-challenge="ex.checkChallenge"
            />
            <LeverBallTable
              v-else
              :balls="ex.lab.sim.balls"
              :forces="ex.lab.sim.forces"
              @add-ball="ex.lab.addBall(1, 0)"
              @add-force="ex.lab.addForce(20, 0, -1)"
              @update-mass="ex.lab.setBallMass"
              @update-x="ex.lab.moveBall"
              @remove="ex.lab.removeBall"
              @toggle-force-direction="ex.lab.toggleForceDirection"
            />
          </DraggablePanel>
        </template>
      </div>
    </div>

    <LeverOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :sim="ex.lab.sim"
      :challenge-solved="ex.challengeSolved.value"
      @maximize="ex.layout.maximizePanel"
      @drop="ex.handleDrop"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
      @start-challenge="ex.startChallenge"
      @check-challenge="ex.checkChallenge"
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
      @start-challenge="ex.startChallenge"
    />
  </div>
</template>

<style scoped>
.lever-lab { background:#161B22; color:#D1D7E0; padding:.6rem .8rem; height:100vh; display:flex; flex-direction:column; gap:.5rem; overflow:hidden; }
.lab-grid { display:flex; flex-direction:row; flex:1; min-height:0; overflow:hidden; }
.lab-col { display:flex; flex-direction:column; gap:.5rem; overflow-y:auto; min-height:0; }
.data-col { background:rgba(255,255,255,0.02); }
.vis-col { align-items:stretch; justify-content:flex-start; background:transparent; flex:1; min-width:0; }
.ctrl-col { background:rgba(255,255,255,0.02); }
.resizer { width:6px; cursor:col-resize; background:#2D3645; transition:background .2s; flex-shrink:0; }
.resizer:hover, .resizer:active { background:#5B8DB8; }
.chart-row { display:flex; gap:.5rem; width:100%; margin-top:.3rem; flex:0 0 180px; min-height:0; align-items:stretch; }
.chart-row:empty { display:none; }
.chart-panel { flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden; }
.hint-bar { background:#252D3A; border:1px solid #2D3645; border-radius:6px; padding:.35rem .7rem; font-size:.75rem; color:#8B95A5; text-align:center; flex-shrink:0; }
.hint-bar.active { border-color:#5B8DB8; color:#5B8DB8; background:rgba(91,141,184,.08); }
.hint-bar.success { border-color:#22c55e; color:#22c55e; background:rgba(34,197,94,.08); }
</style>
