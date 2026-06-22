<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePrismExperiment } from '../../../../composables/prism/usePrismExperiment'
import { useI18n } from '../../../../composables/useI18n'
import PrismMenuBar from '../../../../components/experiment/prism/PrismMenuBar.vue'
import PrismCanvas from '../../../../components/experiment/prism/PrismCanvas.vue'
import PrismPanelBody from '../../../../components/experiment/prism/PrismPanelBody.vue'
import PrismStatusBar from '../../../../components/experiment/prism/PrismStatusBar.vue'
import PrismControlBar from '../../../../components/experiment/prism/PrismControlBar.vue'
import PrismHelpModal from '../../../../components/experiment/prism/PrismHelpModal.vue'
import PrismOverlayPanels from '../../../../components/experiment/prism/PrismOverlayPanels.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'

const ex = usePrismExperiment()
const { t } = useI18n()
const helpOpen = ref(false)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') {
    e.preventDefault()
    ex.lab.togglePause()
  } else if (e.key === 'r' || e.key === 'R') {
    if (confirm(t('prism.resetConfirm'))) ex.resetSim()
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

onMounted(() => {
  ex.layout.applyPersistedLayout()
  ex.trials.autoLoad()
  window.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="prism-lab">
    <PrismMenuBar
      :title="t('prism.title')"
      icon="&#x1F308;"
      experiment-route="/physics/waves/prism"
      experiment-name="Prism Dispersion"
      @toggle-panel="ex.layout.togglePanel"
      @show-all-panels="ex.layout.showAllPanels"
      @export-csv="ex.downloadCsv"
      @toggle-pause="ex.lab.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <PrismHelpModal :open="helpOpen" @close="helpOpen = false" />

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
            <PrismPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :angle-refraction1="ex.lab.angleRefraction1.value"
              :angle-incidence2="ex.lab.angleIncidence2.value"
              :angle-emergence="ex.lab.angleEmergence.value"
              :deviation="ex.lab.deviation.value"
              :total-internal-reflection="ex.lab.totalInternalReflection.value"
              :critical-angle="ex.lab.criticalAngle.value"
              :slope="ex.regression.value.m"
              :intercept="ex.regression.value.b"
              :r-squared="ex.regression.value.r2"
              :n-value="ex.lab.nValue.value"
              :avg-n="ex.avgN.value"
              :speed-in-medium="ex.lab.speedInMedium.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <div class="vis-canvas-wrap">
          <PrismCanvas
            :prism-angle="ex.params.prismAngle"
            :angle-incidence="ex.params.angleIncidence"
            :wavelength="ex.params.wavelength"
            :material="ex.params.material"
            :angle-refraction1="ex.lab.angleRefraction1.value"
            :angle-incidence2="ex.lab.angleIncidence2.value"
            :angle-emergence="ex.lab.angleEmergence.value"
            :deviation="ex.lab.deviation.value"
            :n="ex.lab.nValue.value"
            :total-internal-reflection="ex.lab.totalInternalReflection.value"
            :running="ex.lab.running.value"
          />
        </div>
        <PrismControlBar
          :launch-label="ex.lab.running.value && !ex.lab.paused.value ? '&#x23F8; ' + t('prism.pauseBtn') : '&#x25B6; ' + t('prism.startBtn')"
          :can-undo="ex.trials.canUndo()"
          :can-redo="ex.trials.canRedo()"
          @toggle-pause="ex.lab.togglePause"
          @reset="ex.resetSim"
          @record-trial="ex.trials.recordTrial"
          @clear-trials="ex.trials.clearTrials"
          @export-csv="ex.downloadCsv"
          @undo="ex.trials.undo"
          @redo="ex.trials.redo"
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
            <PrismPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :angle-refraction1="ex.lab.angleRefraction1.value"
              :angle-incidence2="ex.lab.angleIncidence2.value"
              :angle-emergence="ex.lab.angleEmergence.value"
              :deviation="ex.lab.deviation.value"
              :total-internal-reflection="ex.lab.totalInternalReflection.value"
              :critical-angle="ex.lab.criticalAngle.value"
              :slope="ex.regression.value.m"
              :intercept="ex.regression.value.b"
              :r-squared="ex.regression.value.r2"
              :n-value="ex.lab.nValue.value"
              :avg-n="ex.avgN.value"
              :speed-in-medium="ex.lab.speedInMedium.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
        </template>
      </div>
    </div>

    <PrismOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :params="ex.params"
      :angle-refraction1="ex.lab.angleRefraction1.value"
      :angle-incidence2="ex.lab.angleIncidence2.value"
      :angle-emergence="ex.lab.angleEmergence.value"
      :deviation="ex.lab.deviation.value"
      :total-internal-reflection="ex.lab.totalInternalReflection.value"
      :critical-angle="ex.lab.criticalAngle.value"
      :slope="ex.regression.value.m"
      :intercept="ex.regression.value.b"
      :r-squared="ex.regression.value.r2"
      :n-value="ex.lab.nValue.value"
      :avg-n="ex.avgN.value"
      :speed-in-medium="ex.lab.speedInMedium.value"
      @maximize="ex.layout.maximizePanel"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
      @update:params="Object.assign(ex.params, $event)"
    />

    <div class="hint-bar" v-if="!ex.lab.running.value">
      <span>&#x1F4A1; {{ t('prism.hintStart') }}</span>
    </div>
    <div class="hint-bar active" v-else-if="ex.lab.paused.value">
      <span>&#x23F8; {{ t('prism.hintPaused') }}</span>
    </div>
    <div class="hint-bar success" v-else>
      <span>&#x2705; {{ t('prism.hintRunning') }}</span>
    </div>

    <PrismStatusBar
      :running="ex.lab.running.value"
      :paused="ex.lab.paused.value"
      :prism-angle="ex.params.prismAngle"
      :angle-incidence="ex.params.angleIncidence"
      :n="ex.lab.nValue.value"
      :total-internal-reflection="ex.lab.totalInternalReflection.value"
    />
  </div>
</template>

<style scoped>
.prism-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; position: relative; }
.vis-canvas-wrap { flex: 1; min-height: 0; position: relative; width: 100%; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
