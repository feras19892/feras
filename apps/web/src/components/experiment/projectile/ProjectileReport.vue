<script setup lang="ts">
const props = defineProps<{
  trials: any[]
  params?: { v0: number; angleDeg: number; g: number; dragCoeff: number }
  trialStats?: { range_mean: number; range_std: number; flightTime_mean: number; flightTime_std: number } | null
  fitResult?: { slope: number; intercept: number } | null
  gTheoretical: number
  canvasSnapshot: string | null
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
const std = (arr: number[]) => { const m = avg(arr); return arr.length ? Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length) : 0 }
function doPrint() { window.print() }
</script>

<template>
  <Teleport to="body">
    <div class="report-overlay" @click.self="emit('close')">
      <div class="report-modal">
        <div class="report-header">
          <h2>تقرير تجربة المقذوفات</h2>
          <div class="header-actions">
            <button class="print-btn" @click="doPrint()">🖨️ طباعة</button>
            <button class="close-btn" @click="emit('close')">×</button>
          </div>
        </div>

        <div class="report-body">
          <!-- Snapshot -->
          <div v-if="canvasSnapshot" class="snapshot">
            <img :src="canvasSnapshot" alt="لقطة شاشة" />
          </div>

          <!-- Parameters -->
          <div v-if="params" class="section">
            <h4>الشروط الأولية</h4>
            <div class="params-grid">
              <div class="param-item"><span class="param-label">v₀</span><span class="param-val">{{ params.v0 }} m/s</span></div>
              <div class="param-item"><span class="param-label">الزاوية</span><span class="param-val">{{ params.angleDeg }}°</span></div>
              <div class="param-item"><span class="param-label">g</span><span class="param-val">{{ params.g }} m/s²</span></div>
              <div class="param-item"><span class="param-label">مقاومة الهواء</span><span class="param-val">{{ params.dragCoeff }}</span></div>
            </div>
          </div>

          <!-- Data Table -->
          <div v-if="trials.length" class="section">
            <h4>جدول القراءات ({{ trials.length }})</h4>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الزاوية</th>
                    <th>v₀ (m/s)</th>
                    <th>الزمن (s)</th>
                    <th>أقصى ارتفاع (m)</th>
                    <th>المدى (m)</th>
                    <th>الخطأ (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(t, i) in trials" :key="t.id">
                    <td class="idx">{{ i + 1 }}</td>
                    <td>{{ t.angleDegrees.toFixed(1) }}°</td>
                    <td>{{ t.initialVelocity.toFixed(2) }}</td>
                    <td>{{ t.flightTimeSec.toFixed(2) }}</td>
                    <td>{{ t.maxHeightMeters.toFixed(2) }}</td>
                    <td class="range">{{ t.rangeMeters.toFixed(2) }}</td>
                    <td class="err">{{ t.err.toFixed(2) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Statistics -->
          <div v-if="trials.length && trialStats" class="section">
            <h4>الإحصائيات</h4>
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-label">متوسط المدى</span>
                <span class="stat-val">{{ trialStats.range_mean.toFixed(2) }} m</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">الانحراف المعياري (المدى)</span>
                <span class="stat-val">{{ trialStats.range_std.toFixed(2) }} m</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">متوسط زمن التحليق</span>
                <span class="stat-val">{{ trialStats.flightTime_mean.toFixed(2) }} s</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">الانحراف المعياري (الزمن)</span>
                <span class="stat-val">{{ trialStats.flightTime_std.toFixed(2) }} s</span>
              </div>
            </div>
          </div>

          <!-- Fit Equation -->
          <div v-if="fitResult && trials.length >= 2" class="section">
            <h4>ملائمة منحنى المدى</h4>
            <div class="equation-box">
              <code>R = {{ fitResult.slope.toFixed(4) }} · sin(2θ) {{ fitResult.intercept >= 0 ? '+' : '' }} {{ fitResult.intercept.toFixed(4) }}</code>
            </div>
            <p class="equation-note">منحنى الانحدار الخطي لـ R مقابل sin(2θ)</p>
          </div>

          <!-- Equations Reference -->
          <div class="section">
            <h4>المعادلات المستخدمة</h4>
            <div class="equations-list">
              <div class="eq">z = v₀ sin θ / g</div>
              <div class="eq">H = (v₀ sin θ)² / 2g</div>
              <div class="eq">R = v₀² sin(2θ) / g</div>
            </div>
          </div>

          <p v-if="!trials.length" class="no-data">لا توجد قراءات مسجلة</p>

          <div class="report-footer">
            <span>g النظرية: <b>{{ gTheoretical }} m/s²</b></span>
            <span class="date">{{ new Date().toLocaleDateString('ar-SY') }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.report-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(10, 14, 20, 0.85); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 2rem; }
.report-modal { width: 100%; max-width: 800px; max-height: 90vh; overflow: auto; background: #0f1419; border: 1px solid #1e293b; border-radius: 14px; box-shadow: 0 24px 80px rgba(0,0,0,0.6); display: flex; flex-direction: column; }
.report-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.4rem; border-bottom: 1px solid #1e293b; background: #111827; border-radius: 14px 14px 0 0; }
.report-header h2 { margin: 0; font-size: 1.1rem; color: #e2e8f0; font-weight: 600; }
.close-btn { background: #1e293b; border: none; color: #94a3b8; font-size: 1.4rem; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: .2s; }
.close-btn:hover { background: #334155; color: #f8fafc; }

.report-body { padding: 1.2rem 1.4rem; display: flex; flex-direction: column; gap: 1.2rem; }

.section h4 { margin: 0 0 .5rem 0; font-size: .85rem; color: #5B8DB8; font-weight: 600; }

.snapshot img { width: 100%; max-height: 220px; object-fit: contain; border-radius: 10px; border: 1px solid #1e293b; background: #0b0f15; }

.params-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: .5rem; }
.param-item { background: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: .5rem .7rem; display: flex; justify-content: space-between; align-items: center; }
.param-label { font-size: .75rem; color: #64748b; }
.param-val { font-size: .82rem; color: #e2e8f0; font-weight: 600; font-family: monospace; }

.table-wrap { overflow-x: auto; border: 1px solid #1e293b; border-radius: 10px; }
table { width: 100%; border-collapse: collapse; font-size: .78rem; }
th { background: #111827; color: #5B8DB8; padding: .5rem .4rem; font-weight: 600; text-align: center; border-bottom: 1px solid #1e293b; }
td { padding: .45rem .4rem; text-align: center; color: #cbd5e1; border-bottom: 1px solid #1e293b; }
tr:last-child td { border-bottom: none; }
tbody tr:hover { background: rgba(91,141,184,0.06); }
.idx { color: #64748b; font-weight: 600; }
.range { color: #5B8DB8; font-weight: 600; }
.err { color: #fbbf24; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: .5rem; }
.stat-card { background: #111827; border: 1px solid #1e293b; border-radius: 10px; padding: .7rem .9rem; display: flex; flex-direction: column; gap: .2rem; }
.stat-label { font-size: .72rem; color: #64748b; }
.stat-val { font-size: .9rem; color: #5B8DB8; font-weight: 700; font-family: monospace; }

.equation-box { background: #111827; border: 1px solid #1e293b; border-radius: 10px; padding: .8rem 1rem; text-align: center; }
.equation-box code { color: #f97316; font-size: .95rem; font-family: 'Courier New', monospace; }
.equation-note { margin: .3rem 0 0; font-size: .72rem; color: #64748b; text-align: center; }

.equations-list { display: flex; flex-wrap: wrap; gap: .5rem; }
.eq { background: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: .4rem .8rem; font-size: .82rem; color: #94a3b8; font-family: 'Courier New', monospace; }

.no-data { text-align: center; color: #64748b; font-size: .9rem; padding: 2rem; }

.header-actions { display: flex; gap: .5rem; align-items: center; }
.print-btn { background: #1e293b; border: 1px solid #334155; color: #94a3b8; font-size: .8rem; padding: .4rem .8rem; border-radius: 6px; cursor: pointer; transition: .2s; }
.print-btn:hover { background: #334155; color: #f8fafc; }

.report-footer { display: flex; justify-content: space-between; align-items: center; padding-top: .8rem; border-top: 1px solid #1e293b; font-size: .75rem; color: #475569; }
.report-footer b { color: #5B8DB8; }

@media print {
  .report-overlay { position: static; inset: auto; background: #fff; padding: 0; display: block; }
  .report-modal { max-width: 100%; max-height: none; background: #fff; border: none; box-shadow: none; border-radius: 0; }
  .report-header { background: #fff; border-bottom: 2px solid #1e293b; border-radius: 0; }
  .report-header h2 { color: #000; }
  .close-btn, .print-btn { display: none !important; }
  .report-body { gap: .8rem; }
  .section h4 { color: #000; }
  .snapshot img { border: 1px solid #ccc; max-height: 160px; }
  .param-item, .stat-card, .equation-box, .eq { background: #f8fafc; border: 1px solid #e2e8f0; }
  .param-label, .stat-label, .equation-note { color: #475569; }
  .param-val, .stat-val { color: #000; }
  th { background: #f1f5f9; color: #000; border-bottom: 1px solid #cbd5e1; }
  td { color: #000; border-bottom: 1px solid #e2e8f0; }
  .range { color: #0369a1; }
  .err { color: #b45309; }
  .idx { color: #475569; }
  .report-footer { color: #475569; border-top: 1px solid #e2e8f0; }
  .report-footer b { color: #0369a1; }
}
</style>
