<script setup lang="ts">
const props = defineProps<{
  sim: { Pi: number | null; Pf: number | null; KEi: number | null; KEf: number | null; lossPercent: number | null; collided: boolean }
  trialStats: { count: number; avgV1f: number; avgV2f: number; avgLoss: number; momentumDiff: number }
}>()
</script>

<template>
  <div class="stats-panel">
    <div v-if="!sim.collided" class="empty">انتظر التصادم لعرض الإحصائيات</div>
    <div v-else class="grid">
      <div class="card">
        <div class="label">الزخم قبل</div>
        <div class="value">{{ sim.Pi?.toFixed(2) }} <span class="unit">kg·m/s</span></div>
      </div>
      <div class="card">
        <div class="label">الزخم بعد</div>
        <div class="value">{{ sim.Pf?.toFixed(2) }} <span class="unit">kg·m/s</span></div>
      </div>
      <div class="card">
        <div class="label">الطاقة قبل</div>
        <div class="value">{{ sim.KEi?.toFixed(2) }} <span class="unit">J</span></div>
      </div>
      <div class="card">
        <div class="label">الطاقة بعد</div>
        <div class="value">{{ sim.KEf?.toFixed(2) }} <span class="unit">J</span></div>
      </div>
      <div class="card wide" :class="{ green: (sim.lossPercent ?? 0) === 0, red: (sim.lossPercent ?? 0) > 0 }">
        <div class="label">فقد الطاقة</div>
        <div class="value">{{ sim.lossPercent }}%</div>
        <div class="bar"><div class="fill" :style="{ width: Math.min(100, sim.lossPercent ?? 0) + '%' }"></div></div>
      </div>
    </div>
    <div v-if="trialStats.count > 0" class="summary">
      <h5>إحصائيات المحاولات ({{ trialStats.count }})</h5>
      <div class="row"><span>متوسط v₁f:</span><b>{{ trialStats.avgV1f }} m/s</b></div>
      <div class="row"><span>متوسط v₂f:</span><b>{{ trialStats.avgV2f }} m/s</b></div>
      <div class="row"><span>متوسط الفقد:</span><b>{{ trialStats.avgLoss }}%</b></div>
      <div class="row"><span>ΔP متوسط:</span><b>{{ trialStats.momentumDiff }}</b></div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel { padding: .5rem; }
.empty { color: #94a3b8; text-align: center; font-size: .75rem; padding: 1rem; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: .4rem; }
.card { background: rgba(255,255,255,.03); border: 1px solid #2D3645; border-radius: 6px; padding: .4rem .5rem; }
.card.wide { grid-column: 1 / -1; }
.card.green { border-color: #22c55e; background: rgba(34,197,94,.05); }
.card.red { border-color: #ef4444; background: rgba(239,68,68,.05); }
.label { font-size: .65rem; color: #94a3b8; margin-bottom: .15rem; }
.value { font-size: .9rem; font-weight: 700; color: #D1D7E0; font-family: monospace; }
.unit { font-size: .6rem; color: #94a3b8; font-weight: 400; }
.bar { height: 4px; background: #2D3645; border-radius: 2px; margin-top: .3rem; overflow: hidden; }
.fill { height: 100%; background: linear-gradient(90deg, #22c55e, #ef4444); border-radius: 2px; transition: width .3s; }
.summary { margin-top: .6rem; border-top: 1px dashed #2D3645; padding-top: .4rem; }
.summary h5 { margin: 0 0 .3rem; color: #5B8DB8; font-size: .72rem; }
.row { display: flex; justify-content: space-between; font-size: .7rem; color: #B8C0CC; margin-bottom: .15rem; }
.row b { color: #D1D7E0; font-family: monospace; }
</style>
