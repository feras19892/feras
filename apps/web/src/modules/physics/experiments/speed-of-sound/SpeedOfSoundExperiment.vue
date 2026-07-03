<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSpeedOfSoundExperiment } from '../../../../composables/speed-of-sound/useSpeedOfSoundExperiment'
import { useI18n } from '../../../../composables/useI18n'
import SpeedOfSoundMenuBar from '../../../../components/experiment/speed-of-sound/SpeedOfSoundMenuBar.vue'
import SpeedOfSoundCanvas from '../../../../components/experiment/speed-of-sound/SpeedOfSoundCanvas.vue'
import SpeedOfSoundPanelBody from '../../../../components/experiment/speed-of-sound/SpeedOfSoundPanelBody.vue'
import SpeedOfSoundStatusBar from '../../../../components/experiment/speed-of-sound/SpeedOfSoundStatusBar.vue'
import SpeedOfSoundControlBar from '../../../../components/experiment/speed-of-sound/SpeedOfSoundControlBar.vue'
import SpeedOfSoundHelpModal from '../../../../components/experiment/speed-of-sound/SpeedOfSoundHelpModal.vue'
import SpeedOfSoundOverlayPanels from '../../../../components/experiment/speed-of-sound/SpeedOfSoundOverlayPanels.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'

const ex = useSpeedOfSoundExperiment()
const { t } = useI18n()
const helpOpen = ref(false)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.lab.togglePause() }
  else if (e.key === 'r' || e.key === 'R') { if (confirm(t('experiments.resetConfirm'))) ex.resetSim() }
  else if (e.key === 's' || e.key === 'S') ex.trials.recordTrial()
  else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (e.shiftKey) ex.trials.redo(); else ex.trials.undo() }
  else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ex.trials.redo() }
  else if (e.key === '?') helpOpen.value = !helpOpen.value
}

onMounted(() => { ex.layout.applyPersistedLayout(); ex.trials.autoLoad(); window.addEventListener('keydown', onKeyDown) })
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="speed-of-sound-lab">
    <SpeedOfSoundMenuBar
      :title="t('experiments.expSpeedOfSound')"
      icon="&#x1F50A;"
      experiment-route="/physics/waves/speed-of-sound"
      experiment-name="Speed of Sound"
      @toggle-panel="ex.layout.togglePanel"
      @show-all-panels="ex.layout.showAllPanels"
      @export-csv="ex.trials.exportCsv"
      @toggle-pause="ex.lab.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />

    <SpeedOfSoundHelpModal :open="helpOpen" @close="helpOpen = false" />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.layout.widths.data + 'px' }">
        <template v-for="id in ex.layout.columnMap.data" :key="id">
          <DraggablePanel
            v-if="ex.layout.isPanelVisible(id)"
            class="lab-card"
            :id="id"
            :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel"
            @hide="ex.layout.togglePanel"
            @drop="ex.handleDrop"
          >
            <SpeedOfSoundPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :wavelength="ex.lab.wavelength.value"
              :v-measured="ex.lab.vMeasured.value"
              :v-theory="ex.lab.vTheory.value"
              :percent-error="ex.lab.percentError.value"
              :waveform-data="ex.lab.waveformData.value"
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
          <SpeedOfSoundCanvas
            :tube-length="ex.params.tubeLength"
            :frequency="ex.params.frequency"
            :temperature="ex.params.temperature"
            :harmonic="ex.params.harmonic"
            :running="ex.lab.running.value"
          />
        </div>
        <SpeedOfSoundControlBar
          :launch-label="ex.lab.running.value && !ex.lab.paused.value ? '&#x23F8; ' + t('experiments.pauseBtn') : '&#x25B6; ' + t('experiments.startBtn')"
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
      <div class="resizer" @mousedown="ex.onResizeStart('ctrl', $event)"></div>
      <div class="lab-col ctrl-col" :style="{ width: ex.layout.widths.ctrl + 'px' }">
        <template v-for="id in ex.layout.columnMap.ctrl" :key="id">
          <DraggablePanel
            v-if="ex.layout.isPanelVisible(id)"
            class="lab-card"
            :id="id"
            :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel"
            @hide="ex.layout.togglePanel"
            @drop="ex.handleDrop"
          >
            <SpeedOfSoundPanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :wavelength="ex.lab.wavelength.value"
              :v-measured="ex.lab.vMeasured.value"
              :v-theory="ex.lab.vTheory.value"
              :percent-error="ex.lab.percentError.value"
              :waveform-data="ex.lab.waveformData.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
        </template>
      </div>
    </div>

    <SpeedOfSoundOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :params="ex.params"
      :wavelength="ex.lab.wavelength.value"
      :v-measured="ex.lab.vMeasured.value"
      :v-theory="ex.lab.vTheory.value"
      :percent-error="ex.lab.percentError.value"
      :waveform-data="ex.lab.waveformData.value"
      @maximize="ex.layout.maximizePanel"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
      @update:params="Object.assign(ex.params, $event)"
    />

    <div class="hint-bar" v-if="!ex.lab.running.value"><span>&#x1F4A1; {{ t('experiments.hintStart') }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.paused.value"><span>&#x23F8; {{ t('experiments.hintPaused') }}</span></div>
    <div class="hint-bar success" v-else><span>&#x2705; {{ t('experiments.hintRunning') }}</span></div>

    <SpeedOfSoundStatusBar
      :running="ex.lab.running.value"
      :paused="ex.lab.paused.value"
      :tube-length="ex.params.tubeLength"
      :frequency="ex.params.frequency"
      :v-measured="ex.lab.vMeasured.value"
      :v-theory="ex.lab.vTheory.value"
      :percent-error="ex.lab.percentError.value"
    />
  </div>
</template>

<style scoped>
.speed-of-sound-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
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
