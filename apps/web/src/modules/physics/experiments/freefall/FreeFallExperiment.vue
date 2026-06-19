<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useFreeFallExperiment } from '../../../../composables/freefall/useFreeFallExperiment'
import { useFreeFallReport } from '../../../../composables/freefall/useFreeFallReport'
import FreeFallMenuBar from '../../../../components/experiment/freefall/FreeFallMenuBar.vue'
import FreeFallCanvas from '../../../../components/experiment/freefall/FreeFallCanvas.vue'
import FreeFallControlBar from '../../../../components/experiment/freefall/FreeFallControlBar.vue'
import FreeFallStatusBar from '../../../../components/experiment/freefall/FreeFallStatusBar.vue'
import FreeFallHelpModal from '../../../../components/experiment/freefall/FreeFallHelpModal.vue'
import FreeFallReport from '../../../../components/experiment/freefall/FreeFallReport.vue'
import FreeFallPanelBody from '../../../../components/experiment/freefall/FreeFallPanelBody.vue'
import FreeFallOverlayPanels from '../../../../components/experiment/freefall/FreeFallOverlayPanels.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'

const ex = useFreeFallExperiment()
const rep = useFreeFallReport()
const helpOpen = ref(false)
const reportOpen = ref(false)
const canvasRef = ref<InstanceType<typeof FreeFallCanvas> | null>(null)

function openFullReport() {
  rep.captureSnapshot(canvasRef.value)
  rep.openFullReport(ex)
}
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
  <div class="freefall-lab">
    <FreeFallMenuBar
      title="السقوط الحر"
      icon="🍎"
      experiment-route="/physics/mechanics/freefall"
      experiment-name="Free Fall"
      @toggle-pause="ex.lab.togglePause" @reset="ex.resetSim" @record-trial="ex.trials.recordTrial"
      @run-lab="ex.runFreeFallLab" @calc-g="ex.trials.calcG" @calc-t="ex.trials.calcT"
      @calc-v="ex.trials.calcV" @calc-fit-g="ex.trials.calcFitG"
      @toggle-help="helpOpen = !helpOpen" @print-report="reportOpen = true"
      @export-csv="ex.trials.exportCsv" @toggle-panel="ex.layout.togglePanel"
      @show-all-panels="ex.layout.showAllPanels"
    />

    <FreeFallHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.colWidths.data + 'px' }">
        <template v-for="id in ex.getColumnPanels('data')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id as any)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <FreeFallPanelBody :id="id" :trials="ex.trials.trials.value" :calc-result="ex.trials.calcResult.value"
              :params="ex.params" :sim-state="ex.lab.sim" :trial-stats="ex.trials.trialStats.value" :g-theoretical="ex.params.g"
              :enable-noise="ex.enableNoise.value"
              @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
              @calc-g="ex.trials.calcG" @calc-t="ex.trials.calcT" @calc-v="ex.trials.calcV" @calc-fit-g="ex.trials.calcFitG"
              @print-report="reportOpen = true" @open-full-report="rep.openFullReport(ex)"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <FreeFallCanvas ref="canvasRef" :params="ex.params" :sim-state="ex.lab.sim" @snapshot="rep.onSnapshot($event)" />
        <div v-if="ex.hasVisibleVisPanels" class="chart-row">
          <template v-for="id in ex.getColumnPanels('vis')" :key="id">
            <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="chart-panel lab-card" :id="id" :title="ex.layout.panelTitle(id as any)"
              @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
              <FreeFallPanelBody :id="id" :trials="ex.trials.trials.value" :calc-result="ex.trials.calcResult.value"
                :params="ex.params" :sim-state="ex.lab.sim" :trial-stats="ex.trials.trialStats.value" :g-theoretical="ex.params.g"
                :enable-noise="ex.enableNoise.value"
                @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
                @calc-g="ex.trials.calcG" @calc-t="ex.trials.calcT" @calc-v="ex.trials.calcV" @calc-fit-g="ex.trials.calcFitG"
                @print-report="reportOpen = true" @open-full-report="rep.openFullReport(ex)"
              />
            </DraggablePanel>
          </template>
        </div>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('vis', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.colWidths.ctrl + 'px' }">
        <template v-for="id in ex.getColumnPanels('ctrl')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id as any)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <FreeFallPanelBody :id="id" :trials="ex.trials.trials.value" :calc-result="ex.trials.calcResult.value"
              :params="ex.params" :sim-state="ex.lab.sim" :trial-stats="ex.trials.trialStats.value" :g-theoretical="ex.params.g"
              :enable-noise="ex.enableNoise.value"
              @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
              @calc-g="ex.trials.calcG" @calc-t="ex.trials.calcT" @calc-v="ex.trials.calcV" @calc-fit-g="ex.trials.calcFitG"
              @print-report="reportOpen = true" @open-full-report="rep.openFullReport(ex)"
            />
          </DraggablePanel>
        </template>
      </div>
    </div>

    <FreeFallOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :calc-result="ex.trials.calcResult.value"
      :params="ex.params"
      :sim="ex.lab.sim"
      :measured="ex.getMeasured()"
      :trial-stats="ex.trials.trialStats.value"
      :tutor-type="ex.tutorType.value"
      :tutor-message="ex.tutorMessage.value"
      :enable-noise="ex.enableNoise.value"
      @maximize="ex.layout.maximizePanel"
      @update:params="Object.assign(ex.params, $event)"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
      @calc-g="ex.trials.calcG"
      @calc-t="ex.trials.calcT"
      @calc-v="ex.trials.calcV"
      @calc-fit-g="ex.trials.calcFitG"
      @print-report="reportOpen = true"
      @open-full-report="openFullReport"
    />

    <div class="hint-bar" v-if="!ex.lab.sim.running"><span>💡 اضبط الارتفاع واضغط "إفلات" لبدء السقوط</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.sim.running && !ex.lab.sim.paused && !ex.lab.sim.landed"><span>⏳ الكرة في الجو...</span></div>
    <div class="hint-bar success" v-else><span>✅ الارتطام! اضغط "تسجيل"</span></div>

    <FreeFallStatusBar :running="ex.lab.sim.running" :paused="ex.lab.sim.paused" />

    <FreeFallControlBar
      :launch-label="ex.lab.sim.running && !ex.lab.sim.paused ? '⏸️ توقف' : '▶️ إفلات'"
      :speed="ex.lab.speed.value"
      :can-undo="ex.trials.canUndo()"
      :can-redo="ex.trials.canRedo()"
      :enable-noise="ex.enableNoise.value"
      @toggle-pause="ex.lab.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @clear-trials="ex.trials.clearTrials"
      @export-csv="ex.trials.exportCsv"
      @undo="ex.trials.undo"
      @redo="ex.trials.redo"
      @update:speed="v => ex.lab.speed.value = v"
      @toggle-noise="ex.enableNoise.value = !ex.enableNoise.value"
    />

    <FreeFallReport v-if="reportOpen" style="position:fixed;inset:5%;z-index:200;overflow:auto;background:#0d1117;border-radius:12px;border:1px solid #2D3645;box-shadow:0 20px 60px rgba(0,0,0,.5)"
      :trials="ex.trials.trials.value" :params="ex.params" :trial-stats="ex.trials.trialStats.value" :g-theoretical="ex.params.g"
      @close="reportOpen = false" @open-full-report="openFullReport"
    />
  </div>
</template>

<style scoped>
.freefall-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.chart-row { display: flex; gap: .5rem; width: 100%; margin-top: .3rem; flex: 0 0 180px; min-height: 0; align-items: stretch; }
.chart-row:empty { display: none; }
.chart-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
