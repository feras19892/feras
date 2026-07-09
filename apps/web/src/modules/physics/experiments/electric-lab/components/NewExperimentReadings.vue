<script setup lang="ts">
defineProps<{
  running: boolean
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
  <div v-if="isInternalResistance && internalResistanceReading" class="readings-grid intR-grid">
    <div class="reading-box voltage"><span class="r-label">ε (EMF)</span><span class="r-value">{{ running ? internalResistanceReading.emf.toFixed(2) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box" style="background:rgba(245,158,11,.08)"><span class="r-label">Vt</span><span class="r-value" style="color:#f59e0b">{{ running ? internalResistanceReading.Vt.toFixed(3) : '0.000' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? internalResistanceReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">r (داخلي)</span><span class="r-value">{{ running ? internalResistanceReading.r.toFixed(2) : '0.0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box" style="background:rgba(239,68,68,.08)"><span class="r-label">ΔV</span><span class="r-value" style="color:#ef4444">{{ running ? internalResistanceReading.Vdrop.toFixed(4) : '0.0000' }}</span><span class="r-unit">V</span></div>
  </div>
  <div v-else-if="isSeries && seriesReading" class="readings-grid series-grid">
    <div class="reading-box voltage"><span class="r-label">V (كلي)</span><span class="r-value">{{ running ? seriesReading.V.toFixed(2) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? seriesReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">Req</span><span class="r-value">{{ running ? seriesReading.Req.toFixed(0) : '0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box" style="background:rgba(74,222,128,.08)"><span class="r-label">V1</span><span class="r-value" style="color:#4ade80">{{ running ? seriesReading.V1.toFixed(3) : '0.000' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box" style="background:rgba(74,222,128,.08)"><span class="r-label">V2</span><span class="r-value" style="color:#4ade80">{{ running ? seriesReading.V2.toFixed(3) : '0.000' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box" style="background:rgba(74,222,128,.08)"><span class="r-label">V3</span><span class="r-value" style="color:#4ade80">{{ running ? seriesReading.V3.toFixed(3) : '0.000' }}</span><span class="r-unit">V</span></div>
  </div>
  <div v-else-if="isCapacitorsCombo && capacitorsComboReading" class="readings-grid capcombo-grid">
    <div class="reading-box voltage"><span class="r-label">C1</span><span class="r-value">{{ running ? capacitorsComboReading.C1.toFixed(1) : '0.0' }}</span><span class="r-unit">µF</span></div>
    <div class="reading-box voltage"><span class="r-label">C2</span><span class="r-value">{{ running ? capacitorsComboReading.C2.toFixed(1) : '0.0' }}</span><span class="r-unit">µF</span></div>
    <div class="reading-box" style="background:rgba(103,232,249,.08)"><span class="r-label">Ceq</span><span class="r-value" style="color:#67e8f9">{{ running ? capacitorsComboReading.Ceq.toFixed(2) : '0.00' }}</span><span class="r-unit">µF</span></div>
    <div class="reading-box resistance"><span class="r-label">τ</span><span class="r-value">{{ running ? capacitorsComboReading.tau.toFixed(4) : '0.0000' }}</span><span class="r-unit">s</span></div>
  </div>
  <div v-else-if="isPotentiometer && potentiometerReading" class="readings-grid pot-grid">
    <div class="reading-box voltage"><span class="r-label">Vref</span><span class="r-value">{{ running ? potentiometerReading.Vref.toFixed(2) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box" style="background:rgba(192,132,252,.08)"><span class="r-label">Vslide</span><span class="r-value" style="color:#c084fc">{{ running ? potentiometerReading.Vslide.toFixed(4) : '0.0000' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">Ig</span><span class="r-value">{{ running ? potentiometerReading.Ig.toFixed(2) : '0.00' }}</span><span class="r-unit">µA</span></div>
    <div class="reading-box" :class="running && potentiometerReading.balanced ? 'balanced' : ''" style="background:rgba(34,197,94,.08)">
      <span class="r-label">الحالة</span>
      <span class="r-value" style="font-size:.85rem">{{ running ? (potentiometerReading.balanced ? 'متوازن ✓' : 'غير متوازن') : 'متوقف' }}</span>
    </div>
  </div>
  <div v-else-if="isNonOhmic && nonOhmicReading" class="readings-grid nonohmic-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? nonOhmicReading.V.toFixed(2) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I (أومي)</span><span class="r-value">{{ running ? nonOhmicReading.I_ohmic.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box" style="background:rgba(251,191,36,.08)"><span class="r-label">I (مصباح)</span><span class="r-value" style="color:#fbbf24">{{ running ? nonOhmicReading.I_lamp.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">R_dyn</span><span class="r-value">{{ running ? nonOhmicReading.R_dyn.toFixed(1) : '0.0' }}</span><span class="r-unit">Ω</span></div>
  </div>
  <div v-else-if="isMaxPower && maxPowerReading" class="readings-grid maxpower-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? maxPowerReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? maxPowerReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box power"><span class="r-label">P</span><span class="r-value">{{ running ? maxPowerReading.P.toFixed(3) : '0.000' }}</span><span class="r-unit">W</span></div>
    <div class="reading-box resistance"><span class="r-label">R حمل</span><span class="r-value">{{ running ? maxPowerReading.R.toFixed(1) : '0.0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box" style="background:rgba(239,68,68,.08)"><span class="r-label">r داخلي</span><span class="r-value" style="color:#ef4444">{{ running ? maxPowerReading.r.toFixed(1) : '0.0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box" :class="running && maxPowerReading.isMax ? 'balanced' : ''" style="background:rgba(34,197,94,.08)"><span class="r-label">Pmax</span><span class="r-value" style="color:#4ade80">{{ running ? maxPowerReading.Pmax.toFixed(3) : '0.000' }}</span><span class="r-unit">W</span></div>
  </div>
  <div v-else-if="isJoulesLaw && joulesReading" class="readings-grid joules-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? joulesReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? joulesReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">R</span><span class="r-value">{{ running ? joulesReading.R.toFixed(0) : '0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box power"><span class="r-label">P = I²R</span><span class="r-value">{{ running ? joulesReading.P.toFixed(3) : '0.000' }}</span><span class="r-unit">W</span></div>
    <div class="reading-box" style="background:rgba(239,68,68,.08)"><span class="r-label">H (٦٠ث)</span><span class="r-value" style="color:#ef4444">{{ running ? joulesReading.H.toFixed(1) : '0.0' }}</span><span class="r-unit">J</span></div>
  </div>
  <div v-else-if="isAmmeterVoltmeter && ammeterVoltmeterReading" class="readings-grid av-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? ammeterVoltmeterReading.V.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? ammeterVoltmeterReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">R مقاسة</span><span class="r-value">{{ running ? ammeterVoltmeterReading.R_measured.toFixed(1) : '0.0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box" style="background:rgba(74,222,128,.08)"><span class="r-label">R حقيقية</span><span class="r-value" style="color:#4ade80">{{ running ? ammeterVoltmeterReading.R_true.toFixed(1) : '0.0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box" :class="running && ammeterVoltmeterReading.error_pct > 1 ? 'unbalanced' : 'balanced'" style="background:rgba(245,158,11,.08)"><span class="r-label">الخطأ %</span><span class="r-value" style="color:#fbbf24">{{ running ? ammeterVoltmeterReading.error_pct.toFixed(2) : '0.00' }}</span><span class="r-unit">%</span></div>
  </div>
  <div v-else-if="isCompound && compoundReading" class="readings-grid compound-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? compoundReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? compoundReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">Req</span><span class="r-value">{{ running ? compoundReading.Req.toFixed(1) : '0.0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box"><span class="r-label">V1</span><span class="r-value">{{ running ? compoundReading.V1.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box"><span class="r-label">V∥</span><span class="r-value">{{ running ? compoundReading.Vpar.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box"><span class="r-label">I2</span><span class="r-value">{{ running ? compoundReading.I2.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box"><span class="r-label">I3</span><span class="r-value">{{ running ? compoundReading.I3.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
  </div>
  <div v-else-if="isEMF && emfReading" class="readings-grid emf-grid">
    <div class="reading-box voltage"><span class="r-label">EMF</span><span class="r-value">{{ running ? emfReading.EMF.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box" style="background:rgba(245,158,11,.08)"><span class="r-label">Vt</span><span class="r-value" style="color:#f59e0b">{{ running ? emfReading.Vt.toFixed(3) : '0.000' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? emfReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box" style="background:rgba(239,68,68,.08)"><span class="r-label">r داخلي</span><span class="r-value" style="color:#ef4444">{{ running ? emfReading.r.toFixed(2) : '0.00' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box" :class="running && emfReading.closed ? 'balanced' : 'unbalanced'"><span class="r-label">الحالة</span><span class="r-value" style="font-size:.85rem">{{ running ? (emfReading.closed ? 'مغلق' : 'مفتوح') : 'متوقف' }}</span></div>
  </div>
  <div v-else-if="isTempR && tempRReading" class="readings-grid tempr-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? tempRReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? tempRReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">R</span><span class="r-value">{{ running ? tempRReading.R.toFixed(1) : '0.0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box"><span class="r-label">R₀</span><span class="r-value">{{ running ? tempRReading.R0.toFixed(1) : '0.0' }}</span><span class="r-unit">Ω</span></div>
    <div class="reading-box" style="background:rgba(239,68,68,.08)"><span class="r-label">T</span><span class="r-value" style="color:#ef4444">{{ running ? tempRReading.T.toFixed(0) : '0' }}</span><span class="r-unit">°C</span></div>
  </div>
  <div v-else-if="isCellsSeries && cellsSeriesReading" class="readings-grid cells-grid">
    <div class="reading-box voltage"><span class="r-label">EMF</span><span class="r-value">{{ running ? cellsSeriesReading.EMF.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box" style="background:rgba(245,158,11,.08)"><span class="r-label">Vt</span><span class="r-value" style="color:#f59e0b">{{ running ? cellsSeriesReading.Vt.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? cellsSeriesReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">R</span><span class="r-value">{{ running ? cellsSeriesReading.R.toFixed(0) : '0' }}</span><span class="r-unit">Ω</span></div>
  </div>
  <div v-else-if="isCellsParallel && cellsParallelReading" class="readings-grid cellsp-grid">
    <div class="reading-box voltage"><span class="r-label">EMF</span><span class="r-value">{{ running ? cellsParallelReading.EMF.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box" style="background:rgba(245,158,11,.08)"><span class="r-label">Vt</span><span class="r-value" style="color:#f59e0b">{{ running ? cellsParallelReading.Vt.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? cellsParallelReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">R</span><span class="r-value">{{ running ? cellsParallelReading.R.toFixed(0) : '0' }}</span><span class="r-unit">Ω</span></div>
  </div>
  <div v-else-if="isRheostat && rheostatReading" class="readings-grid rheo-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? rheostatReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? rheostatReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box resistance"><span class="r-label">R</span><span class="r-value">{{ running ? rheostatReading.R.toFixed(1) : '0.0' }}</span><span class="r-unit">Ω</span></div>
  </div>
  <div v-else-if="isCurrentDivider && currentDividerReading" class="readings-grid cdiv-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? currentDividerReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">It</span><span class="r-value">{{ running ? currentDividerReading.It.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box current"><span class="r-label">I₁</span><span class="r-value" style="color:#22d3ee">{{ running ? currentDividerReading.I1.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box current"><span class="r-label">I₂</span><span class="r-value" style="color:#a78bfa">{{ running ? currentDividerReading.I2.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
  </div>
  <div v-else-if="isSourceEff && sourceEffReading" class="readings-grid eff-grid">
    <div class="reading-box" style="background:rgba(245,158,11,.08)"><span class="r-label">Vt</span><span class="r-value" style="color:#f59e0b">{{ running ? sourceEffReading.Vt.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? sourceEffReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box" style="background:rgba(34,197,94,.08)"><span class="r-label">P_load</span><span class="r-value" style="color:#22c55e">{{ running ? sourceEffReading.Pload.toFixed(3) : '0.000' }}</span><span class="r-unit">W</span></div>
    <div class="reading-box" style="background:rgba(59,130,246,.08)"><span class="r-label">η</span><span class="r-value" style="color:#3b82f6">{{ running ? (sourceEffReading.eta * 100).toFixed(1) : '0.0' }}</span><span class="r-unit">%</span></div>
  </div>
  <div v-else-if="isTwoSources && twoSourcesReading" class="readings-grid ts-grid">
    <div class="reading-box voltage"><span class="r-label">ΔEMF</span><span class="r-value">{{ running ? twoSourcesReading.netEMF.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box" style="background:rgba(245,158,11,.08)"><span class="r-label">Vt</span><span class="r-value" style="color:#f59e0b">{{ running ? twoSourcesReading.Vt.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? twoSourcesReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box" :class="running && twoSourcesReading.direction > 0 ? 'balanced' : 'unbalanced'"><span class="r-label">الاتجاه</span><span class="r-value" style="font-size:.85rem">{{ running ? (twoSourcesReading.direction > 0 ? '1→2' : '2→1') : 'متوقف' }}</span></div>
  </div>
  <div v-else-if="isDiodeIV && diodeReading" class="readings-grid diode-grid">
    <div class="reading-box voltage"><span class="r-label">Vd</span><span class="r-value">{{ running ? diodeReading.Vd.toFixed(3) : '0.000' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value" style="color:#22d3ee">{{ running ? diodeReading.I.toExponential(2) : '0.00e+0' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box" style="background:rgba(239,68,68,.08)"><span class="r-label">V_barrier</span><span class="r-value" style="color:#ef4444">0.700</span><span class="r-unit">V</span></div>
    <div class="reading-box" style="background:rgba(34,197,94,.08)"><span class="r-label">V_src</span><span class="r-value" style="color:#22c55e">{{ running ? diodeReading.Vsrc.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
  </div>
  <div v-else-if="isTransformer && transformerReading" class="readings-grid trans-grid">
    <div class="reading-box voltage"><span class="r-label">Vp</span><span class="r-value">{{ running ? transformerReading.Vp.toFixed(0) : '0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box" style="background:rgba(245,158,11,.08)"><span class="r-label">Vs</span><span class="r-value" style="color:#f59e0b">{{ running ? transformerReading.Vs.toFixed(0) : '0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">Ip</span><span class="r-value">{{ running ? transformerReading.Ip.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box current"><span class="r-label">Is</span><span class="r-value" style="color:#a78bfa">{{ running ? transformerReading.Is.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
  </div>
  <div v-else-if="isSelfInd && selfIndReading" class="readings-grid selfind-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? selfIndReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? selfIndReading.I.toFixed(4) : '0.0000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box" style="background:rgba(34,197,94,.08)"><span class="r-label">E</span><span class="r-value" style="color:#22c55e">{{ running ? selfIndReading.E.toFixed(4) : '0.0000' }}</span><span class="r-unit">J</span></div>
    <div class="reading-box" style="background:rgba(59,130,246,.08)"><span class="r-label">τ</span><span class="r-value" style="color:#3b82f6">{{ running ? (selfIndReading.tau * 1000).toFixed(2) : '0.00' }}</span><span class="r-unit">ms</span></div>
  </div>
  <div v-else-if="isThermistor && thermistorReading" class="readings-grid therm-grid">
    <div class="reading-box" style="background:rgba(239,68,68,.08)"><span class="r-label">T</span><span class="r-value" style="color:#ef4444">{{ running ? thermistorReading.T.toFixed(0) : '0' }}</span><span class="r-unit">°C</span></div>
    <div class="reading-box resistance"><span class="r-label">R (NTC)</span><span class="r-value">{{ running ? (thermistorReading.R / 1000).toFixed(2) : '0.00' }}</span><span class="r-unit">kΩ</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? (thermistorReading.I * 1000).toFixed(3) : '0.000' }}</span><span class="r-unit">mA</span></div>
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? thermistorReading.V.toFixed(2) : '0.00' }}</span><span class="r-unit">V</span></div>
  </div>
  <div v-else-if="isMagneticForce && magneticForceReading" class="readings-grid magf-grid">
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? magneticForceReading.I.toFixed(3) : '0.000' }}</span><span class="r-unit">A</span></div>
    <div class="reading-box" style="background:rgba(59,130,246,.08)"><span class="r-label">B</span><span class="r-value" style="color:#3b82f6">{{ running ? magneticForceReading.B.toFixed(2) : '0.00' }}</span><span class="r-unit">T</span></div>
    <div class="reading-box" style="background:rgba(168,85,247,.08)"><span class="r-label">L</span><span class="r-value" style="color:#a855f7">{{ running ? (magneticForceReading.L * 100).toFixed(0) : '0' }}</span><span class="r-unit">cm</span></div>
    <div class="reading-box" style="background:rgba(34,197,94,.08)"><span class="r-label">F</span><span class="r-value" style="color:#22c55e">{{ running ? (magneticForceReading.F * 1000).toFixed(2) : '0.00' }}</span><span class="r-unit">mN</span></div>
  </div>
  <div v-else-if="isLCOsc && lcOscReading" class="readings-grid lc-grid">
    <div class="reading-box voltage"><span class="r-label">V</span><span class="r-value">{{ running ? lcOscReading.V.toFixed(1) : '0.0' }}</span><span class="r-unit">V</span></div>
    <div class="reading-box current"><span class="r-label">I</span><span class="r-value">{{ running ? (lcOscReading.I * 1000).toFixed(2) : '0.00' }}</span><span class="r-unit">mA</span></div>
    <div class="reading-box" style="background:rgba(245,158,11,.08)"><span class="r-label">f</span><span class="r-value" style="color:#f59e0b">{{ running ? lcOscReading.f.toFixed(0) : '0' }}</span><span class="r-unit">Hz</span></div>
    <div class="reading-box" style="background:rgba(34,197,94,.08)"><span class="r-label">E_total</span><span class="r-value" style="color:#22c55e">{{ running ? (lcOscReading.E * 1000).toFixed(3) : '0.000' }}</span><span class="r-unit">mJ</span></div>
  </div>
</template>

<style scoped>
.readings-grid { display: grid; gap: .5rem; padding: .75rem; }
.intR-grid { grid-template-columns: repeat(5, 1fr); }
.series-grid { grid-template-columns: repeat(6, 1fr); }
.capcombo-grid { grid-template-columns: repeat(4, 1fr); }
.pot-grid { grid-template-columns: repeat(4, 1fr); }
.nonohmic-grid { grid-template-columns: repeat(4, 1fr); }
.maxpower-grid { grid-template-columns: repeat(6, 1fr); }
.joules-grid { grid-template-columns: repeat(5, 1fr); }
.av-grid { grid-template-columns: repeat(5, 1fr); }
.compound-grid { grid-template-columns: repeat(7, 1fr); }
.emf-grid { grid-template-columns: repeat(5, 1fr); }
.tempr-grid { grid-template-columns: repeat(5, 1fr); }
.cells-grid { grid-template-columns: repeat(4, 1fr); }
.cellsp-grid { grid-template-columns: repeat(4, 1fr); }
.rheo-grid { grid-template-columns: repeat(3, 1fr); }
.cdiv-grid { grid-template-columns: repeat(4, 1fr); }
.eff-grid { grid-template-columns: repeat(4, 1fr); }
.ts-grid { grid-template-columns: repeat(4, 1fr); }
.diode-grid { grid-template-columns: repeat(4, 1fr); }
.trans-grid { grid-template-columns: repeat(4, 1fr); }
.selfind-grid { grid-template-columns: repeat(4, 1fr); }
.therm-grid { grid-template-columns: repeat(4, 1fr); }
.magf-grid { grid-template-columns: repeat(4, 1fr); }
.lc-grid { grid-template-columns: repeat(4, 1fr); }
.reading-box { display: flex; flex-direction: column; align-items: center; padding: .5rem; background: rgba(255,255,255,.03); border-radius: 6px; border: 1px solid rgba(255,255,255,.06); }
.r-label { font-size: .7rem; color: #64748b; margin-bottom: .15rem; }
.r-value { font-size: 1.1rem; font-weight: 700; color: #D1D7E0; font-family: 'Courier New', monospace; }
.r-unit { font-size: .65rem; color: #475569; margin-top: .1rem; }
.balanced { border-color: rgba(34,197,94,.3) !important; }
@media (max-width: 768px) {
  .intR-grid, .series-grid, .capcombo-grid, .pot-grid, .nonohmic-grid, .maxpower-grid, .joules-grid, .av-grid, .compound-grid, .emf-grid, .tempr-grid, .cells-grid, .cellsp-grid, .rheo-grid, .cdiv-grid, .eff-grid, .ts-grid, .diode-grid, .trans-grid, .selfind-grid, .therm-grid, .magf-grid, .lc-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
