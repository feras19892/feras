<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useResonanceExperiment } from '../../../../composables/resonance/useResonanceExperiment'
import { useI18n } from '../../../../composables/useI18n'
import ResonanceMenuBar from '../../../../components/experiment/resonance/ResonanceMenuBar.vue'
import ResonanceCanvas from '../../../../components/experiment/resonance/ResonanceCanvas.vue'
import ResonancePanelBody from '../../../../components/experiment/resonance/ResonancePanelBody.vue'
import ResonanceStatusBar from '../../../../components/experiment/resonance/ResonanceStatusBar.vue'
import ResonanceControlBar from '../../../../components/experiment/resonance/ResonanceControlBar.vue'
import ResonanceHelpModal from '../../../../components/experiment/resonance/ResonanceHelpModal.vue'
import ResonanceGuidePanel from '../../../../components/experiment/resonance/ResonanceGuidePanel.vue'
import ResonanceOverlayPanels from '../../../../components/experiment/resonance/ResonanceOverlayPanels.vue'
import DraggablePanel from '../../../../components/experiment/spring/DraggablePanel.vue'

const ex = useResonanceExperiment()
const { t } = useI18n()
const helpOpen = ref(false)
const showGuide = ref(true)

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
  <div class="resonance-lab">
    <ResonanceMenuBar
      :title="t('experiments.expResonance')"
      icon="&#x1F3B5;"
      experiment-route="/physics/waves/resonance"
      experiment-name="Standing Waves"
      @toggle-panel="ex.layout.togglePanel"
      @show-all-panels="ex.layout.showAllPanels"
      @export-csv="ex.trials.exportCsv"
      @toggle-pause="ex.lab.togglePause"
      @reset="ex.resetSim"
      @record-trial="ex.trials.recordTrial"
      @toggle-help="helpOpen = !helpOpen"
      @analyze-results="ex.exportToAnalysis"
    />
    <ResonanceHelpModal :open="helpOpen" @close="helpOpen = false" />

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
            <ResonancePanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :frequency="ex.lab.frequency.value"
              :wavelength="ex.lab.wavelength.value"
              :wave-speed="ex.lab.waveSpeed.value"
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
          <ResonanceCanvas
            :string-length="ex.params.stringLength"
            :harmonic="ex.params.harmonic"
            :tension="ex.params.tension"
            :frequency="ex.lab.frequency.value"
            :wavelength="ex.lab.wavelength.value"
            :damping="ex.params.damping"
            :running="ex.lab.running.value"
          />
        </div>
        <ResonanceControlBar
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
            v-if="id !== 'params' && ex.layout.isPanelVisible(id)"
            class="lab-card"
            :id="id"
            :title="ex.layout.panelTitle(id)"
            @maximize="ex.layout.maximizePanel"
            @hide="ex.layout.togglePanel"
            @drop="ex.handleDrop"
          >
            <ResonancePanelBody
              :id="id"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :frequency="ex.lab.frequency.value"
              :wavelength="ex.lab.wavelength.value"
              :wave-speed="ex.lab.waveSpeed.value"
              :waveform-data="ex.lab.waveformData.value"
              @remove="ex.trials.removeTrial"
              @clear="ex.trials.clearTrials"
              @update:params="Object.assign(ex.params, $event)"
            />
          </DraggablePanel>
          <div v-else-if="id === 'params'" class="params-embedded">
            <ResonancePanelBody
              id="params"
              :trials="ex.trials.trials.value"
              :params="ex.params"
              :frequency="ex.lab.frequency.value"
              :wavelength="ex.lab.wavelength.value"
              :wave-speed="ex.lab.waveSpeed.value"
              :waveform-data="ex.lab.waveformData.value"
              @update:params="Object.assign(ex.params, $event)"
            />
          </div>
        </template>
        <ResonanceGuidePanel :visible="showGuide" @close="showGuide = false" />
      </div>
    </div>

    <ResonanceOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :trials="ex.trials.trials.value"
      :params="ex.params"
      :frequency="ex.lab.frequency.value"
      :wavelength="ex.lab.wavelength.value"
      :wave-speed="ex.lab.waveSpeed.value"
      :waveform-data="ex.lab.waveformData.value"
      @maximize="ex.layout.maximizePanel"
      @remove="ex.trials.removeTrial"
      @clear="ex.trials.clearTrials"
      @update:params="Object.assign(ex.params, $event)"
    />

    <div class="hint-bar" v-if="!ex.lab.running.value"><span>&#x1F4A1; {{ t('experiments.hintStart') }}</span></div>
    <div class="hint-bar active" v-else-if="ex.lab.paused.value"><span>&#x23F8; {{ t('experiments.hintPaused') }}</span></div>
    <div class="hint-bar success" v-else><span>&#x2705; {{ t('experiments.hintRunning') }}</span></div>

    <ResonanceStatusBar
      :running="ex.lab.running.value"
      :paused="ex.lab.paused.value"
      :string-length="ex.params.stringLength"
      :harmonic="ex.params.harmonic"
      :tension="ex.params.tension"
      :frequency="ex.lab.frequency.value"
      :wavelength="ex.lab.wavelength.value"
    />
  </div>
</template>

<style scoped>
.resonance-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; position: relative; }
.vis-canvas-wrap { flex: 1; min-height: 0; position: relative; width: 100%; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.params-embedded { padding: .6rem; }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.hint-bar { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.hint-bar.active { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
.hint-bar.success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
</style>
