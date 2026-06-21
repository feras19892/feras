<script setup lang="ts">
interface CollisionTrialItem {
  id: number; m1: number; m2: number; v1i: number; v2i: number; e: number; v1f: number; v2f: number; lossPercent: number
}
interface CollisionStats {
  avgV1f: number; avgV2f: number; avgLoss: number
}

const props = defineProps<{
  trials: CollisionTrialItem[]
  params?: Record<string, number>
  trialStats?: CollisionStats
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-full-report'): void
}>()
</script>

<template>
  <div class="report-modal">
    <div class="header">
      <h3>📋 تقرير تجربة التصادم</h3>
      <button class="close" @click="emit('close')">×</button>
    </div>
    <div class="body">
      <div v-if="!props.trials.length" class="empty">لا توجد بيانات مسجلة</div>
      <div v-else>
        <table class="report-table">
          <thead>
            <tr><th>#</th><th>m₁ (kg)</th><th>m₂ (kg)</th><th>v₁i (m/s)</th><th>v₂i (m/s)</th><th>e</th><th>v₁f (m/s)</th><th>v₂f (m/s)</th><th>Loss %</th></tr>
          </thead>
          <tbody>
            <tr v-for="(t, i) in props.trials" :key="t.id">
              <td>{{ i + 1 }}</td>
              <td>{{ t.m1 }}</td>
              <td>{{ t.m2 }}</td>
              <td>{{ t.v1i }}</td>
              <td>{{ t.v2i }}</td>
              <td>{{ t.e }}</td>
              <td>{{ t.v1f }}</td>
              <td>{{ t.v2f }}</td>
              <td>{{ t.lossPercent }}%</td>
            </tr>
          </tbody>
        </table>
        <div class="stats" v-if="props.trialStats">
          <div class="row"><b>متوسط v₁f:</b> {{ props.trialStats.avgV1f }} m/s</div>
          <div class="row"><b>متوسط v₂f:</b> {{ props.trialStats.avgV2f }} m/s</div>
          <div class="row"><b>متوسط الفقد:</b> {{ props.trialStats.avgLoss }}%</div>
        </div>
        <button class="btn" @click="emit('open-full-report')">🖨️ طباعة التقرير الكامل</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-modal { background: #0d1117; border-radius: 12px; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
.header { display: flex; justify-content: space-between; align-items: center; padding: .6rem .8rem; border-bottom: 1px solid #2D3645; flex-shrink: 0; }
.header h3 { margin: 0; font-size: .85rem; color: #D1D7E0; }
.close { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; }
.body { padding: .8rem; overflow-y: auto; flex: 1; }
.empty { color: #94a3b8; text-align: center; padding: 2rem; font-size: .75rem; }
.report-table { width: 100%; border-collapse: collapse; font-size: .72rem; margin-bottom: .8rem; }
.report-table th, .report-table td { border: 1px solid #2D3645; padding: .4rem .5rem; text-align: center; color: #D1D7E0; }
.report-table th { background: rgba(91,141,184,.1); color: #5B8DB8; font-weight: 600; }
.stats { margin-bottom: .8rem; font-size: .75rem; color: #B8C0CC; }
.stats .row { margin-bottom: .2rem; }
.btn { padding: .4rem .8rem; background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: .72rem; }
</style>
