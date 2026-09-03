<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, onMounted, onUnmounted } from 'vue'
import { useLightRayExperiment } from '../../../../composables/lightray/useLightRayExperiment'

import { useResetConfirm } from '../../../../composables/useResetConfirm'
import LightRayMenuBar from '../../../../components/experiment/lightray/LightRayMenuBar.vue'
import LightRayCanvas from '../../../../components/experiment/lightray/LightRayCanvas.vue'
import LightRayStatusBar from '../../../../components/experiment/lightray/LightRayStatusBar.vue'
import LightRayControlBar from '../../../../components/experiment/lightray/LightRayControlBar.vue'
import LightRayHelpModal from '../../../../components/experiment/lightray/LightRayHelpModal.vue'
import LightRayGuidePanel from '../../../../components/experiment/lightray/LightRayGuidePanel.vue'
import LightRayPanelBody from '../../../../components/experiment/lightray/LightRayPanelBody.vue'
import LightRayOverlayPanels from '../../../../components/experiment/lightray/LightRayOverlayPanels.vue'
import DraggablePanel from '../../../../components/experiment/shared/DraggablePanel.vue'
import ResetConfirmModal from '../../../../components/shared/ResetConfirmModal.vue'





const { confirmReset } = useResetConfirm()
const ex = useLightRayExperiment()
const helpOpen = ref(false)
const showGuide = ref(true)
const canvasRef = ref<InstanceType<typeof LightRayCanvas> | null>(null)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') {
    e.preventDefault()
    ex.lab.togglePause()
  } else if (e.key === 'r' || e.key === 'R') {
    confirmReset().then(ok => { if (ok) ex.resetSim() })
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
  <div class="lightray-lab">
    <LightRayMenuBar
      :title="t('experiments.lightRayTitle')"
      icon="💡"
      @show-all-panels="ex.layout.showAllPanels"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <LightRayHelpModal :open="helpOpen" @close="helpOpen = false" />

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
            <LightRayPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :angle-reflection="ex.lab.angleReflection.value"
              :angle-refraction="ex.lab.angleRefraction.value"
              :total-internal-reflection="ex.lab.totalInternalReflection.value"
              :critical-angle="ex.lab.criticalAngle.value"
              :slope="ex.regression.value.m"
              :intercept="ex.regression.value.b"
              :r-squared="ex.regression.value.r2"
              :calculated-n2="ex.calculatedN2.value"
              :speed-in-medium="ex.speedInMedium.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <LightRayCanvas
          ref="canvasRef"
          :angle-incidence="ex.params.angleIncidence"
          :n1="ex.params.n1"
          :n2="ex.params.n2"
          :angle-reflection="ex.lab.angleReflection.value"
          :angle-refraction="ex.lab.angleRefraction.value"
          :total-internal-reflection="ex.lab.totalInternalReflection.value"
          :running="ex.lab.running.value"
        />
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
            <LightRayPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :angle-reflection="ex.lab.angleReflection.value"
              :angle-refraction="ex.lab.angleRefraction.value"
              :total-internal-reflection="ex.lab.totalInternalReflection.value"
              :critical-angle="ex.lab.criticalAngle.value"
              :slope="ex.regression.value.m"
              :intercept="ex.regression.value.b"
              :r-squared="ex.regression.value.r2"
              :calculated-n2="ex.calculatedN2.value"
              :speed-in-medium="ex.speedInMedium.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
          <div v-else-if="id === 'params'" class="params-embedded">
            <LightRayPanelBody
              id="params"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :angle-reflection="ex.lab.angleReflection.value"
              :angle-refraction="ex.lab.angleRefraction.value"
              :total-internal-reflection="ex.lab.totalInternalReflection.value"
              :critical-angle="ex.lab.criticalAngle.value"
              :slope="ex.regression.value.m"
              :intercept="ex.regression.value.b"
              :r-squared="ex.regression.value.r2"
              :calculated-n2="ex.calculatedN2.value"
              :speed-in-medium="ex.speedInMedium.value"
              @update:params="Object.assign(ex.params, $event)"
            />
          </div>
        </template>
        <LightRayGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <LightRayOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :params="ex.params"
      :angle-reflection="ex.lab.angleReflection.value"
      :angle-refraction="ex.lab.angleRefraction.value"
      :total-internal-reflection="ex.lab.totalInternalReflection.value"
      :critical-angle="ex.lab.criticalAngle.value"
      :slope="ex.regression.value.m"
      :intercept="ex.regression.value.b"
      :r-squared="ex.regression.value.r2"
      :calculated-n2="ex.calculatedN2.value"
      :speed-in-medium="ex.speedInMedium.value"
      @maximize="ex.layout.maximizePanel"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
      @update:params="Object.assign(ex.params, $event)"
    />

    <div class="hint-bar" v-if="!ex.lab.running.value">
      <span>💡 {{ t('experiments.pressStartThenRecordHint') }}</span>
    </div>
    <div class="hint-bar active" v-else-if="ex.lab.paused.value">
      <span>⏸️ {{ t('experiments.simPausedPressResumeHint') }}</span>
    </div>
    <div class="hint-bar success" v-else>
      <span>✅ {{ t('experiments.simRunningPressRecordHint') }}</span>
    </div>

    <LightRayStatusBar
      :running="ex.lab.running.value"
      :paused="ex.lab.paused.value"
      :n1="ex.params.n1"
      :n2="ex.params.n2"
      :total-internal-reflection="ex.lab.totalInternalReflection.value"
    />
    <LightRayControlBar
      :launch-label="ex.lab.running.value && !ex.lab.paused.value ? '⏸️ ' + t('experiments.pauseBtn') : '▶️ ' + t('experiments.startBtn')"
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
  <ResetConfirmModal />
</template>

<style scoped>
.lightray-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.params-embedded { padding: .6rem; }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
