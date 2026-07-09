<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  material: string
  L0: number
  t0: number
  t1: number
  dL: number
  L1: number
  alpha: number
}>()
const matNames: Record<string, string> = {
  copper: 'نحاس', aluminum: 'ألمنيوم', iron: 'حديد', steel: 'فولاذ', brass: 'سبائك نحاس', glass: 'زجاج',
}
const matName = computed(() => matNames[props.material] || props.material)
const emit = defineEmits<{ (e: 'hoverField', field: string): void }>()
const onHover = (f: string) => emit('hoverField', f)
</script>
<template>
  <div class="readings-panel">
    <div class="row" @mouseenter="onHover('material')" @mouseleave="onHover('')"><span class="label"><span class="dot copper"></span>المادة</span><span class="val">{{ matName }}</span></div>
    <div class="row" @mouseenter="onHover('alpha')" @mouseleave="onHover('')"><span class="label"><span class="dot blue"></span>α (حقيقي)</span><span class="val">{{ alpha.toFixed(1) }} × 10⁻⁶/K</span></div>
    <div class="row" @mouseenter="onHover('L0')" @mouseleave="onHover('')"><span class="label"><span class="dot blue"></span>L₀</span><span class="val">{{ L0.toFixed(2) }} m</span></div>
    <div class="row" @mouseenter="onHover('t0')" @mouseleave="onHover('')"><span class="label"><span class="dot amber"></span>t₀</span><span class="val">{{ t0 }} °C</span></div>
    <div class="row" @mouseenter="onHover('t1')" @mouseleave="onHover('')"><span class="label"><span class="dot amber"></span>t₁</span><span class="val">{{ t1 }} °C</span></div>
    <div class="sep"></div>
    <div class="row highlight" @mouseenter="onHover('dL')" @mouseleave="onHover('')"><span class="label"><span class="dot green"></span>ΔL</span><span :class="dL > 0.0001 ? 'val green' : 'val dim'">{{ (dL * 1000).toFixed(2) }} mm</span></div>
    <div class="row highlight" @mouseenter="onHover('L1')" @mouseleave="onHover('')"><span class="label"><span class="dot green"></span>L₁</span><span :class="dL > 0.0001 ? 'val green' : 'val dim'">{{ L1.toFixed(4) }} m</span></div>
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
.dot.copper { background:#b87333; }
.dot.blue { background:#5B8DB8; }
.dot.amber { background:#fbbf24; }
.dot.green { background:#4ade80; }
</style>
