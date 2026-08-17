<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNetForceExperiment } from '../../../../composables/netforce/useNetForceExperiment'
import { useI18n } from '../../../../composables/useI18n'
import { useResetConfirm } from '../../../../composables/useResetConfirm'
import NetForceMenuBar from '../../../../components/experiment/netforce/NetForceMenuBar.vue'
import NetForceCanvas from '../../../../components/experiment/netforce/NetForceCanvas.vue'
import NetForcePanelBody from '../../../../components/experiment/netforce/NetForcePanelBody.vue'
import NetForceOverlayPanels from '../../../../components/experiment/netforce/NetForceOverlayPanels.vue'
import NetForceControlBar from '../../../../components/experiment/netforce/NetForceControlBar.vue'
import NetForceHelpModal from '../../../../components/experiment/netforce/NetForceHelpModal.vue'
import NetForceGuidePanel from '../../../../components/experiment/netforce/NetForceGuidePanel.vue'
import NetForceStatusBar from '../../../../components/experiment/netforce/NetForceStatusBar.vue'
import NetForceReport from '../../../../components/experiment/netforce/NetForceReport.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'
import ResetConfirmModal from '../../../../components/shared/ResetConfirmModal.vue'

const initError = ref<string | null>(null)
let t: (key: string, fallback?: string) => string
let confirmReset: () => Promise<boolean>
let ex: ReturnType<typeof useNetForceExperiment>

try {
  console.log('[NetForce] Initializing composables...')
  const i18n = useI18n()
  t = i18n.t
  console.log('[NetForce] useI18n OK')
  const resetConfirm = useResetConfirm()
  confirmReset = resetConfirm.confirmReset
  console.log('[NetForce] useResetConfirm OK')
  ex = useNetForceExperiment()
  console.log('[NetForce] useNetForceExperiment OK')
} catch (err) {
  console.error('[NetForce] Init error:', err)
  initError.value = err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err)
  t = (key: string, fallback?: string) => fallback ?? key
  confirmReset = async () => false
  ex = null as any
}

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
  <div v-if="initError" class="init-error">
    <h2>⚠️ خطأ في تهيئة التجربة</h2>
    <pre>{{ initError }}</pre>
  </div>
  <div v-else class="netforce-lab">
    <NetForceMenuBar
      :title="t('experiments.netForceTitle')" icon="🧲"
      @show-all-panels="ex.layout.showAllPanels"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <NetForceHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.colWidths.data + 'px' }">
        <template v-for="id in ex.getColumnPanels('data')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <NetForcePanelBody :id="id" :trials="ex.trials.trials.value" :params="ex.params" :sim="ex.lab.sim"
              :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :calc-result="ex.trials.calcResult.value"
              @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial"
              @calc-net-force="ex.trials.calcNetForce" @calc-centripetal="ex.trials.calcCentripetalForce"
              @calc-fit="ex.trials.calcFitCentripetal" @auto-balance="ex.autoBalance"
              @add-force="ex.addCustomForce" @remove-force="ex.removeCustomForce" @update-force="ex.updateCustomForce" />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <NetForceCanvas :params="ex.params" :sim-state="ex.lab.sim" :measured="ex.getMeasured()" />
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('vis', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.colWidths.ctrl + 'px' }">
        <div class="params-embedded">
          <NetForcePanelBody id="params" :trials="ex.trials.trials.value" :params="ex.params" :sim="ex.lab.sim"
            :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :calc-result="ex.trials.calcResult.value"
            @update:params="Object.assign(ex.params, $event)"
            @auto-balance="ex.autoBalance"
            @add-force="ex.addCustomForce" @remove-force="ex.removeCustomForce" @update-force="ex.updateCustomForce" />
        </div>
        <template v-for="id in ex.getColumnPanels('ctrl')" :key="id">
          <DraggablePanel v-if="id !== 'params' && ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <NetForcePanelBody :id="id" :trials="ex.trials.trials.value" :params="ex.params" :sim="ex.lab.sim"
              :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :calc-result="ex.trials.calcResult.value"
              @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial"
              @calc-net-force="ex.trials.calcNetForce" @calc-centripetal="ex.trials.calcCentripetalForce"
              @calc-fit="ex.trials.calcFitCentripetal" @auto-balance="ex.autoBalance"
              @add-force="ex.addCustomForce" @remove-force="ex.removeCustomForce" @update-force="ex.updateCustomForce" />
          </DraggablePanel>
        </template>
        <NetForceGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <NetForceOverlayPanels :maximized="ex.layout.maximized" :panel-title="(id: string) => ex.layout.panelTitle(String(id))"
      :trials="ex.trials.trials.value" :params="ex.params" :sim="ex.lab.sim" :measured="ex.getMeasured()"
      :trial-stats="ex.trials.trialStats.value" :calc-result="ex.trials.calcResult.value"
      @maximize="ex.layout.maximizePanel" @update:params="Object.assign(ex.params, $event)"
      @remove="ex.trials.removeTrial" @calc-net-force="ex.trials.calcNetForce"
      @calc-centripetal="ex.trials.calcCentripetalForce" @calc-fit="ex.trials.calcFitCentripetal"
      @auto-balance="ex.autoBalance"
      @add-force="ex.addCustomForce" @remove-force="ex.removeCustomForce" @update-force="ex.updateCustomForce" />

    <NetForceControlBar
      :running="ex.lab.sim.running" :paused="ex.lab.sim.paused"
      :speed="ex.lab.speed.value" :can-undo="ex.trials.canUndo()" :can-redo="ex.trials.canRedo()"
      @toggle-pause="ex.lab.togglePause" @reset="ex.resetSim" @record-trial="ex.trials.recordTrial"
      @clear-trials="ex.trials.clearTrials" @export-csv="ex.trials.exportCsv"
      @undo="ex.trials.undo" @redo="ex.trials.redo"
      @update:speed="v => ex.lab.speed.value = v" />

    <div class="hint-bar" v-if="!ex.lab.sim.running"><span>💡 {{ ex.tutorMessage.value }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.sim.running && !ex.lab.sim.paused && ex.lab.sim.motionState === 'sliding'"><span>⚠️ {{ ex.tutorMessage.value }}</span></div>
    <div class="hint-bar success" v-else-if="ex.lab.sim.running && ex.lab.sim.motionState === 'equilibrium'"><span>✅ {{ ex.tutorMessage.value }}</span></div>
    <div class="hint-bar" v-else><span>⏸️ {{ ex.tutorMessage.value }}</span></div>

    <NetForceStatusBar :running="ex.lab.sim.running" :paused="ex.lab.sim.paused" :settled="ex.lab.sim.settled" />

    <NetForceReport v-if="reportOpen" style="position:fixed;inset:5%;z-index:200;overflow:auto;background:#0d1117;border-radius:12px;border:1px solid #2D3645;box-shadow:0 20px 60px rgba(0,0,0,.5)"
      :trials="ex.trials.trials.value" :params="ex.params" :trial-stats="ex.trials.trialStats.value"
      @close="reportOpen = false"
    />
  </div>
  <ResetConfirmModal />
</template>

<style scoped>
.init-error { padding: 2rem; color: #f87171; background: #0d1117; min-height: 100vh; }
.init-error h2 { margin: 0 0 1rem; }
.init-error pre { white-space: pre-wrap; color: #fca5a5; font-size: .85rem; background: rgba(0,0,0,.3); padding: 1rem; border-radius: .5rem; }
.netforce-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; gap: .3rem; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; padding: .3rem; border-radius: 10px; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.params-embedded { padding: .6rem; }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.lab-col > .lab-card { flex: 1 1 auto; min-height: 0; }
.lab-col > .lab-card + .lab-card { flex: 0 0 auto; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
