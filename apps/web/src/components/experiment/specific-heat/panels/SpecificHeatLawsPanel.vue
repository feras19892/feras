<script setup lang="ts">
import { C_WATER } from '../../../../composables/specific-heat/useSpecificHeatCalculations'
const props = defineProps<{
  metalMass: number
  waterMass: number
  metalTemp: number
  waterTemp: number
  finalTemp: number
  cExtracted: number
  cTrue: number
}>()
const qLost = () => props.metalMass * props.cExtracted * (props.metalTemp - props.finalTemp)
const qGained = () => props.waterMass * C_WATER * (props.finalTemp - props.waterTemp)
</script>
<template>
  <div class="panel-body">
    <div class="law-box">
      <div class="law-title">اتزان الحرارة</div>
      <div class="formula">m_m·c_m·(T_m − T_f) = m_w·c_w·(T_f − T_w)</div>
      <div class="values">m_m={{ (props.metalMass*1000).toFixed(0) }}g &nbsp; m_w={{ (props.waterMass*1000).toFixed(0) }}g</div>
      <div class="values">T_m={{ props.metalTemp.toFixed(1) }}°C &nbsp; T_f={{ props.finalTemp.toFixed(1) }}°C &nbsp; T_w={{ props.waterTemp }}°C</div>
    </div>
    <div class="law-box">
      <div class="law-title">استخراج c_m</div>
      <div class="formula">c_m = m_w·c_w·(T_f − T_w) / (m_m·(T_m − T_f))</div>
      <div class="values">c_m ≈ {{ props.cExtracted.toFixed(1) }} J/kg·°C &nbsp; (c_true={{ props.cTrue.toFixed(1) }})</div>
    </div>
    <div class="law-box">
      <div class="law-title">الطاقة المفقودة</div>
      <div class="formula">Q_lost = m_m·c_m·(T_m − T_f)</div>
      <div class="values">Q_lost ≈ {{ qLost().toFixed(2) }} J</div>
    </div>
    <div class="law-box">
      <div class="law-title">الطاقة المكتسبة</div>
      <div class="formula">Q_gained = m_w·c_w·(T_f − T_w)</div>
      <div class="values">Q_gained ≈ {{ qGained().toFixed(2) }} J</div>
    </div>
    <div class="law-box">
      <div class="law-title">ثوابت</div>
      <div class="value-row"><span>c_w (ماء)</span><span>{{ C_WATER }} J/kg·°C</span></div>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.law-box { background:rgba(91,141,184,.05); border:1px solid rgba(91,141,184,.15); border-radius:6px; padding:.5rem .6rem; margin-bottom:.4rem; }
.law-title { color:#5B8DB8; font-weight:700; font-size:.78rem; margin-bottom:.35rem; }
.formula { font-family:'Courier New', monospace; font-size:.85rem; color:#D1D7E0; text-align:center; margin:.3rem 0; }
.values { color:#8B95A5; font-size:.72rem; margin:.15rem 0; text-align:center; }
.value-row { display:flex; justify-content:space-between; padding:.2rem 0; border-bottom:1px solid rgba(30,37,48,.4); font-size:.72rem; }
.value-row:last-child { border:none; }
.value-row span:first-child { color:#8B95A5; }
.value-row span:last-child { color:#D1D7E0; font-weight:600; }
</style>
