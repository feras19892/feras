<script setup lang="ts">
import RCChart from './RCChart.vue'
import NewExperimentReadings from './NewExperimentReadings.vue'

defineProps<{
  running: boolean
  voltage: number
  current: number
  resistance: number
  isKirchhoff?: boolean
  kirchhoffCurrents?: { I1: number; I2: number; I3: number }
  isParallel?: boolean
  parallelCurrents?: { I1: number; I2: number; Itotal: number }
  isPower?: boolean
  powerReading?: { V: number; I: number; P: number }
  isResistivity?: boolean
  resistivityReading?: { V: number; I: number; R: number; rho: number }
  isRC?: boolean
  rcReading?: { V: number; I: number; t: number; tau: number; charging: boolean }
  rcHistory?: { t: number; V: number; I: number }[]
  isLamp?: boolean
  lampReading?: { V: number; I: number; P: number; PLight: number; PHeat: number; brightness: number }
  isGalvanometer?: boolean
  galvanometerReading?: { emf: number; IuA: number; sensitivity: number; turns: number; speed: number }
  isWheatstone?: boolean
  wheatstoneReading?: { Vg: number; Ig: number; balanced: boolean; Rx: number; R1: number; R2: number; R3: number }
  isVoltageDivider?: boolean
  voltageDividerReading?: { V: number; V1: number; V2: number; R1: number; R2: number; I: number }
  isInternalResistance?: boolean
  internalResistanceReading?: { emf: number; Vt: number; I: number; r: number; Vdrop: number }
  isSeries?: boolean
  seriesReading?: { V: number; I: number; Req: number; V1: number; V2: number; V3: number }
  isCapacitorsCombo?: boolean
  capacitorsComboReading?: { Ceq: number; tau: number; C1: number; C2: number }
  isPotentiometer?: boolean
  potentiometerReading?: { Vref: number; Vx: number; Vslide: number; Ig: number; balanced: boolean }
  isNonOhmic?: boolean
  nonOhmicReading?: { V: number; I_ohmic: number; I_lamp: number; R_dyn: number }
  isMaxPower?: boolean
  maxPowerReading?: { V: number; I: number; P: number; R: number; r: number; Pmax: number; isMax: boolean }
  isJoulesLaw?: boolean
  joulesReading?: { V: number; I: number; P: number; R: number; H: number }
  isAmmeterVoltmeter?: boolean
  ammeterVoltmeterReading?: { V: number; I: number; R_measured: number; R_true: number; error_pct: number }
  isCompound?: boolean
  compoundReading?: { V: number; I: number; Req: number; V1: number; Vpar: number; I2: number; I3: number }
  isEMF?: boolean
  emfReading?: { EMF: number; Vt: number; I: number; r: number; closed: boolean }
  isTempR?: boolean
  tempRReading?: { V: number; I: number; R: number; R0: number; T: number }
  isCellsSeries?: boolean
  cellsSeriesReading?: { EMF: number; Vt: number; I: number; R: number }
  isCellsParallel?: boolean
  cellsParallelReading?: { EMF: number; Vt: number; I: number; R: number }
  isRheostat?: boolean
  rheostatReading?: { V: number; I: number; R: number }
  isCurrentDivider?: boolean
  currentDividerReading?: { V: number; It: number; I1: number; I2: number }
  isSourceEff?: boolean
  sourceEffReading?: { Vt: number; I: number; Pload: number; eta: number }
  isTwoSources?: boolean
  twoSourcesReading?: { netEMF: number; I: number; Vt: number; direction: number }
  isDiodeIV?: boolean
  diodeReading?: { Vd: number; I: number; Vsrc: number }
  isTransformer?: boolean
  transformerReading?: { Vp: number; Vs: number; Ip: number; Is: number }
  isSelfInd?: boolean
  selfIndReading?: { V: number; I: number; E: number; tau: number }
  isThermistor?: boolean
  thermistorReading?: { V: number; I: number; R: number; T: number }
  isMagneticForce?: boolean
  magneticForceReading?: { I: number; F: number; B: number; L: number }
  isLCOsc?: boolean
  lcOscReading?: { V: number; I: number; f: number; E: number }
}>()
</script>

<template>
  <div v-if="isKirchhoff && kirchhoffCurrents" class="readings-grid kirchhoff-grid">
    <div class="reading-box current"><span class="r-label">I₁</span><span class="r-value">{{ running ? kirchhoffCurrents.I1.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box current"><span class="r-label">I₂</span><span class="r-value">{{ running ? kirchhoffCurrents.I2.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box current"><span class="r-label">I₃</span><span class="r-value">{{ running ? kirchhoffCurrents.I3.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
  </div>
  <div v-else-if="isParallel && parallelCurrents" class="readings-grid parallel-grid">
    <div class="reading-box current"><span class="r-label">I₁</span><span class="r-value">{{ running ? parallelCurrents.I1.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box current"><span class="r-label">I₂</span><span class="r-value">{{ running ? parallelCurrents.I2.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box current"><span class="r-label">I<sub>total</sub></span><span class="r-value">{{ running ? parallelCurrents.Itotal.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
  </div>
  <div v-else-if="isPower && powerReading" class="readings-grid power-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? powerReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? powerReading.I.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box power"><span class="r-label">P</span><span class="r-value">{{ running ? powerReading.P.toFixed(2) : '0.00' }}</span><span class="r-unit">W</span></div>
  </div>
  <div v-else-if="isResistivity && resistivityReading" class="readings-grid resistivity-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? resistivityReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? resistivityReading.I.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">R</span><span class="r-value">{{ running ? resistivityReading.R.toFixed(1) : '0.0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box resistivity"><span class="r-label">ρ</span><span class="r-value">{{ running ? resistivityReading.rho.toExponential(2) : '0.0' }}</span><span class="r-unit">Ω·m</span></div>
  </div>
  <div v-else-if="isRC && rcReading" class="rc-section">
    <div class="readings-grid rc-grid">
      <div class="reading-box voltage"><span class="r-label">Vc</span><span class="r-value">{{ running ? rcReading.V.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
      <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? rcReading.I.toFixed(5) : '0.000' }}</span><span class="r-unit">A</span></div>
      <div class="reading-box resistance"><span class="r-label">τ</span><span class="r-value">{{ running ? rcReading.tau.toFixed(3) : '0.000' }}</span><span class="r-unit">s</span></div>
      <div class="reading-box" :class="rcReading.charging ? 'charging' : 'discharging'"><span class="r-label">الحالة</span><span class="r-value" style="font-size:.85rem">{{ running ? (rcReading.charging ? 'شحن ⬆' : 'تفريغ ⬇') : 'متوقف' }}</span></div>
    </div>
    <RCChart :running="running" :rc-history="rcHistory" />
  </div>
  <div v-else-if="isLamp && lampReading" class="lamp-section">
    <div class="readings-grid lamp-grid">
      <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? lampReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
      <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? lampReading.I.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
      <div class="reading-box power"><span class="r-label">P</span><span class="r-value">{{ running ? lampReading.P.toFixed(2) : '0.00' }}</span><span class="r-unit">W</span></div>
      <div class="reading-box light"><span class="r-label">P_light</span><span class="r-value">{{ running ? lampReading.PLight.toFixed(3) : '0.000' }}</span><span class="r-unit">W</span></div>
      <div class="reading-box heat"><span class="r-label">P_heat</span><span class="r-value">{{ running ? lampReading.PHeat.toFixed(2) : '0.00' }}</span><span class="r-unit">W</span></div>
      <div class="reading-box brightness"><span class="r-label">الإضاءة</span><span class="r-value" style="font-size:.85rem">{{ running ? (lampReading.brightness * 100).toFixed(0) + '%' : '0%' }}</span></div>
    </div>
    <div class="lamp-visual">
      <div class="lamp-bulb" :style="{ opacity: running ? lampReading.brightness : 0 }">💡</div>
      <div class="lamp-bar-bg"><div class="lamp-bar-fill" :style="{ width: (running ? lampReading.brightness * 100 : 0) + '%' }"></div></div>
    </div>
  </div>
  <div v-else-if="isGalvanometer && galvanometerReading" class="galv-section">
    <div class="readings-grid galv-grid">
      <div class="reading-box voltage"><span class="r-label">ε</span><span class="r-value">{{ running ? galvanometerReading.emf.toFixed(4) : '0.0000' }}</span><span class="r-unit">V</span></div>
      <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? galvanometerReading.IuA.toFixed(2) : '0.00' }}</span><span class="r-unit">µA</span></div>
      <div class="reading-box resistance"><span class="r-label">N</span><span class="r-value">{{ running ? galvanometerReading.turns.toFixed(0) : '0' }}</span><span class="r-unit">لفة</span></div>
      <div class="reading-box power"><span class="r-label">السرعة</span><span class="r-value">{{ running ? galvanometerReading.speed.toFixed(1) : '0.0' }}</span><span class="r-unit">m/s</span></div>
    </div>
    <div class="galv-gauge">
      <svg viewBox="0 0 200 120" class="galv-svg">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e2530" stroke-width="3"/>
        <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.3"/>
        <path d="M 100 20 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e" stroke-width="3" opacity="0.3"/>
        <line :x1="100" :y1="100" :x2="100 + 70 * Math.cos((-90 + (running ? galvanometerReading.sensitivity * 1.8 : 0)) * Math.PI / 180)" :y2="100 - 70 * Math.sin((-90 + (running ? galvanometerReading.sensitivity * 1.8 : 0)) * Math.PI / 180)" :stroke="running && galvanometerReading.IuA > 0 ? '#4ade80' : '#64748b'" stroke-width="3" stroke-linecap="round" :transform="`rotate(${running ? galvanometerReading.sensitivity * 1.8 - 90 : -90}, 100, 100)`" />
        <circle cx="100" cy="100" r="6" fill="#fbbf24"/>
        <text x="20" y="115" fill="#64748b" font-size="10">−</text>
        <text x="170" y="115" fill="#64748b" font-size="10">+</text>
        <text x="95" y="15" fill="#64748b" font-size="9">0</text>
      </svg>
      <div class="galv-sensitivity">الحساسية: {{ running ? galvanometerReading.sensitivity.toFixed(0) : '0' }}%</div>
    </div>
  </div>
  <div v-else-if="isWheatstone && wheatstoneReading" class="wheatstone-section">
    <div class="readings-grid wheatstone-grid">
      <div class="reading-box voltage" :class="{ balanced: running && wheatstoneReading.balanced }"><span class="r-label">Vg</span><span class="r-value">{{ running ? wheatstoneReading.Vg.toFixed(3) : '0.000' }}</span><span class="r-unit">V</span></div>
      <div class="reading-box current"><span class="r-label">Ig</span><span class="r-value">{{ running ? wheatstoneReading.Ig.toFixed(3) : '0.000' }}</span><span class="r-unit">mA</span></div>
      <div class="reading-box resistance"><span class="r-label">R3</span><span class="r-value">{{ running ? wheatstoneReading.R3.toFixed(0) : '0' }}</span><span class="r-unit">Ω</span></div>
      <div class="reading-box power"><span class="r-label">Rx</span><span class="r-value">{{ running ? wheatstoneReading.Rx.toFixed(0) : '0' }}</span><span class="r-unit">Ω</span></div>
    </div>
    <div class="bridge-status" :class="running && wheatstoneReading.balanced ? 'balanced' : 'unbalanced'">
      <span class="bridge-icon">{{ running && wheatstoneReading.balanced ? '✅' : '⚖️' }}</span>
      <span>{{ running && wheatstoneReading.balanced ? 'الجسر متوازن! Rx = R2×R3/R1' : 'الجسر غير متوازن — عدّل R3' }}</span>
    </div>
  </div>
  <div v-else-if="isVoltageDivider && voltageDividerReading" class="vdiv-section">
    <div class="readings-grid vdiv-grid">
      <div class="reading-box voltage"><span class="r-label">V (المصدر)</span><span class="r-value">{{ running ? voltageDividerReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
      <div class="reading-box current"><span class="r-label">V2 (الخرج)</span><span class="r-value">{{ running ? voltageDividerReading.V2.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
      <div class="reading-box resistance"><span class="r-label">R1</span><span class="r-value">{{ running ? voltageDividerReading.R1.toFixed(0) : '0' }}</span><span class="r-unit">Ω</span></div>
      <div class="reading-box power"><span class="r-label">R2</span><span class="r-value">{{ running ? voltageDividerReading.R2.toFixed(0) : '0' }}</span><span class="r-unit">Ω</span></div>
      <div class="reading-box" style="background:rgba(168,85,247,.08)"><span class="r-label">I</span><span class="r-value" style="color:#c084fc">{{ running ? voltageDividerReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    </div>
    <div class="vdiv-bar">
      <div class="vdiv-label">توزيع الجهد:</div>
      <div class="vdiv-bar-bg">
        <div class="vdiv-bar-v1" :style="{ width: running ? (voltageDividerReading.V1 / voltageDividerReading.V * 100) + '%' : '50%' }"></div>
        <div class="vdiv-bar-v2"></div>
      </div>
      <div class="vdiv-legend">
        <span class="leg-v1">V1={{ running ? voltageDividerReading.V1.toFixed(1) : '0' }}V</span>
        <span class="leg-v2">V2={{ running ? voltageDividerReading.V2.toFixed(1) : '0' }}V</span>
      </div>
    </div>
  </div>
  <div v-else-if="isInternalResistance || isSeries || isCapacitorsCombo || isPotentiometer || isNonOhmic || isMaxPower || isJoulesLaw || isAmmeterVoltmeter || isCompound || isEMF || isTempR || isCellsSeries || isCellsParallel || isRheostat || isCurrentDivider || isSourceEff || isTwoSources || isDiodeIV || isTransformer || isSelfInd || isThermistor || isMagneticForce || isLCOsc">
    <NewExperimentReadings
      :running="running"
      :is-internal-resistance="isInternalResistance"
      :internal-resistance-reading="internalResistanceReading"
      :is-series="isSeries"
      :series-reading="seriesReading"
      :is-capacitors-combo="isCapacitorsCombo"
      :capacitors-combo-reading="capacitorsComboReading"
      :is-potentiometer="isPotentiometer"
      :potentiometer-reading="potentiometerReading"
      :is-non-ohmic="isNonOhmic"
      :non-ohmic-reading="nonOhmicReading"
      :is-max-power="isMaxPower"
      :max-power-reading="maxPowerReading"
      :is-joules-law="isJoulesLaw"
      :joules-reading="joulesReading"
      :is-ammeter-voltmeter="isAmmeterVoltmeter"
      :ammeter-voltmeter-reading="ammeterVoltmeterReading"
      :is-compound="isCompound"
      :compound-reading="compoundReading"
      :is-e-m-f="isEMF"
      :emf-reading="emfReading"
      :is-temp-r="isTempR"
      :temp-r-reading="tempRReading"
      :is-cells-series="isCellsSeries"
      :cells-series-reading="cellsSeriesReading"
      :is-cells-parallel="isCellsParallel"
      :cells-parallel-reading="cellsParallelReading"
      :is-rheostat="isRheostat"
      :rheostat-reading="rheostatReading"
      :is-current-divider="isCurrentDivider"
      :current-divider-reading="currentDividerReading"
      :is-source-eff="isSourceEff"
      :source-eff-reading="sourceEffReading"
      :is-two-sources="isTwoSources"
      :two-sources-reading="twoSourcesReading"
      :is-diode-i-v="isDiodeIV"
      :diode-reading="diodeReading"
      :is-transformer="isTransformer"
      :transformer-reading="transformerReading"
      :is-self-ind="isSelfInd"
      :self-ind-reading="selfIndReading"
      :is-thermistor="isThermistor"
      :thermistor-reading="thermistorReading"
      :is-magnetic-force="isMagneticForce"
      :magnetic-force-reading="magneticForceReading"
      :is-l-c-osc="isLCOsc"
      :lc-osc-reading="lcOscReading"
    />
  </div>
  <div v-else class="readings-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? voltage.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? current.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">R</span><span class="r-value">{{ resistance.toFixed(0) }}</span><span class="r-unit">Ω</span></div>
  </div>
</template>

<style src="./experimentReadings.css"></style>
