<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useChemistryExperiment } from '../../../composables/chemistry/useChemistryExperiment'
import { useI18n } from '../../../composables/useI18n'
import ChemMenuBar from '../../../components/experiment/chemistry/ChemMenuBar.vue'
import ChemCanvas3D from '../../../components/experiment/chemistry/ChemCanvas3D.vue'
import ChemPanelBody from '../../../components/experiment/chemistry/ChemPanelBody.vue'
import ChemStatusBar from '../../../components/experiment/chemistry/ChemStatusBar.vue'
import ChemControlBar from '../../../components/experiment/chemistry/ChemControlBar.vue'
import ChemOverlayPanels from '../../../components/experiment/chemistry/ChemOverlayPanels.vue'
import DraggablePanel from '../../../components/experiment/spring/DraggablePanel.vue'

const ex = useChemistryExperiment()
const { t } = useI18n()
const helpOpen = ref(false)

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.code === 'Space') { e.preventDefault(); ex.pause() }
  else if (e.key === 'r' || e.key === 'R') { if (confirm(t('experiments.resetConfirm') ?? 'Reset?')) ex.reset() }
  else if (e.key === '?') { helpOpen.value = !helpOpen.value }
}

onMounted(() => { ex.layout.applyPersistedLayout(); window.addEventListener('keydown', onKeyDown) })
onUnmounted(() => { window.removeEventListener('keydown', onKeyDown) })
</script>

<template>
  <div class="chem-lab">
    <ChemMenuBar
      :title="t('experiments.chemTitle')"
      icon="&#x2697;"
      experiment-route="/chemistry/acid-base"
      :experiment-name="t('experiments.branchChemistryGeneralDesc')"
      @toggle-panel="ex.layout.togglePanel"
      @show-all-panels="ex.layout.showAllPanels"
      @toggle-pause="ex.pause"
      @reset="ex.reset"
      @toggle-help="helpOpen = !helpOpen"
    />

    <div class="lab-grid">
      <div class="lab-col data-col" :style="{ width: ex.layout.widths.data + 'px' }">
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
            <ChemPanelBody :id="id" :ex="ex" />
          </DraggablePanel>
        </template>
      </div>
      <div class="resizer" @mousedown="() => {}" />
      <div class="lab-col vis-col">
        <div class="vis-canvas-wrap">
          <ChemCanvas3D
            :containers="ex.containers"
            :selected-substance="ex.selectedSubstance.value"
            @pour="(id) => ex.pourSubstance(id, 10)"
          />
        </div>
        <ChemControlBar
          :launch-label="ex.state.running && !ex.state.paused ? '&#x23F8; ' + t('experiments.pauseBtn') : ex.state.running && ex.state.paused ? '&#x25B6; ' + t('experiments.resumeBtn') : '&#x25B6; ' + t('experiments.startBtn')"
          @toggle-pause="ex.pause"
          @reset="ex.reset"
        />
      </div>
      <div class="resizer" @mousedown="() => {}" />
      <div class="lab-col ctrl-col" :style="{ width: ex.layout.widths.ctrl + 'px' }">
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
            <ChemPanelBody :id="id" :ex="ex" />
          </DraggablePanel>
        </template>
      </div>
    </div>

    <ChemOverlayPanels
      :maximized="ex.layout.maximized"
      :panel-title="ex.layout.panelTitle"
      :ex="ex"
      @maximize="ex.layout.maximizePanel"
    />

    <ChemStatusBar
      :running="ex.state.running"
      :paused="ex.state.paused"
      :step="ex.state.step"
      :instruction="ex.currentInstruction.value"
    />
  </div>
</template>

<style scoped>
.chem-lab { background: #161B22; color: #D1D7E0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.lab-grid { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
.lab-col { display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; min-height: 0; }
.data-col { background: rgba(255,255,255,0.02); }
.vis-col { align-items: stretch; justify-content: flex-start; background: transparent; flex: 1; min-width: 0; position: relative; }
.vis-canvas-wrap { flex: 1; min-height: 0; position: relative; width: 100%; }
.ctrl-col { background: rgba(255,255,255,0.02); }
.resizer { width: 6px; cursor: col-resize; background: #2D3645; transition: background .2s; flex-shrink: 0; }
.resizer:hover, .resizer:active { background: #5B8DB8; }
.lab-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.75rem; }
</style>
