<script setup lang="ts">
import { computed } from 'vue'
import { useSpringStatic, type StaticReading } from '../../../composables/spring/useSpringStatic'
import type { SpringParams } from '../../../modules/physics/experiments/spring/useSpringPhysics'

const props = defineProps<{
  params: SpringParams
}>()

const staticLab = useSpringStatic(props.params)

const emit = defineEmits<{
  (e: 'update:staticReadings', val: StaticReading[]): void
  (e: 'update:staticK', val: number | null): void
}>()

const phaseLabel = computed(() => {
  switch (staticLab.state.phase) {
    case 'setup': return 'جاهز للبدء'
    case 'loading': return 'مرحلة التحميل'
    case 'unloading': return 'مرحلة التفريغ'
    case 'done': return 'انتهت التجربة'
    default: return ''
  }
})
</script>

<template>
  <div class="static-panel">
    <div class="phase-badge">{{ phaseLabel }}</div>

    <div class="readout">
      <div>موضع الاتزان: <b>{{ staticLab.y0.value.toFixed(1) }} cm</b></div>
      <div>الكتلة الحالية: <b>{{ (props.params.mass * 1000).toFixed(0) }} g</b></div>
      <div>القراءة الحالية: <b>{{ staticLab.state.currentY.toFixed(2) }} cm</b></div>
      <div>الاستطالة Δy: <b>{{ (staticLab.state.currentY - staticLab.y0.value).toFixed(2) }} cm</b></div>
      <div>القوة F: <b>{{ (props.params.mass * 9.81).toFixed(3) }} N</b></div>
    </div>

    <div class="actions">
      <template v-if="staticLab.state.phase === 'setup'">
        <button class="btn primary" @click="staticLab.startLoading">بدء التحميل</button>
      </template>

      <template v-if="staticLab.state.phase === 'loading'">
        <button class="btn" @click="staticLab.addWeight">+50g</button>
        <button class="btn" @click="staticLab.removeWeight" :disabled="props.params.mass <= 0">-50g</button>
        <button class="btn primary" @click="staticLab.recordLoad">سجل قراءة</button>
        <button class="btn secondary" @click="staticLab.startUnloading">انتقل للتفريغ</button>
      </template>

      <template v-if="staticLab.state.phase === 'unloading'">
        <button class="btn" @click="staticLab.recordUnload">سجل قراءة</button>
        <button class="btn secondary" @click="staticLab.finish">إنهاء</button>
      </template>

      <template v-if="staticLab.state.phase === 'done'">
        <button class="btn primary" @click="emit('update:staticReadings', staticLab.state.readings); emit('update:staticK', staticLab.fit.value?.k ?? null)">تصدير للتقرير</button>
        <button class="btn danger" @click="staticLab.reset">إعادة التجربة</button>
      </template>
    </div>

    <table class="data-table" v-if="staticLab.state.readings.length">
      <thead>
        <tr><th>#</th><th>m (g)</th><th>y تحميل</th><th>y تفريغ</th><th>y متوسط</th><th>Δy (cm)</th><th>F (N)</th></tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in staticLab.state.readings" :key="r.id">
          <td>{{ i + 1 }}</td>
          <td>{{ (r.mass * 1000).toFixed(0) }}</td>
          <td>{{ r.yLoad.toFixed(2) }}</td>
          <td>{{ r.yUnload > 0 ? r.yUnload.toFixed(2) : '-' }}</td>
          <td>{{ r.yAvg > 0 ? r.yAvg.toFixed(2) : '-' }}</td>
          <td>{{ r.deltaY > 0 ? r.deltaY.toFixed(2) : '-' }}</td>
          <td>{{ r.force > 0 ? r.force.toFixed(3) : '-' }}</td>
        </tr>
      </tbody>
    </table>

    <div class="result-box" v-if="staticLab.fit.value">
      <div><b>ثابت النابض (استاتيكي):</b> k = {{ staticLab.fit.value.k.toFixed(2) }} N/m</div>
    </div>
  </div>
</template>

<style scoped>
.static-panel { display: flex; flex-direction: column; gap: .5rem; }
.row { display: flex; align-items: center; gap: .5rem; font-size: .8rem; }
.row label { color: #8B95A5; white-space: nowrap; }
.row input { width: 80px; background: #161B22; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 4px; padding: .2rem .4rem; font-size: .8rem; }
.actions { display: flex; flex-wrap: wrap; gap: .3rem; }
.btn { background: #252D3A; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 4px; padding: .25rem .5rem; font-size: .75rem; cursor: pointer; }
.btn:hover { background: #2D3645; }
.btn.primary { background: #5B8DB8; border-color: #5B8DB8; color: #fff; }
.btn.primary:hover { background: #4a7a9e; }
.btn.secondary { background: #3a4a5c; border-color: #4a5a6c; }
.btn.danger:hover { background: rgba(212,117,107,.2); color: #D4756B; border-color: rgba(212,117,107,.3); }
.phase-badge { background: #252D3A; border: 1px solid #2D3645; border-radius: 4px; padding: .3rem .5rem; font-size: .75rem; color: #8B95A5; text-align: center; }
.readout { display: flex; flex-direction: column; gap: .2rem; font-size: .78rem; color: #D1D7E0; background: #161B22; border: 1px solid #2D3645; border-radius: 6px; padding: .4rem; }
.readout b { color: #5B8DB8; }
.data-table { width: 100%; border-collapse: collapse; font-size: .75rem; }
.data-table th, .data-table td { border: 1px solid #2D3645; padding: .25rem .3rem; text-align: center; color: #D1D7E0; }
.data-table th { background: #252D3A; }
.data-table td input { width: 55px; background: #161B22; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 3px; padding: .15rem; font-size: .75rem; text-align: center; }
.result-box { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .5rem; font-size: .78rem; color: #D1D7E0; display: flex; flex-direction: column; gap: .2rem; }
</style>
