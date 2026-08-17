<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import { SPECIFIC_HEAT_WATER, SPECIFIC_HEAT_ALUMINUM } from '../../../../composables/calorimetry/useCalorimetryCalculations'
const { t } = useI18n()
const props = defineProps<{
  mWater: number
  tWater: number
  mMetal: number
  tMetal: number
  tf: number
  cMetal: number
  mCup?: number
}>()

const qLost = computed(() => props.mMetal * props.cMetal * (props.tMetal - props.tf))
const cupMass = computed(() => props.mCup ?? 0.05)
const qGained = computed(() => (props.mWater * SPECIFIC_HEAT_WATER + cupMass.value * SPECIFIC_HEAT_ALUMINUM) * (props.tf - props.tWater))
const balance = computed(() => Math.abs(qLost.value - qGained.value))
</script>
<template>
  <div class="panel-body">
    <div class="law-box balance">
      <div class="law-title">{{ t('experiments.calHeatBalance') }}</div>
      <div class="formula">Q_lost = Q_gained</div>
      <div class="data-grid">
        <div class="data-item"><span class="data-label">{{ t('experiments.calQLost') }}</span><span class="data-val">{{ qLost.toFixed(1) }} J</span></div>
        <div class="data-item"><span class="data-label">{{ t('experiments.calQGained') }}</span><span class="data-val">{{ qGained.toFixed(1) }} J</span></div>
        <div class="data-item"><span class="data-label">ΔQ</span><span class="data-val" :class="balance < 1 ? 'green' : 'red'">{{ balance.toFixed(2) }} J</span></div>
        <div class="data-item"><span class="data-label">{{ t('experiments.calStatus') }}</span><span class="data-val" :class="balance < 1 ? 'green' : 'red'">{{ balance < 1 ? t('experiments.calBalanced') : t('experiments.calNotBalanced') }}</span></div>
      </div>
    </div>
    <div class="law-box calc">
      <div class="law-title">{{ t('experiments.calCalcSpecificHeat') }}</div>
      <div class="formula">c = Q / (m · ΔT)</div>
      <div class="data-grid">
        <div class="data-item"><span class="data-label">Q</span><span class="data-val">{{ qGained.toFixed(1) }} J</span></div>
        <div class="data-item"><span class="data-label">m</span><span class="data-val">{{ mMetal.toFixed(3) }} kg</span></div>
        <div class="data-item"><span class="data-label">ΔT</span><span class="data-val">{{ (tMetal - tf).toFixed(1) }} °C</span></div>
        <div class="data-item highlight"><span class="data-label">{{ t('experiments.calCMeasured') }}</span><span class="data-val green">{{ (qGained / (mMetal * (tMetal - tf))).toFixed(0) }} J/kg·K</span></div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.5rem; display:flex; flex-direction:column; gap:.45rem; }
.law-box { border-radius:8px; padding:.6rem .7rem; }
.law-box.balance { background:rgba(91,141,184,.06); border:1px solid rgba(91,141,184,.18); }
.law-box.calc { background:rgba(245,158,11,.06); border:1px solid rgba(245,158,11,.18); }
.law-title { font-weight:800; font-size:.8rem; margin-bottom:.4rem; }
.law-box.balance .law-title { color:#5B8DB8; }
.law-box.calc .law-title { color:#fbbf24; }
.formula { font-family:'Courier New', monospace; font-size:.9rem; color:#D1D7E0; text-align:center; margin:.25rem 0 .15rem; letter-spacing:.5px; }
.data-grid { display:flex; flex-direction:column; gap:.2rem; }
.data-item { display:flex; justify-content:space-between; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.02); font-size:.74rem; }
.data-item.highlight { background:rgba(74,222,128,.08); border:1px solid rgba(74,222,128,.2); }
.data-label { color:#8B95A5; }
.data-val { color:#D1D7E0; font-weight:700; }
.data-val.green { color:#4ade80; }
.data-val.red { color:#f87171; }
</style>
