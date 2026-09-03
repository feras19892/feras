<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
const props = defineProps<{

  tutorType: 'info' | 'warn' | 'success'
  tutorMessage: string
  measuredT?: number | null
  measuredF?: number | null
  measuredOmega?: number | null
}>()
</script>

<template>
  <div class="tutor-card" :class="props.tutorType">
    <div class="tutor-accent" />
    <div class="tutor-top"><div class="tutor-status-dot" /><span class="tutor-badge">{{ t('experiments.liveAnalysis') }}</span></div>
    <div class="tutor-body">
      <p class="tutor-message">{{ props.tutorMessage }}</p>
      <div class="tutor-metrics">
        <div class="tutor-metric"><span class="tutor-metric-label">T</span><span class="tutor-metric-value">{{ measuredT?.toFixed(4)??'--' }} s</span></div>
        <div class="tutor-metric"><span class="tutor-metric-label">f</span><span class="tutor-metric-value">{{ measuredF?.toFixed(3)??'--' }} Hz</span></div>
        <div class="tutor-metric"><span class="tutor-metric-label">ω</span><span class="tutor-metric-value">{{ measuredOmega?.toFixed(3)??'--' }} rad/s</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tutor-card { position:relative; padding:0; overflow:hidden; background:rgba(22,27,34,.65); backdrop-filter:blur(12px); border:1px solid rgba(139,148,158,.12); border-radius:8px; }
.tutor-card.info .tutor-accent { background:linear-gradient(180deg,rgba(91,141,184,.35),transparent); }
.tutor-card.success .tutor-accent { background:linear-gradient(180deg,rgba(122,158,126,.35),transparent); }
.tutor-card.warn .tutor-accent { background:linear-gradient(180deg,rgba(196,162,101,.35),transparent); }
.tutor-accent { position:absolute; top:0; left:0; right:0; height:3px; border-radius:8px 8px 0 0; }
.tutor-top { display:flex; justify-content:space-between; align-items:center; padding:.4rem .6rem 0; }
.tutor-status-dot { width:7px; height:7px; border-radius:50%; background:#5B8DB8; box-shadow:0 0 6px rgba(91,141,184,.6); animation:dotPulse 2s ease-in-out infinite; }
.tutor-badge { font-size:.6rem; font-weight:800; color:#8B95A5; background:rgba(139,148,158,.1); padding:2px 6px; border-radius:4px; border:1px solid rgba(139,148,158,.15); }
.tutor-body { padding:.3rem .6rem .5rem; }
.tutor-message { font-size:.78rem; line-height:1.6; color:#D1D7E0; font-weight:600; margin:0; }
.tutor-metrics { display:grid; grid-template-columns:1fr 1fr 1fr; gap:.3rem; margin-top:.4rem; }
.tutor-metric { display:flex; flex-direction:column; align-items:center; gap:.05rem; background:rgba(37,45,58,.5); border-radius:6px; padding:.25rem .15rem; border:1px solid rgba(139,148,158,.08); }
.tutor-metric-label { font-size:.55rem; color:#8B95A5; font-weight:700; }
.tutor-metric-value { font-size:.75rem; font-weight:800; color:#D1D7E0; font-family:monospace; }
@keyframes dotPulse { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
</style>