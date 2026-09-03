<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref(0);

const tabs = [
  t('analysis.dataTab'),
  t('analysis.drawingTab'),
  t('analysis.calcTab'),
  t('analysis.reportTab'),
];
</script>

<template>
  <div class="analysis-v2-page">
    <nav class="v2-menubar">
      <button class="btn-back" @click="router.back()">{{ t('analysis.back') }}</button>
      <span class="title">{{ t('analysis.newDesignTitle') }}</span>
      <span class="badge">v2</span>
    </nav>

    <div class="tabs-bar">
      <button
        v-for="(label, i) in tabs"
        :key="i"
        class="tab-btn"
        :class="{ active: activeTab === i }"
        @click="activeTab = i"
      >
        {{ label }}
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 0" class="panel">
        <h3>{{ t('analysis.dataTab') }}</h3>
        <p class="hint">{{ t('analysis.dataPlaceholder') }}</p>
      </div>
      <div v-else-if="activeTab === 1" class="panel">
        <h3>{{ t('analysis.drawingTab') }}</h3>
        <canvas class="drawing-canvas" width="600" height="300" />
        <p class="hint">{{ t('analysis.drawingPlaceholder') }}</p>
      </div>
      <div v-else-if="activeTab === 2" class="panel">
        <h3>{{ t('analysis.calcTab') }}</h3>
        <p class="hint">{{ t('analysis.calcPlaceholder') }}</p>
      </div>
      <div v-else class="panel">
        <h3>{{ t('analysis.reportTab') }}</h3>
        <p class="hint">{{ t('analysis.reportPlaceholder') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-v2-page {
  height: 100vh;
  background: #0b1220;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.v2-menubar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1.2rem;
  background: linear-gradient(135deg, #0f172a, #161B22);
  border-bottom: 1px solid rgba(91,141,184,0.15);
  flex-shrink: 0;
}
.btn-back {
  background: rgba(91,141,184,0.1);
  border: 1px solid rgba(91,141,184,0.2);
  color: #67e8f9;
  border-radius: 0.35rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.82rem;
  cursor: pointer;
}
.title { font-weight: 800; font-size: 1.05rem; color: #e2e8f0; }
.badge {
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(34, 211, 238, 0.3);
}
.tabs-bar {
  display: flex;
  gap: 0.3rem;
  padding: 0.4rem 0.6rem;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.45rem 0.7rem;
  border-radius: 0.4rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 700;
}
.tab-btn.active {
  background: rgba(6,182,212,0.12);
  color: #67e8f9;
}
.tab-content {
  flex: 1;
  overflow: hidden;
  padding: 1rem;
}
.panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.panel h3 { margin: 0; color: #67e8f9; font-size: 1.1rem; }
.hint { color: #64748b; font-size: 0.9rem; }
.drawing-canvas {
  width: 100%;
  height: 260px;
  background: #0f172a;
  border: 1px solid rgba(91,141,184,0.2);
  border-radius: 0.5rem;
}
</style>
