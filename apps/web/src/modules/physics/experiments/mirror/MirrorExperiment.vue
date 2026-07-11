<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMirrorExperiment } from '../../../../composables/mirror/useMirrorExperiment'
import { useI18n } from '../../../../composables/useI18n'
import MirrorCanvas from '../../../../components/experiment/mirror/MirrorCanvas.vue'
import MirrorPanelBody from '../../../../components/experiment/mirror/MirrorPanelBody.vue'
import LightRayMenuBar from '../../../../components/experiment/lightray/LightRayMenuBar.vue'
import LightRayStatusBar from '../../../../components/experiment/lightray/LightRayStatusBar.vue'
import LightRayControlBar from '../../../../components/experiment/lightray/LightRayControlBar.vue'
import MirrorHelpModal from '../../../../components/experiment/mirror/MirrorHelpModal.vue'
import MirrorGuidePanel from '../../../../components/experiment/mirror/MirrorGuidePanel.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'

const { t } = useI18n()
const ex = useMirrorExperiment()
const helpOpen = ref(false)
const showGuide = ref(true)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') {
    e.preventDefault()
    ex.lab.togglePause()
  } else if (e.key === 'r' || e.key === 'R') {
    if (confirm(t('experiments.confirmResetSimulation'))) ex.resetSim()
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
  <div class="mirror-lab">
    <LightRayMenuBar
      :title="t('experiments.sphericalMirrorTitle')"
      icon="🪞"
      experiment-route="/physics/waves/mirrors"
      experiment-name="Spherical Mirrors"
      @toggle-panel="ex.layout.togglePanel"
      @show-all-panels="ex.layout.showAllPanels"
      @export-csv="ex.trials.exportCsv"
      @toggle-pause="ex.lab.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <MirrorHelpModal :open="helpOpen" @close="helpOpen = false" />

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
            <MirrorPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :image-distance="ex.lab.imageDistance.value"
              :image-height="ex.lab.imageHeight.value"
              :magnification="ex.lab.magnification.value"
              :image-properties="ex.lab.imageProperties.value"
              :focal-from-regression="ex.focalFromRegression.value"
              :regression-slope="ex.regression.value.m"
              :regression-intercept="ex.regression.value.b"
              :r-squared="ex.regression.value.r2"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="ex.onResizeStart('data', $event)"></div>
      <div class="lab-col vis-col">
        <MirrorCanvas
          :mirror-type="ex.params.mirrorType"
          :focal-length="ex.params.focalLength"
          :object-distance="ex.params.objectDistance"
          :object-height="ex.params.objectHeight"
          :image-distance="ex.lab.imageDistance.value"
          :image-height="ex.lab.imageHeight.value"
          :magnification="ex.lab.magnification.value"
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
            <MirrorPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :image-distance="ex.lab.imageDistance.value"
              :image-height="ex.lab.imageHeight.value"
              :magnification="ex.lab.magnification.value"
              :image-properties="ex.lab.imageProperties.value"
              :focal-from-regression="ex.focalFromRegression.value"
              :regression-slope="ex.regression.value.m"
              :regression-intercept="ex.regression.value.b"
              :r-squared="ex.regression.value.r2"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
          <div v-else-if="id === 'params'" class="params-embedded">
            <MirrorPanelBody
              id="params"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :image-distance="ex.lab.imageDistance.value"
              :image-height="ex.lab.imageHeight.value"
              :magnification="ex.lab.magnification.value"
              :image-properties="ex.lab.imageProperties.value"
              :focal-from-regression="ex.focalFromRegression.value"
              :regression-slope="ex.regression.value.m"
              :regression-intercept="ex.regression.value.b"
              :r-squared="ex.regression.value.r2"
              @update:params="Object.assign(ex.params, $event)"
            />
          </div>
        </template>
        <MirrorGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

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
      :n1="1"
      :n2="1"
      :total-internal-reflection="false"
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
</template>

<style scoped>
.mirror-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
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
