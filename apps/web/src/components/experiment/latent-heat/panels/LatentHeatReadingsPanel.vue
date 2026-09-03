<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
const props = defineProps<{
  mass: number
  phaseType: 'fusion' | 'vaporization'
  currentQ: number
  totalQ: number
  meltedMass: number
  remainingMass: number
  currentTemp: number
}>()
const phaseLabel = { fusion: 'انصهار', vaporization: 'تبخر' }
const emit = defineEmits<{ (e: 'hoverField', field: string): void }>()
const onHover = (f: string) => emit('hoverField', f)
</script>
<template>
  <div class="readings-panel">
    <div class="row" @mouseenter="onHover('mass')" @mouseleave="onHover('')"><span class="label"><span class="dot blue"></span>الكتلة</span><span class="val">{{ mass.toFixed(2) }} kg</span></div>
    <div class="row" @mouseenter="onHover('phaseType')" @mouseleave="onHover('')"><span class="label"><span class="dot amber"></span>نوع التحول</span><span class="val">{{ phaseLabel[phaseType] }}</span></div>
    <div class="sep"></div>
    <div class="row" @mouseenter="onHover('currentQ')" @mouseleave="onHover('')"><span class="label"><span class="dot blue"></span>الحرارة المضافة</span><span class="val">{{ (currentQ/1000).toFixed(1) }} kJ</span></div>
    <div class="row" @mouseenter="onHover('totalQ')" @mouseleave="onHover('')"><span class="label"><span class="dot blue"></span>الحرارة الكلية</span><span class="val">{{ (totalQ/1000).toFixed(1) }} kJ</span></div>
    <div class="row" @mouseenter="onHover('currentTemp')" @mouseleave="onHover('')"><span class="label"><span class="dot amber"></span>درجة الحرارة</span><span class="val">{{ currentTemp }}°C</span></div>
    <div class="sep"></div>
    <div class="row highlight" @mouseenter="onHover('meltedMass')" @mouseleave="onHover('')"><span class="label"><span class="dot green"></span>الكتلة المتحولة</span><span :class="meltedMass > 0.001 ? 'val green' : 'val dim'">{{ meltedMass.toFixed(3) }} kg</span></div>
    <div class="row highlight" @mouseenter="onHover('remainingMass')" @mouseleave="onHover('')"><span class="label"><span class="dot green"></span>الكتلة المتبقية</span><span :class="meltedMass > 0.001 ? 'val green' : 'val dim'">{{ remainingMass.toFixed(3) }} kg</span></div>
    <div class="row" @mouseenter="onHover('ratio')" @mouseleave="onHover('')"><span class="label"><span class="dot green"></span>نسبة التحول</span><span :class="meltedMass > 0.001 ? 'val green' : 'val dim'">{{ (meltedMass/mass*100).toFixed(1) }}%</span></div>
  </div>
</template>
<style scoped>
.readings-panel { display:flex; flex-direction:column; gap:.35rem; padding:.3rem; }
.row { display:flex; justify-content:space-between; align-items:center; font-size:.76rem; padding:.3rem .4rem; border-radius:5px; background:rgba(255,255,255,.03); transition:background .15s; }
.row:hover { background:rgba(255,255,255,.05); }
.row.highlight { background:rgba(74,222,128,.08); border:1px solid rgba(74,222,128,.22); }
.label { color:#8B95A5; display:flex; align-items:center; gap:.35rem; }
.val { color:#D1D7E0; font-weight:700; }
.val.green { color:#4ade80; }
.val.dim { color:#475569; }
.sep { height:1px; background:rgba(30,37,48,.6); margin:.15rem 0; }
.dot { width:6px; height:6px; border-radius:50%; display:inline-block; }
.dot.blue { background:#5B8DB8; }
.dot.amber { background:#fbbf24; }
.dot.green { background:#4ade80; }
</style>