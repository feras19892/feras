<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLeverExperiment } from '../../../../composables/lever/useLeverExperiment'
import { useI18n } from '../../../../composables/useI18n'
import LeverMenuBar from '../../../../components/experiment/lever/LeverMenuBar.vue'
import LeverCanvas from '../../../../components/experiment/lever/LeverCanvas.vue'
import LeverControlBar from '../../../../components/experiment/lever/LeverControlBar.vue'
import LeverStatusBar from '../../../../components/experiment/lever/LeverStatusBar.vue'
import LeverPanelBody from '../../../../components/experiment/lever/LeverPanelBody.vue'
import LeverOverlayPanels from '../../../../components/experiment/lever/LeverOverlayPanels.vue'
import LeverHelpModal from '../../../../components/experiment/lever/LeverHelpModal.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'

const ex = useLeverExperiment()
const { t } = useI18n()
const helpOpen = ref(false)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.key === 'r' || e.key === 'R') { if (confirm(t('experiments.resetConfirm'))) ex.resetSim() }
  else if (e.key === 's' || e.key === 'S') { ex.trials.recordTrial() }
  else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (e.shiftKey) ex.trials.redo(); else ex.trials.undo() }
  else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ex.trials.redo() }
  else if (e.key === '?') { helpOpen.value = !helpOpen.value }
}

function addForce() { ex.lab.addForce(10, Math.floor(Math.random() * 360)) }
function addMass() { ex.lab.addMass(1 + Math.random() * 2, (Math.random() - 0.5) * 2) }

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="lever-lab">
    <LeverMenuBar
      :title="t('experiments.leverTitle')"
      icon="⚖️"
      :mode="ex.lab.mode.value"
      @toggle-panel="ex.layout.togglePanel"
      @show-all-panels="ex.layout.showAllPanels"
      @export-csv="ex.trials.exportCsv"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
      @toggle-mode="ex.toggleMode"
    />
    <LeverHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.colWidths.data + 'px' }">
        <template v-for="id in ex.getColumnPanels('data')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <LeverPanelBody :id="id" :trials="ex.trials.trials.value" :forces="ex.lab.vector.state.forces" :resultant="ex.lab.resultant.value"
              :equilibriumForce="ex.lab.equilibriumForce.value" :isBalanced="ex.lab.isBalanced.value" :mode="ex.lab.mode.value"
              :masses="ex.lab.beam.state.masses" :tiltDeg="ex.lab.tiltDeg.value" :netTorque="ex.lab.netTorque.value"
              @removeTrial="ex.trials.removeTrial" @clearTrials="ex.trials.clearTrials" @removeForce="ex.lab.removeForce" @updateForce="ex.lab.updateForce"
              @removeMass="ex.lab.removeMass" @updateMass="ex.lab.updateMass" />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <LeverCanvas
          :mode="ex.lab.mode.value"
          :forces="ex.lab.vector.state.forces" :resultant="ex.lab.resultant.value" :equilibriumForce="ex.lab.equilibriumForce.value" :isBalanced="ex.lab.isBalanced.value"
          :masses="ex.lab.beam.state.masses" :tiltDeg="ex.lab.tiltDeg.value" :netTorque="ex.lab.netTorque.value" :beamLength="ex.lab.beam.state.beamLength"
          @addForce="addForce" @updateForce="ex.lab.updateForce" @removeForce="ex.lab.removeForce"
          @addMass="addMass" @updateMass="ex.lab.updateMass" @removeMass="ex.lab.removeMass"
        />
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('vis', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.colWidths.ctrl + 'px' }">
        <template v-for="id in ex.getColumnPanels('ctrl')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <LeverPanelBody :id="id" :trials="ex.trials.trials.value" :forces="ex.lab.vector.state.forces" :resultant="ex.lab.resultant.value"
              :equilibriumForce="ex.lab.equilibriumForce.value" :isBalanced="ex.lab.isBalanced.value" :mode="ex.lab.mode.value"
              :masses="ex.lab.beam.state.masses" :tiltDeg="ex.lab.tiltDeg.value" :netTorque="ex.lab.netTorque.value"
              @removeTrial="ex.trials.removeTrial" @clearTrials="ex.trials.clearTrials" @removeForce="ex.lab.removeForce" @updateForce="ex.lab.updateForce"
              @removeMass="ex.lab.removeMass" @updateMass="ex.lab.updateMass" />
          </DraggablePanel>
        </template>
      </div>
    </div>

    <LeverOverlayPanels
      :maximized="ex.layout.maximized" :panelTitle="ex.layout.panelTitle" :trials="ex.trials.trials.value" :forces="ex.lab.vector.state.forces"
      :resultant="ex.lab.resultant.value" :equilibriumForce="ex.lab.equilibriumForce.value" :isBalanced="ex.lab.isBalanced.value"
      :mode="ex.lab.mode.value" :masses="ex.lab.beam.state.masses" :tiltDeg="ex.lab.tiltDeg.value" :netTorque="ex.lab.netTorque.value"
      @maximize="ex.layout.maximizePanel" @drop="ex.handleDrop" @removeTrial="ex.trials.removeTrial" @clearTrials="ex.trials.clearTrials"
      @removeForce="ex.lab.removeForce" @updateForce="ex.lab.updateForce" @removeMass="ex.lab.removeMass" @updateMass="ex.lab.updateMass"
    />

    <div class="hint-bar" v-if="ex.lab.mode.value === 'vector' && ex.lab.vector.state.forces.length === 0"><span>💡 {{ t('experiments.addForceHint') }}</span></div>
    <div class="hint-bar" v-else-if="ex.lab.mode.value === 'beam' && ex.lab.beam.state.masses.length === 0"><span>💡 {{ t('experiments.addMassHint') }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.mode.value === 'vector' && !ex.lab.isBalanced.value"><span>⚖️ {{ t('experiments.notBalancedHint', { mag: ex.lab.resultant.value.magnitude.toFixed(2) }) }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.mode.value === 'beam' && Math.abs(ex.lab.netTorque.value) >= 0.01"><span>⚖️ {{ t('experiments.notBalancedTorqueHint', { torque: Math.abs(ex.lab.netTorque.value).toFixed(2) }) }}</span></div>
    <div class="hint-bar success" v-else><span>✅ {{ t('experiments.balancedHint') }}</span></div>

    <LeverStatusBar
      :forceCount="ex.lab.vector.state.forces.length"
      :sumFx="ex.lab.resultant.value.fx" :sumFy="ex.lab.resultant.value.fy"
      :resultantMag="ex.lab.resultant.value.magnitude" :isBalanced="ex.lab.isBalanced.value"
      :mode="ex.lab.mode.value" :massCount="ex.lab.beam.state.masses.length"
      :netTorque="ex.lab.netTorque.value" :tiltDeg="ex.lab.tiltDeg.value"
    />
    <LeverControlBar :can-undo="ex.trials.canUndo()" :can-redo="ex.trials.canRedo()"
      @reset="ex.resetSim" @record-trial="ex.trials.recordTrial" @clear-trials="ex.trials.clearTrials" @export-csv="ex.trials.exportCsv"
      @undo="ex.trials.undo" @redo="ex.trials.redo" />
  </div>
</template>

<style scoped>
.lever-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
