<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useProjectileExperiment } from '../../../../composables/projectile/useProjectileExperiment'
import { useProjectileReport } from '../../../../composables/projectile/useProjectileReport'
import { useI18n } from '../../../../composables/useI18n'
import ProjectileMenuBar from '../../../../components/experiment/projectile/ProjectileMenuBar.vue'
import ProjectileCanvas from '../../../../components/experiment/projectile/ProjectileCanvas.vue'
import ProjectilePanelBody from '../../../../components/experiment/projectile/ProjectilePanelBody.vue'
import ProjectileOverlayPanels from '../../../../components/experiment/projectile/ProjectileOverlayPanels.vue'
import ProjectileControlBar from '../../../../components/experiment/projectile/ProjectileControlBar.vue'
import ProjectileHelpModal from '../../../../components/experiment/projectile/ProjectileHelpModal.vue'
import ProjectileGuidePanel from '../../../../components/experiment/projectile/ProjectileGuidePanel.vue'
import ProjectileReport from '../../../../components/experiment/projectile/ProjectileReport.vue'
import ProjectileStepTracker from '../../../../components/experiment/projectile/ProjectileStepTracker.vue'
import ProjectileStatusBar from '../../../../components/experiment/projectile/ProjectileStatusBar.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'

const ex = useProjectileExperiment()
const rep = useProjectileReport()
const { t } = useI18n()
const helpOpen = ref(false)
const showGuide = ref(true)
const reportOpen = ref(false)
const canvasRef = ref<InstanceType<typeof ProjectileCanvas> | null>(null)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.lab.togglePause() }
  else if (e.key === 'r' || e.key === 'R') { if (confirm(t('experiments.resetConfirm'))) ex.resetSim() }
  else if (e.key === 's' || e.key === 'S') { ex.trials.recordTrial() }
  else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (e.shiftKey) ex.trials.redo(); else ex.trials.undo() }
  else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ex.trials.redo() }
  else if (e.key === '?') { helpOpen.value = !helpOpen.value }
}
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="projectile-lab">
    <ProjectileMenuBar
      :title="t('experiments.projectileTitle')" icon="🚀" experiment-route="/physics/mechanics/projectile" experiment-name="Projectile"
      @toggle-panel="ex.layout.togglePanel" @show-all-panels="ex.layout.showAllPanels" @export-csv="ex.trials.exportCsv"
      @toggle-pause="ex.lab.togglePause" @reset="ex.resetSim" @record-trial="ex.trials.recordTrial" @run-lab="ex.runProjectileLab"
      @calc-flight-time="ex.trials.calcFlightTime" @calc-max-height="ex.trials.calcMaxHeight" @calc-range="ex.trials.calcRange" @calc-fit-range="ex.trials.calcFitRange"
      @toggle-help="helpOpen = !helpOpen" @print-report="reportOpen = true"
      @analyze-results="ex.exportToAnalysis"
    />

    <ProjectileHelpModal :open="helpOpen" @close="helpOpen = false" />
    <ProjectileStepTracker :step-index="ex.stepIndex.value" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.colWidths.data + 'px' }">
        <template v-for="id in ex.getColumnPanels('data')" :key="id">
          <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <ProjectilePanelBody :id="id" :trials="ex.trials.trials.value" :calc-result="ex.trials.calcResult.value" :params="ex.params" :sim="ex.lab.sim"
              :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :tutor-type="ex.tutorType.value" :tutor-message="ex.tutorMessage.value" :fit-result="ex.trials.fitResult.value"
              @update:trials="ex.trials.trials.value = $event" @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
              @calc-flight-time="ex.trials.calcFlightTime" @calc-max-height="ex.trials.calcMaxHeight" @calc-range="ex.trials.calcRange" @calc-fit-range="ex.trials.calcFitRange" @show-calc="html => ex.trials.calcResult.value = html"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <ProjectileCanvas ref="canvasRef" :params="ex.params" :sim-state="ex.lab.sim" @snapshot="rep.onSnapshot" @update:target-x="v => ex.params.targetX = v" @update:target-y="v => ex.params.targetY = v" />
        <div v-if="ex.hasVisibleVisPanels" class="chart-row">
          <template v-for="id in ex.getColumnPanels('vis')" :key="id">
            <DraggablePanel v-if="ex.layout.isPanelVisible(id)" class="chart-panel lab-card" :id="id" :title="ex.layout.panelTitle(id)"
              @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
              <ProjectilePanelBody :id="id" :trials="ex.trials.trials.value" :calc-result="ex.trials.calcResult.value" :params="ex.params" :sim="ex.lab.sim"
                :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :tutor-type="ex.tutorType.value" :tutor-message="ex.tutorMessage.value" :fit-result="ex.trials.fitResult.value"
                @update:trials="ex.trials.trials.value = $event" @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
                @calc-flight-time="ex.trials.calcFlightTime" @calc-max-height="ex.trials.calcMaxHeight" @calc-range="ex.trials.calcRange" @calc-fit-range="ex.trials.calcFitRange" @show-calc="html => ex.trials.calcResult.value = html"
              />
            </DraggablePanel>
          </template>
        </div>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('vis', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.colWidths.ctrl + 'px' }">
        <template v-for="id in ex.getColumnPanels('ctrl')" :key="id">
          <DraggablePanel v-if="id !== 'params' && ex.layout.isPanelVisible(id)" class="lab-card" :id="id" :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel" @hide="ex.layout.togglePanel" @drop="ex.handleDrop">
            <ProjectilePanelBody :id="id" :trials="ex.trials.trials.value" :calc-result="ex.trials.calcResult.value" :params="ex.params" :sim="ex.lab.sim"
              :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :tutor-type="ex.tutorType.value" :tutor-message="ex.tutorMessage.value" :fit-result="ex.trials.fitResult.value"
              @update:trials="ex.trials.trials.value = $event" @update:params="Object.assign(ex.params, $event)" @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials"
              @calc-flight-time="ex.trials.calcFlightTime" @calc-max-height="ex.trials.calcMaxHeight" @calc-range="ex.trials.calcRange" @calc-fit-range="ex.trials.calcFitRange" @show-calc="html => ex.trials.calcResult.value = html"
            />
          </DraggablePanel>
          <div v-else-if="id === 'params'" class="params-embedded">
            <ProjectilePanelBody id="params" :trials="ex.trials.trials.value" :calc-result="ex.trials.calcResult.value" :params="ex.params" :sim="ex.lab.sim"
              :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value" :tutor-type="ex.tutorType.value" :tutor-message="ex.tutorMessage.value" :fit-result="ex.trials.fitResult.value"
              @update:params="Object.assign(ex.params, $event)"
            />
          </div>
        </template>
        <ProjectileGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <ProjectileOverlayPanels :maximized="ex.layout.maximized" :panel-title="(id: string) => ex.layout.panelTitle(String(id))" :trials="ex.trials.trials.value" :calc-result="ex.trials.calcResult.value" :fit-result="ex.trials.fitResult.value"
      :params="ex.params" :sim="ex.lab.sim" :measured="ex.getMeasured()" :trial-stats="ex.trials.trialStats.value"
      @maximize="ex.layout.maximizePanel" @drop="ex.handleDrop" @update:trials="ex.trials.trials.value = $event" @update:params="Object.assign(ex.params, $event)"
      @remove="ex.trials.removeTrial" @clear="ex.trials.clearTrials" @calc-flight-time="ex.trials.calcFlightTime" @calc-max-height="ex.trials.calcMaxHeight" @calc-range="ex.trials.calcRange" @calc-fit-range="ex.trials.calcFitRange" @show-calc="html => ex.trials.calcResult.value = html"
    />

    <ProjectileControlBar
      :launch-label="ex.lab.sim.running && !ex.lab.sim.paused ? '⏸️ ' + t('experiments.pauseBtn') : '▶️ ' + t('experiments.startBtn')"
      :speed="ex.lab.speed.value"
      :can-undo="ex.trials.canUndo()"
      :can-redo="ex.trials.canRedo()"
      :target-mode="ex.params.targetMode"
      @toggle-pause="ex.lab.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @clear-trials="ex.trials.clearTrials"
      @export-csv="ex.trials.exportCsv"
      @undo="ex.trials.undo"
      @redo="ex.trials.redo"
      @update:speed="v => ex.lab.speed.value = v"
      @toggle-target-mode="ex.params.targetMode = !ex.params.targetMode; ex.params.targetVisible = ex.params.targetMode"
    />

    <div class="hint-bar" v-if="!ex.lab.sim.running"><span>💡 {{ t('experiments.hintAdjust') }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.sim.running && !ex.lab.sim.landed && !ex.lab.sim.targetHit"><span>🚀 {{ t('experiments.hintFlying') }}</span></div>
    <div class="hint-bar target-hit" v-else-if="ex.lab.sim.targetHit"><span>🎯 {{ t('experiments.targetHit') }}: {{ ex.lab.sim.distanceToTarget?.toFixed(2) ?? '--' }} m</span></div>
    <div class="hint-bar success" v-else><span>✅ {{ t('experiments.hintLanded') }}</span></div>

    <ProjectileStatusBar :running="ex.lab.sim.running" :paused="ex.lab.sim.paused" />
    <ProjectileReport v-if="reportOpen" style="position:fixed;inset:5%;z-index:200;overflow:auto;background:#0d1117;border-radius:12px;border:1px solid #2D3645;box-shadow:0 20px 60px rgba(0,0,0,.5)"
      :trials="ex.trials.trials.value" :params="ex.params" :trial-stats="ex.trials.trialStats.value" :fit-result="ex.trials.fitResult.value" :g-theoretical="ex.params.g"
      @close="reportOpen = false" @open-full-report="rep.openFullReport(ex)"
    />
  </div>
</template>

<style scoped>
.projectile-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; gap: .3rem; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; padding: .3rem; border-radius: 10px; }
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
.hint-bar.target-hit { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,.08); }
</style>
