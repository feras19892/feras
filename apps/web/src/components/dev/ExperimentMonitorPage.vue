<script setup lang="ts">
import { computed } from 'vue';
import { useExperimentMonitor } from '../../composables/useExperimentMonitor';

const {
  fps, memoryUsed, memoryLimit, consoleErrors, consoleWarns,
  canvasErrors, physicsHealth, chemistryHealth, logs, history,
} = useExperimentMonitor();

const memPct = computed(() => {
  if (!memoryLimit.value) return 0;
  return Math.round((memoryUsed.value / memoryLimit.value) * 100);
});

const overall = computed(() => {
  if (physicsHealth.value === 'fail' || consoleErrors.value > 0) return 'fail';
  if (physicsHealth.value === 'warn' || fps.value < 30) return 'warn';
  return 'ok';
});
</script>

<template>
  <div class="monitor-page">
    <header>
      <h1>📊  لوحة مراقبة التجارب العلمية</h1>
      <div class="overall" :class="overall">
        {{ overall === 'ok' ? '✅ كل الأنظمة تعمل' : overall === 'warn' ? '⚠️ تحذير' : '❌ هناك مشكلة' }}
      </div>
    </header>

    <!-- Overview cards -->
    <section class="grid">
      <div class="card" :class="overall">
        <h2>🎮  السرعة (FPS)</h2>
        <p class="big">{{ fps }} <small>إطار/ث</small></p>
        <p class="sub">{{ fps >= 50 ? 'ممتاز' : fps >= 30 ? 'مقبول' : 'بطيء' }}</p>
      </div>

      <div class="card">
        <h2>💾  الذاكرة</h2>
        <p class="big">{{ memoryUsed }} <small>MB</small></p>
        <div class="bar"><div class="fill" :style="{ width: memPct + '%' }" :class="memPct > 80 ? 'warn' : ''" /></div>
        <p class="sub">{{ memPct }}% من {{ memoryLimit }} MB</p>
      </div>

      <div class="card" :class="consoleErrors > 0 ? 'fail' : 'ok'">
        <h2>🐛  أخطاء البرنامج</h2>
        <p class="big">{{ consoleErrors }} <small>خطأ</small></p>
        <p class="sub">{{ consoleWarns }} تحذير · {{ canvasErrors }} رسومات</p>
      </div>

      <div class="card" :class="physicsHealth">
        <h2>🔬  محرك الفيزياء</h2>
        <p class="status">{{ physicsHealth === 'ok' ? '✅ سليم' : physicsHealth === 'warn' ? '⚠️ تحذير' : '❌ معطل' }}</p>
      </div>

      <div class="card" :class="chemistryHealth">
        <h2>🧪  محرك الكيمياء</h2>
        <p class="status">{{ chemistryHealth === 'ok' ? '✅ سليم' : chemistryHealth === 'warn' ? '⚠️ تحذير' : '❌ معطل' }}</p>
      </div>
    </section>

    <!-- FPS history graph -->
    <section class="section">
      <h2>📈  سجل السرعة (آخر ٥ دقائق)</h2>
      <div class="chart">
        <div class="bars">
          <div
            v-for="(h, i) in history"
            :key="i"
            class="bar"
            :style="{ height: Math.min((h.fps / 60) * 100, 100) + '%', background: h.fps >= 50 ? '#22c55e' : h.fps >= 30 ? '#eab308' : '#ef4444' }"
            :title="`${h.fps} FPS - ${h.time}`"
          />
        </div>
      </div>
    </section>

    <!-- Console logs -->
    <section class="section">
      <h2>🔔  سجل الأحداث</h2>
      <div class="log-list">
        <div v-for="(log, i) in logs" :key="i" class="log-item" :class="log.type">
          <span class="time">{{ log.time }}</span>
          <span class="badge">{{ log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : '📘' }}</span>
          <span class="text">{{ log.text }}</span>
        </div>
        <p v-if="logs.length === 0" class="empty">لا توجد أحداث</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.monitor-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  font-family: system-ui, -apple-system, sans-serif;
  background: #0b1021;
  min-height: 100vh;
  color: #e2e8f0;
}

header {
  text-align: center;
  margin-bottom: 28px;
}

header h1 { margin: 0 0 8px; font-size: 1.5rem; }

.overall {
  display: inline-block;
  padding: 6px 20px;
  border-radius: 999px;
  font-weight: 600;
}

.overall.ok   { background: #064e3b; color: #6ee7b7; }
.overall.warn { background: #422006; color: #fde047; }
.overall.fail { background: #450a0a; color: #fca5a5; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.card {
  background: #111827;
  border-radius: 14px;
  padding: 18px;
  border: 2px solid transparent;
  transition: border-color .3s;
}

.card.ok   { border-color: #22c55e; }
.card.warn { border-color: #eab308; }
.card.fail { border-color: #ef4444; }

.card h2 {
  margin: 0 0 10px;
  font-size: 0.88rem;
  color: #94a3b8;
  font-weight: 500;
}

.big {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 4px;
  color: #f8fafc;
}

.big small {
  font-size: 0.85rem;
  font-weight: 500;
  color: #94a3b8;
}

.sub {
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
}

.status {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.bar {
  height: 10px;
  background: #1f2937;
  border-radius: 999px;
  overflow: hidden;
  margin: 8px 0 4px;
}

.fill {
  height: 100%;
  background: #22c55e;
  border-radius: 999px;
  transition: width .5s ease;
}

.fill.warn { background: #ef4444; }

.section {
  background: #111827;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 20px;
}

.section h2 {
  margin: 0 0 14px;
  font-size: 1rem;
  color: #94a3b8;
}

.chart {
  height: 140px;
  display: flex;
  align-items: flex-end;
}

.bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  width: 100%;
  height: 100%;
}

.bar {
  flex: 1;
  min-width: 3px;
  border-radius: 2px;
  transition: height .3s;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 360px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  background: #0b1021;
}

.log-item.error { border-left: 3px solid #ef4444; }
.log-item.warn  { border-left: 3px solid #eab308; }
.log-item.log   { border-left: 3px solid #38bdf8; }

.time   { color: #64748b; font-size: 0.7rem; min-width: 60px; }
.badge  { min-width: 22px; text-align: center; }
.text   { flex: 1; word-break: break-all; }

.empty  { color: #64748b; text-align: center; margin: 0; padding: 12px 0; }
</style>
