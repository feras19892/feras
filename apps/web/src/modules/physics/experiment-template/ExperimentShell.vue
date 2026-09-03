<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref } from 'vue';

import type { ExperimentConfig, PanelState } from './types';





defineProps<{
  config: ExperimentConfig;
}>();

// TODO: inject runner + renderer + recorder via composables

const panels = ref<PanelState>({
  table: true,
  scatter: true,
  equations: true,
  signal: true,
  fft: false,
  params: true,
  guide: true,
  stats: true,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

function togglePanel(key: keyof PanelState) {
  panels.value[key] = !panels.value[key];
}
</script>

<template>
  <div class="shell">
    <!-- Top toolbar -->
    <nav class="shell-toolbar">
      <span class="title">{{ t(config.nameAr) }}</span>
      <div class="actions">
        <button @click="togglePanel('table')">📋</button>
        <button @click="togglePanel('params')">⚙️</button>
        <button @click="togglePanel('signal')">📈</button>
      </div>
    </nav>

    <!-- 3-column layout -->
    <div class="shell-grid">
      <!-- Left: Data & Analysis -->
      <aside class="col data-col" v-if="panels.table || panels.equations">
        <div class="panel" v-if="panels.table">
          <div class="panel-header">
            <span>📋 {{ t('experiments.readingsPanel') }}</span>
          </div>
          <p class="placeholder">{{ t('experiments.readingsPlaceholder') }}</p>
        </div>
        <div class="panel" v-if="panels.equations">
          <div class="panel-header">
            <span>⚗️ {{ t('experiments.calculationsPanel') }}</span>
          </div>
          <p class="placeholder">{{ t('experiments.equationsPlaceholder') }}</p>
        </div>
      </aside>

      <!-- Center: Canvas + Signal -->
      <main class="col vis-col">
        <div class="canvas-wrap">
          <canvas ref="canvasRef" width="700" height="420" />
        </div>
        <div class="chart-row" v-if="panels.signal">
          <div class="mini-chart">
            <span>📈 {{ t('experiments.signalPanel') }}</span>
          </div>
          <div class="mini-chart" v-if="panels.fft">
            <span>📊 FFT</span>
          </div>
        </div>
      </main>

      <!-- Right: Controls & Guide -->
      <aside class="col ctrl-col" v-if="panels.params || panels.guide">
        <div class="panel" v-if="panels.params">
          <div class="panel-header">
            <span>⚙️ {{ t('experiments.paramsPanel') }}</span>
          </div>
          <div class="param-list">
            <div v-for="(val, key) in config.params" :key="key" class="param-row">
              <label>{{ key }}</label>
              <input type="number" :value="val" readonly />
            </div>
          </div>
        </div>
        <div class="panel" v-if="panels.guide">
          <div class="panel-header">
            <span>📖 {{ t('experiments.guidePanel') }}</span>
          </div>
          <p class="placeholder">{{ t('experiments.guidePlaceholder') }}</p>
        </div>
      </aside>
    </div>

    <!-- Bottom controls -->
    <div class="shell-footer">
      <button class="btn-primary">▶️ {{ t('experiments.startBtn') }}</button>
      <button class="btn-secondary">🔄 {{ t('experiments.resetBtn') }}</button>
      <button class="btn-secondary">⏸️ {{ t('experiments.pauseBtn') }}</button>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0b1220;
  color: #e2e8f0;
}
.shell-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}
.title { font-weight: 700; color: #67e8f9; }
.actions { display: flex; gap: 0.5rem; }
.actions button {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #e2e8f0;
  border-radius: 0.4rem;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}
.shell-grid {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  overflow-y: auto;
}
.data-col { width: 22%; min-width: 220px; background: rgba(255,255,255,0.02); }
.vis-col { flex: 1; align-items: center; justify-content: center; background: #0f172a; }
.ctrl-col { width: 22%; min-width: 220px; background: rgba(255,255,255,0.02); }

.panel {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  padding: 0.75rem;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: #67e8f9;
}
.placeholder { color: #64748b; font-size: 0.8rem; margin: 0; }

.canvas-wrap canvas {
  background: #0f172a;
  border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.08);
}

.chart-row {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.5rem;
}
.mini-chart {
  flex: 1;
  height: 120px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.8rem;
}

.param-list { display: flex; flex-direction: column; gap: 0.5rem; }
.param-row { display: flex; flex-direction: column; gap: 0.2rem; }
.param-row label { font-size: 0.75rem; color: #94a3b8; }
.param-row input {
  width: 100%;
  padding: 0.3rem 0.5rem;
  border-radius: 0.3rem;
  border: 1px solid #334155;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.8rem;
  box-sizing: border-box;
}

.shell-footer {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #1e293b;
  border-top: 1px solid #334155;
}
.btn-primary {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 0.4rem;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.btn-secondary {
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 0.4rem;
  background: rgba(255,255,255,0.06);
  color: #e2e8f0;
  cursor: pointer;
}
</style>
