<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSpringExperiment } from '../../../../composables/spring/useSpringExperiment'
import { useI18n } from '../../../../composables/useI18n'
import SpringMenuBar from '../../../../components/experiment/spring/SpringMenuBar.vue'
import SpringCanvas from '../../../../components/experiment/spring/SpringCanvas.vue'
import SpringStatusBar from '../../../../components/experiment/spring/SpringStatusBar.vue'
import SpringControlBar from '../../../../components/experiment/spring/SpringControlBar.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'
import SpringPanelBody from '../../../../components/experiment/spring/SpringPanelBody.vue'
import SpringParamPanel from '../../../../components/experiment/spring/SpringParamPanel.vue'
import SpringHelpModal from '../../../../components/experiment/spring/SpringHelpModal.vue'
const ex = useSpringExperiment()
const { t } = useI18n()
const helpOpen = ref(false)
const canvasRef = ref<InstanceType<typeof SpringCanvas> | null>(null)
function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return

  if (e.code === 'Space') {
    e.preventDefault()
    ex.lab.togglePause()
  } else if (e.key === 'r' || e.key === 'R') {
    if (confirm(t('experiments.resetConfirm'))) ex.resetSim()
  } else if (e.key === 's' || e.key === 'S') {
    ex.trials.recordTrial()
  } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    if (e.shiftKey) ex.trials.redo()
    else ex.trials.undo()
  } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    ex.trials.redo()
  } else if (e.key === '?') {
    helpOpen.value = !helpOpen.value
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="spring-lab">
    <SpringMenuBar
      :title="t('experiments.springTitle')"
      icon="🍃"
      experiment-route="/physics/mechanics/spring"
      experiment-name="Basic Spring"
      @toggle-panel="ex.layout.togglePanel"
      @show-all-panels="ex.layout.showAllPanels"
      @export-csv="ex.trials.exportCsv"
      @toggle-pause="ex.lab.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @run-lab="ex.runSpringLab"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <SpringHelpModal :open="helpOpen" @close="helpOpen = false" />

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
            <SpringPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :sim="ex.lab.sim"
              :measured="ex.getMeasured()"
              :effective-mass="ex.getEffectiveMass()"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <SpringCanvas ref="canvasRef" :params="ex.params" :sim-state="ex.lab.sim" :oscillation-count="Math.floor(ex.lab.sim.zeroCrossings.length / 2)" @toggle-mass="ex.toggleMass" @pull-down="ex.pullDown" @push-up="ex.pushUp" />
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('vis', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.colWidths.ctrl + 'px' }">
        <template v-for="id in ex.getColumnPanels('ctrl')" :key="id">
          <DraggablePanel
            v-if="id !== 'params' && ex.layout.isPanelVisible(id)"
            class="lab-card"
            :id="id"
            :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel"
            @hide="ex.layout.togglePanel"
            @drop="ex.handleDrop"
          >
            <SpringPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :sim="ex.lab.sim"
              :measured="ex.getMeasured()"
              :effective-mass="ex.getEffectiveMass()"
            />
          </DraggablePanel>
          <div v-else-if="id === 'params'" class="params-embedded">
            <SpringParamPanel
              :model-value="ex.params"
              @update:model-value="Object.assign(ex.params, $event)"
            />
          </div>
        </template>
      </div>
    </div>

    <div class="hint-bar" v-if="!ex.lab.running.value">
      <span>💡 {{ t('experiments.hintStart') }}</span>
    </div>
    <div class="hint-bar active" v-else-if="ex.lab.sim.measurementPeriod === null">
      <span>⏳ {{ t('experiments.hintWaitStable') }}</span>
    </div>
    <div class="hint-bar success" v-else>
      <span>✅ {{ t('experiments.hintStable') }}</span>
    </div>

    <SpringStatusBar :running="ex.lab.running.value" :paused="ex.lab.paused.value" />
    <SpringControlBar
      :launch-label="ex.lab.running.value && !ex.lab.paused.value ? '⏸️ ' + t('experiments.pauseBtn') : '▶️ ' + t('experiments.startBtn')"
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
      @pull-down="ex.pullDown"
      @push-up="ex.pushUp"
    />

  </div></template>

<style scoped>
.spring-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
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
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }</style>
