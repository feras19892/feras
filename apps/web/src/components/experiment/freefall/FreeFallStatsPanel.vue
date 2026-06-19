<script setup lang="ts">
const props = defineProps<{
  trialStats: { time_mean: number; time_std: number; g_mean: number; g_std: number } | null
  gTheoretical: number
}>()
</script>

<template>
  <div>
    <h5>📊 الإحصائيات</h5>
    <div v-if="trialStats && trialStats.g_mean > 0" class="stats-grid">
      <div class="stat-card"><span class="stat-label">متوسط الزمن</span><span class="stat-val">{{ trialStats.time_mean.toFixed(3) }} s</span></div>
      <div class="stat-card"><span class="stat-label">انحراف الزمن</span><span class="stat-val">{{ trialStats.time_std.toFixed(4) }} s</span></div>
      <div class="stat-card"><span class="stat-label">g المتوسط</span><span class="stat-val">{{ trialStats.g_mean.toFixed(2) }} m/s²</span></div>
      <div class="stat-card"><span class="stat-label">انحراف g</span><span class="stat-val">{{ trialStats.g_std.toFixed(2) }} m/s²</span></div>
      <div class="stat-card"><span class="stat-label">g النظري</span><span class="stat-val">{{ gTheoretical.toFixed(2) }} m/s²</span></div>
    </div>
    <p v-else class="no-data">لا توجد بيانات كافية</p>
  </div>
</template>

<style scoped>
h5 { margin: 0 0 .3rem; font-size: .82rem; color: #5B8DB8; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: .3rem; }
.stat-card { background: #111827; border: 1px solid #2D3645; border-radius: 6px; padding: .4rem .5rem; display: flex; flex-direction: column; gap: .1rem; }
.stat-label { font-size: .65rem; color: #64748b; }
.stat-val { font-size: .8rem; color: #5B8DB8; font-weight: 700; font-family: monospace; }
.no-data { text-align: center; color: #64748b; font-size: .75rem; }
</style>
