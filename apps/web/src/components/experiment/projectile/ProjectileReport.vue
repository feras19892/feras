<script setup lang="ts">
const props = defineProps<{
  trials: any[]
  gTheoretical: number
  canvasSnapshot: string | null
}>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div class="report-overlay">
      <div class="report-modal">
        <div class="report-header">
          <h3>📋 تقرير تجربة المقذوفات</h3>
          <button @click="emit('close')">×</button>
        </div>
        <div class="report-body">
          <div v-if="canvasSnapshot" class="snapshot"><img :src="canvasSnapshot" alt="snapshot" /></div>
          <table v-if="trials.length">
            <thead><tr><th>#</th><th>الزاوية</th><th>v₀</th><th>الزمن</th><th>الارتفاع</th><th>المدى</th></tr></thead>
            <tbody>
              <tr v-for="(t, i) in trials" :key="t.id"><td>{{ i+1 }}</td><td>{{ t.angleDegrees }}°</td><td>{{ t.initialVelocity }}</td><td>{{ t.flightTimeSec.toFixed(3) }}</td><td>{{ t.maxHeightMeters.toFixed(3) }}</td><td>{{ t.rangeMeters.toFixed(3) }}</td></tr>
            </tbody>
          </table>
          <p v-else>لا توجد قراءات مسجلة</p>
          <p class="footer">g النظرية: {{ gTheoretical }} m/s²</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.report-overlay { position: fixed; inset: 5%; z-index: 200; overflow: auto; background: #1A1F27; border-radius: 12px; border: 1px solid #2D3645; box-shadow: 0 20px 60px rgba(0,0,0,.5); padding: 1rem; }
.report-modal { height: 100%; display: flex; flex-direction: column; }
.report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .8rem; }
.report-header h3 { margin: 0; font-size: 1rem; color: #5B8DB8; }
.report-header button { background: none; border: none; color: #8B95A5; font-size: 1.3rem; cursor: pointer; }
.snapshot { margin-bottom: .8rem; }
.snapshot img { max-width: 100%; border-radius: 8px; border: 1px solid #2D3645; }
table { width: 100%; border-collapse: collapse; font-size: .78rem; }
th, td { padding: .35rem; text-align: center; border-bottom: 1px solid #2D3645; }
th { color: #8B95A5; background: #1E2530; }
.footer { margin-top: .8rem; font-size: .75rem; color: #8B95A5; text-align: center; }
</style>
