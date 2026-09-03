<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
const props = defineProps<{

  p: number
  v: number
  pv: number
  n: number
  T: number
  constTarget: number
}>()
const R_L_atm = 0.082057
const nrt_atmL = () => props.n * R_L_atm * props.T
const isConst = () => Math.abs(props.pv - props.constTarget) < 0.05
const constancyLabel = () => {
  if (!props.constTarget) return ''
  const dev = Math.abs(props.pv - props.constTarget) / props.constTarget * 100
  if (dev < 1) return t('experiments.blConstancyExcellent')
  if (dev < 5) return t('experiments.blConstancyGood')
  return t('experiments.blConstancyNeedsMore')
}
</script>
<template>
  <div class="panel-body">
    <div class="law-box boyle">
      <div class="law-title">{{ t('experiments.blBoylesLaw') }}</div>
      <div class="formula">P × V = constant</div>
      <div class="sub">{{ t('experiments.blIsothermalHint') }}</div>
      <div class="data-grid">
        <div class="data-item"><span class="data-label">P</span><span class="data-val">{{ props.p.toFixed(2) }} atm</span></div>
        <div class="data-item"><span class="data-label">V</span><span class="data-val">{{ props.v.toFixed(2) }} L</span></div>
        <div class="data-item highlight"><span class="data-label">P·V</span><span class="data-val green">{{ props.pv.toFixed(2) }} atm·L</span></div>
        <div class="data-item"><span class="data-label">{{ t('experiments.blConstantK') }}</span><span class="data-val amber">{{ props.constTarget.toFixed(2) }}</span></div>
        <div class="data-item"><span class="data-label">{{ t('experiments.blDeviation') }}</span><span class="data-val" :class="isConst() ? 'green' : 'red'">{{ constancyLabel() }}</span></div>
      </div>
    </div>
    <div class="law-box ideal">
      <div class="law-title">{{ t('experiments.blIdealGasLaw') }}</div>
      <div class="formula">P·V = n·R·T</div>
      <div class="data-grid">
        <div class="data-item"><span class="data-label">n·R·T</span><span class="data-val">{{ nrt_atmL().toFixed(2) }} atm·L</span></div>
        <div class="data-item"><span class="data-label">{{ t('experiments.blActualPv') }}</span><span class="data-val green">{{ props.pv.toFixed(2) }} atm·L</span></div>
        <div class="data-item"><span class="data-label">{{ t('experiments.blNote') }}</span><span class="data-val" style="color:#64748b;font-size:.65rem">{{ t('experiments.blNoteText') }}</span></div>
      </div>
    </div>
    <div class="law-box const">
      <div class="law-title">{{ t('experiments.blPhysicalConstants') }}</div>
      <div class="const-grid">
        <div class="const-item"><span class="const-sym">R</span><span class="const-val">{{ R_L_atm }} L·atm/(mol·K)</span></div>
        <div class="const-item"><span class="const-sym">n</span><span class="const-val">{{ props.n }} mol</span></div>
        <div class="const-item"><span class="const-sym">T</span><span class="const-val">{{ props.T }} K</span></div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.5rem; display:flex; flex-direction:column; gap:.45rem; }
.law-box { border-radius:8px; padding:.6rem .7rem; }
.law-box.boyle { background:rgba(91,141,184,.06); border:1px solid rgba(91,141,184,.18); }
.law-box.ideal { background:rgba(245,158,11,.06); border:1px solid rgba(245,158,11,.18); }
.law-box.const { background:rgba(34,197,94,.06); border:1px solid rgba(34,197,94,.18); }
.law-title { font-weight:800; font-size:.8rem; margin-bottom:.4rem; }
.law-box.boyle .law-title { color:#5B8DB8; }
.law-box.ideal .law-title { color:#fbbf24; }
.law-box.const .law-title { color:#4ade80; }
.formula { font-family:'Courier New', monospace; font-size:.9rem; color:#D1D7E0; text-align:center; margin:.25rem 0 .15rem; letter-spacing:.5px; }
.sub { text-align:center; color:#64748b; font-size:.65rem; margin-bottom:.4rem; }
.data-grid { display:flex; flex-direction:column; gap:.2rem; }
.data-item { display:flex; justify-content:space-between; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.02); font-size:.74rem; }
.data-item.highlight { background:rgba(74,222,128,.08); border:1px solid rgba(74,222,128,.2); }
.data-label { color:#8B95A5; }
.data-val { color:#D1D7E0; font-weight:700; }
.data-val.green { color:#4ade80; }
.data-val.amber { color:#fbbf24; }
.data-val.red { color:#f87171; }
.const-grid { display:flex; flex-direction:column; gap:.2rem; }
.const-item { display:flex; justify-content:space-between; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.02); font-size:.74rem; }
.const-sym { color:#8B95A5; font-weight:700; }
.const-val { color:#D1D7E0; font-weight:600; }
</style>