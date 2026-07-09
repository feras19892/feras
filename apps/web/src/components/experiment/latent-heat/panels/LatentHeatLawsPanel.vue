<script setup lang="ts">
const props = defineProps<{
  mass: number
  phaseType: 'fusion' | 'vaporization'
  currentQ: number
  meltedMass: number
  remainingMass: number
}>()
const phaseName = { fusion: 'انصهار', vaporization: 'تبخر' }
const L = { fusion: 334000, vaporization: 2260000 }
</script>
<template>
  <div class="panel-body">
    <div class="law-box">
      <div class="law-title">قانون الحرارة الكامنة</div>
      <div class="formula">Q = m × L</div>
      <div class="desc">
        عندما تُضاف حرارة لمادة عند درجة حرارة ثابتة، لا يتغير درجة الحرارة بل يتغير حالة المادة.
      </div>
    </div>
    <div class="law-box">
      <div class="law-title">قيم الحرارة الكامنة</div>
      <div class="value-row"><span>انصهار الثلج (L_f)</span><span>334 kJ/kg</span></div>
      <div class="value-row"><span>تبخر الماء (L_v)</span><span>2260 kJ/kg</span></div>
    </div>
    <div class="law-box">
      <div class="law-title">الحالة الحالية — {{ phaseName[phaseType] }}</div>
      <div class="value-row"><span>الحرارة المضافة</span><span>{{ (currentQ/1000).toFixed(1) }} kJ</span></div>
      <div class="value-row"><span>الكتلة المتحولة</span><span>{{ meltedMass.toFixed(3) }} kg</span></div>
      <div class="value-row"><span>الكتلة المتبقية</span><span>{{ remainingMass.toFixed(3) }} kg</span></div>
      <div class="value-row"><span>L المستخدم</span><span>{{ (L[phaseType]/1000).toFixed(0) }} kJ/kg</span></div>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.5rem; }
.law-box { background:rgba(91,141,184,.05); border:1px solid rgba(91,141,184,.15); border-radius:6px; padding:.5rem .6rem; }
.law-title { color:#5B8DB8; font-weight:700; font-size:.78rem; margin-bottom:.35rem; }
.formula { font-family:'Courier New', monospace; font-size:.9rem; color:#D1D7E0; text-align:center; margin:.3rem 0; }
.desc { color:#8B95A5; font-size:.72rem; line-height:1.5; }
.value-row { display:flex; justify-content:space-between; padding:.2rem 0; border-bottom:1px solid rgba(30,37,48,.4); font-size:.72rem; }
.value-row:last-child { border:none; }
.value-row span:first-child { color:#8B95A5; }
.value-row span:last-child { color:#D1D7E0; font-weight:600; }
</style>
