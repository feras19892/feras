<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import { useElectricLab } from './useElectricLab'
import type { ComponentType } from './types'
import ToolPalette from './components/ToolPalette.vue'
import Workspace from './components/Workspace.vue'
import ReadingsPanel from './components/ReadingsPanel.vue'
import PresetPanel from './components/PresetPanel.vue'

const { t } = useI18n()
const lab = useElectricLab()
const selectedId = ref<number | null>(null)

const LEVELS = [
  { key: 'beginner',     label: 'مبتدئ',       color: '#22c55e' },
  { key: 'intermediate', label: 'متوسط',       color: '#fbbf24' },
  { key: 'college',      label: 'جامعي',       color: '#3b82f6' },
  { key: 'advanced',     label: 'متقدم',       color: '#ef4444' },
]

const activePresetId = computed(() => {
  return lab.presets.find(p => p.instructions === lab.activeInstructions.value)?.id ?? ''
})

const activeExperimentName = computed(() => {
  return lab.presets.find(p => p.id === activePresetId.value)?.nameAr ?? ''
})

const activePresetLevel = computed(() => {
  return lab.presets.find(p => p.id === activePresetId.value)?.level ?? 'beginner'
})

const activeLevelMeta = computed(() => LEVELS.find(l => l.key === activePresetLevel.value) ?? LEVELS[0])

const PRESET_ICONS: Record<string, string> = {
  'ohms-law': '📐', 'kirchhoff': '🔀', 'ohms-law-parallel': '∥',
  'power': '⚡', 'resistivity': '📏', 'rc-circuit': '🔌',
  'lamp-circuit': '💡', 'galvanometer': '📐', 'wheatstone': '⚖️',
  'voltage-divider': '📊',
  'internal-resistance': '🔋', 'series-circuit': '🔗',
  'capacitors-series': '🔌', 'capacitors-parallel': '🔌', 'potentiometer': '📏', 'non-ohmic': '💡',
  'max-power-transfer': '⚡',
  'joules-law': '🔥',
  'ammeter-voltmeter': '📐',
  'compound-circuit': '🔀',
  'emf-measurement': '🔋',
  'temperature-resistance': '🌡️',
  'cells-series': '🔋',
  'cells-parallel': '🔋',
  'rheostat': '🎛️',
  'current-divider': '🔀',
  'source-efficiency': '📊',
  'two-sources': '⚡',
  'diode-iv': '📈',
  'transformer-ratio': '🔄',
  'self-inductance': '🧲',
  'thermistor-ntc': '🌡️',
  'magnetic-force': '🧲',
  'lc-oscillation': '📡',
}

let addCounter = 0

function onAdd(type: ComponentType) {
  addCounter++
  lab.addComponent(type, 200 + addCounter * 20, 150 + addCounter * 15)
}

function onMove(id: number, x: number, y: number) { lab.moveComponent(id, x, y) }
function onSelect(id: number | null) { selectedId.value = id }

function onToggleSwitch(id: number) {
  const comp = lab.components.find(c => c.id === id)
  if (comp && comp.type === 'switch') comp._closed = !comp._closed
}

function onToggleSwitchClick() {
  if (lab.isRC.value) { lab.toggleSwitch(); return }
  const sw = lab.components.find(c => c.type === 'switch')
  if (sw) sw._closed = !sw._closed
}

function onLoadPreset(id: string) {
  lab.loadPreset(id)
  selectedId.value = null
}
</script>

<template>
  <div class="elab-experiment">
    <header class="elab-header">
      <h1>🔌 {{ t('experiments.expElectricLab') }}</h1>
      <span class="elab-hint">قانون أوم: I = V/R</span>
      <button v-if="lab.isRC.value || lab.isEMF.value" class="switch-toggle-btn" @click="onToggleSwitchClick">🔘 تبديل المفتاح</button>
      <div class="active-experiment-tag" v-if="lab.activeInstructions.value.length > 0">
        <span class="active-icon">{{ PRESET_ICONS[activePresetId] || '⚡' }}</span>
        <span class="active-name">{{ activeExperimentName }}</span>
        <span class="active-level-badge" :style="{ background: activeLevelMeta.color }">{{ activeLevelMeta.label }}</span>
      </div>
    </header>
    <div class="elab-layout">
      <div class="elab-col tools-col">
        <PresetPanel :presets="lab.presets" :active-instructions="lab.activeInstructions.value" @load="onLoadPreset" />
        <ToolPalette @add="onAdd" />
      </div>
      <div class="elab-col workspace-col">
        <Workspace
          :components="lab.components" :running="lab.running.value"
          :current="lab.current.value" :voltage="lab.voltage.value"
          :kirchhoff-currents="lab.kirchhoffCurrents.value" :parallel-currents="lab.parallelCurrents.value"
          :is-r-c="lab.isRC.value" :rc-reading="lab.rcReading.value"
          :is-lamp="lab.isLamp.value" :lamp-reading="lab.lampReading.value"
          :is-galvanometer="lab.isGalvanometer.value" :galvanometer-reading="lab.galvanometerReading.value"
          :is-internal-resistance="lab.isInternalResistance.value" :internal-resistance-reading="lab.internalResistanceReading.value"
          :is-series="lab.isSeries.value" :series-reading="lab.seriesReading.value"
          :is-non-ohmic="lab.isNonOhmic.value" :non-ohmic-reading="lab.nonOhmicReading.value"
          :is-cells-parallel="lab.isCellsParallel.value" :cells-parallel-reading="lab.cellsParallelReading.value"
          @move="onMove" @select="onSelect"
        />
      </div>
      <div class="elab-col readings-col">
        <ReadingsPanel
          :components="lab.components" :running="lab.running.value"
          :voltage="lab.voltage.value" :current="lab.current.value" :resistance="lab.resistance.value"
          :trials="lab.trials.value" :selected-id="selectedId" :instructions="lab.activeInstructions.value"
          :is-kirchhoff="lab.isKirchhoff.value" :kirchhoff-currents="lab.kirchhoffCurrents.value"
          :is-parallel="lab.isParallel.value" :parallel-currents="lab.parallelCurrents.value"
          :is-power="lab.isPower.value" :power-reading="lab.powerReading.value"
          :is-resistivity="lab.isResistivity.value" :resistivity-reading="lab.resistivityReading.value"
          :is-r-c="lab.isRC.value" :rc-reading="lab.rcReading.value" :rc-history="lab.rcHistory.value"
          :is-lamp="lab.isLamp.value" :lamp-reading="lab.lampReading.value"
          :is-galvanometer="lab.isGalvanometer.value" :galvanometer-reading="lab.galvanometerReading.value"
          :is-wheatstone="lab.isWheatstone.value" :wheatstone-reading="lab.wheatstoneReading.value"
          :is-voltage-divider="lab.isVoltageDivider.value" :voltage-divider-reading="lab.voltageDividerReading.value"
          :is-internal-resistance="lab.isInternalResistance.value" :internal-resistance-reading="lab.internalResistanceReading.value"
          :is-series="lab.isSeries.value" :series-reading="lab.seriesReading.value"
          :is-capacitors-combo="lab.isCapacitorsCombo.value" :capacitors-combo-reading="lab.capacitorsComboReading.value"
          :is-potentiometer="lab.isPotentiometer.value" :potentiometer-reading="lab.potentiometerReading.value"
          :is-non-ohmic="lab.isNonOhmic.value" :non-ohmic-reading="lab.nonOhmicReading.value"
          :is-max-power="lab.isMaxPower.value" :max-power-reading="lab.maxPowerReading.value"
          :is-joules-law="lab.isJoulesLaw.value" :joules-reading="lab.joulesReading.value"
          :is-ammeter-voltmeter="lab.isAmmeterVoltmeter.value" :ammeter-voltmeter-reading="lab.ammeterVoltmeterReading.value"
          :is-compound="lab.isCompound.value" :compound-reading="lab.compoundReading.value"
          :is-emf="lab.isEMF.value" :emf-reading="lab.emfReading.value"
          :is-temp-r="lab.isTempR.value" :temp-r-reading="lab.tempRReading.value"
          :is-cells-series="lab.isCellsSeries.value" :cells-series-reading="lab.cellsSeriesReading.value"
          :is-cells-parallel="lab.isCellsParallel.value" :cells-parallel-reading="lab.cellsParallelReading.value"
          :is-rheostat="lab.isRheostat.value" :rheostat-reading="lab.rheostatReading.value"
          :is-current-divider="lab.isCurrentDivider.value" :current-divider-reading="lab.currentDividerReading.value"
          :is-source-eff="lab.isSourceEff.value" :source-eff-reading="lab.sourceEffReading.value"
          :is-two-sources="lab.isTwoSources.value" :two-sources-reading="lab.twoSourcesReading.value"
          :is-diode-iv="lab.isDiodeIV.value" :diode-reading="lab.diodeReading.value"
          :is-transformer="lab.isTransformer.value" :transformer-reading="lab.transformerReading.value"
          :is-self-ind="lab.isSelfInd.value" :self-ind-reading="lab.selfIndReading.value"
          :is-thermistor="lab.isThermistor.value" :thermistor-reading="lab.thermistorReading.value"
          :is-magnetic-force="lab.isMagneticForce.value" :magnetic-force-reading="lab.magneticForceReading.value"
          :is-lc-osc="lab.isLCOsc.value" :lc-osc-reading="lab.lcOscReading.value"
          @toggle-run="lab.toggleRun" @record="lab.recordTrial" @clear-trials="lab.clearTrials"
          @update-comp="lab.updateComponent" @remove-comp="lab.removeComponent"
          @toggle-switch="onToggleSwitch" @analyze="lab.exportToAnalysis"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.elab-experiment { display: flex; flex-direction: column; height: 100vh; background: #0b1220; color: #e2e8f0; }
.elab-header { padding: 0.75rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 1rem; }
.elab-header h1 { margin: 0; font-size: 1.1rem; color: #f59e0b; }
.elab-hint { font-size: 0.78rem; color: #64748b; }
.switch-toggle-btn {
  background: rgba(34,197,94,.12); border: 1px solid rgba(34,197,94,.3); color: #4ade80;
  padding: .35rem .8rem; border-radius: 6px; cursor: pointer; font-size: .8rem; font-weight: 600; transition: all .15s;
}
.switch-toggle-btn:hover { background: rgba(34,197,94,.2); border-color: rgba(34,197,94,.5); }
.active-experiment-tag {
  display: flex; align-items: center; gap: .4rem; background: rgba(245,158,11,.1);
  border: 1px solid rgba(245,158,11,.2); border-radius: 6px; padding: .3rem .7rem; margin-right: auto;
}
.active-icon { font-size: 1rem; }
.active-name { font-size: .8rem; color: #fbbf24; font-weight: 600; }
.active-level-badge { font-size: .6rem; color: #fff; padding: .1rem .4rem; border-radius: 3px; font-weight: 700; }
.elab-layout { flex: 1; display: flex; gap: 0.75rem; padding: 0.75rem; overflow: hidden; }
.elab-col { display: flex; flex-direction: column; overflow: hidden; }
.tools-col { width: 240px; flex-shrink: 0; overflow-y: auto; }
.workspace-col { flex: 1; min-width: 0; }
.readings-col { width: 280px; flex-shrink: 0; }
</style>
