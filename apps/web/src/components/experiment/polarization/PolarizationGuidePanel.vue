<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
defineProps<{ visible: boolean }>()

const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="guide-panel" v-if="visible">
    <div class="guide-header">
      <span class="guide-title">{{ t('experiments.pogTitle') }}</span>
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>
    <div class="guide-body">
      <div class="step"><span class="step-num">1</span><div class="step-text">{{ t('experiments.pogS1') }}</div></div>
      <div class="step"><span class="step-num">2</span><div class="step-text">{{ t('experiments.pogS2') }}</div></div>
      <div class="step"><span class="step-num">3</span><div class="step-text">{{ t('experiments.pogS3') }}</div></div>
      <div class="step"><span class="step-num">4</span><div class="step-text">{{ t('experiments.pogS4') }}</div></div>
      <div class="step"><span class="step-num">5</span><div class="step-text">{{ t('experiments.pogS5') }}</div></div>
      <div class="step"><span class="step-num">6</span><div class="step-text">{{ t('experiments.pogS6') }}</div></div>
      <div class="step"><span class="step-num">7</span><div class="step-text">{{ t('experiments.pogS7') }}</div></div>
      <div class="step"><span class="step-num">8</span><div class="step-text">{{ t('experiments.pogS8') }}</div></div>
      <div class="step"><span class="step-num">9</span><div class="step-text">{{ t('experiments.pogS9') }}</div></div>
      <div class="step"><span class="step-num">10</span><div class="step-text">{{ t('experiments.pogS10') }}</div></div>
      <div class="formula-hint">
        <div class="formula">I = I₀ · cos²θ (Malus's Law)</div>
        <div class="formula-desc">{{ t('experiments.pogF1') }}</div>
        <div class="formula" style="margin-top:.4rem">I₀ = Slope</div>
        <div class="formula-desc">{{ t('experiments.pogF2') }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-panel { background: #161B22; border: 1px solid #2D3645; border-radius: 8px; display: flex; flex-direction: column; max-height: 100%; overflow: hidden; }
.guide-header { display: flex; justify-content: space-between; align-items: center; padding: .6rem .75rem; border-bottom: 1px solid #2D3645; }
.guide-title { font-size: .85rem; font-weight: 700; color: #a78bfa; }
.close-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: .9rem; }
.close-btn:hover { color: #ef4444; }
.guide-body { padding: .6rem .75rem; overflow-y: auto; display: flex; flex-direction: column; gap: .5rem; }
.step { display: flex; gap: .5rem; align-items: flex-start; }
.step-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: rgba(167,139,250,.15); color: #a78bfa; font-size: .7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.step-text { font-size: .75rem; color: #94a3b8; line-height: 1.5; }
.formula-hint { margin-top: .5rem; padding: .6rem; background: rgba(167,139,250,.06); border-radius: 6px; border: 1px solid rgba(167,139,250,.12); }
.formula { font-family: 'Courier New', monospace; font-size: .85rem; color: #a78bfa; text-align: center; }
.formula-desc { font-size: .65rem; color: #64748b; text-align: center; margin-top: .25rem; }
</style>