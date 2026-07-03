<script setup lang="ts">
import { ref } from 'vue';
import { useExperimentMonitor } from '../../composables/useExperimentMonitor';

const { fps, memoryUsed, memoryLimit, consoleErrors, physicsHealth } = useExperimentMonitor();
const expanded = ref(false);

const fpsColor = (v: number) => {
  if (v >= 50) return '#22c55e';
  if (v >= 30) return '#eab308';
  return '#ef4444';
};

const memPct = () => {
  if (!memoryLimit.value) return 0;
  return Math.round((memoryUsed.value / memoryLimit.value) * 100);
};
</script>

<template>
  <div class="widget" :class="{ expanded }">
    <!-- Collapsed strip -->
    <button class="strip" @click="expanded = !expanded">
      <span class="dot" :style="{ background: fpsColor(fps) }">{{ fps }}</span>
      <span class="label">مراقبة التجربة</span>
      <span v-if="consoleErrors > 0" class="badge">{{ consoleErrors }}</span>
      <span v-if="physicsHealth === 'fail'" class="alert">⚠️</span>
    </button>

    <!-- Expanded panel -->
    <div v-if="expanded" class="panel">
      <div class="row">
        <span class="key">🎮 FPS</span>
        <span class="val" :style="{ color: fpsColor(fps) }">{{ fps }} إطار/ث</span>
      </div>
      <div class="row">
        <span class="key">💾 الذاكرة</span>
        <span class="val">{{ memoryUsed }} / {{ memoryLimit }} MB ({{ memPct() }}%)</span>
      </div>
      <div class="row">
        <span class="key">🐛 أخطاء</span>
        <span class="val" :class="consoleErrors > 0 ? 'bad' : 'good'">{{ consoleErrors }}</span>
      </div>
      <div class="row">
        <span class="key">🔬 الفيزياء</span>
        <span class="val" :class="physicsHealth">{{ physicsHealth === 'ok' ? '✅ سليم' : '❌ معطل' }}</span>
      </div>
      <a href="/monitor" target="_blank" class="link">📊 فتح لوحة المراقبة الكاملة</a>
    </div>
  </div>
</template>

<style scoped>
.widget {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
  font-family: system-ui, sans-serif;
  direction: rtl;
}

.strip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #1e293b;
  border: 1px solid #334155;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 0.82rem;
}

.dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.72rem;
  color: #fff;
  flex-shrink: 0;
}

.label { font-weight: 500; }

.badge {
  background: #ef4444;
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
}

.alert { color: #fca5a5; font-size: 0.9rem; }

.panel {
  margin-top: 8px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 14px;
  min-width: 220px;
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #1e293b;
  font-size: 0.82rem;
}

.row:last-child { border-bottom: none; }

.key { color: #94a3b8; }

.val { font-weight: 600; }

.val.good  { color: #22c55e; }
.val.bad   { color: #ef4444; }

.link {
  display: block;
  margin-top: 10px;
  text-align: center;
  color: #818cf8;
  font-size: 0.78rem;
  text-decoration: none;
  padding: 6px;
  border-radius: 6px;
  background: #1e293b;
}

.link:hover { background: #334155; }
</style>
