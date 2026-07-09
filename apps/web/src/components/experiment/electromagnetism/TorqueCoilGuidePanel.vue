<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()
defineProps<{
  visible: boolean
}>()
const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div class="guide-panel" v-if="visible">
    <div class="guide-header">
      <span class="guide-title">{{ t('experiments.emGuideTitle') }}</span>
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>
    <div class="guide-body">
      <div class="step">
        <span class="step-num">1</span>
        <div class="step-text">
          {{ t('experiments.tcGuideS1') }}
        </div>
      </div>

      <div class="step">
        <span class="step-num">2</span>
        <div class="step-text">
          {{ t('experiments.tcGuideS2') }}
        </div>
      </div>

      <div class="step">
        <span class="step-num">3</span>
        <div class="step-text">
          {{ t('experiments.tcGuideS3') }}
        </div>
      </div>

      <div class="step">
        <span class="step-num">4</span>
        <div class="step-text">
          {{ t('experiments.tcGuideS4') }}
        </div>
      </div>

      <div class="step">
        <span class="step-num">5</span>
        <div class="step-text">
          {{ t('experiments.tcGuideS5') }}
        </div>
      </div>

      <div class="step">
        <span class="step-num">6</span>
        <div class="step-text">
          {{ t('experiments.tcGuideS6') }}
        </div>
      </div>

      <div class="step">
        <span class="step-num">7</span>
        <div class="step-text">
          {{ t('experiments.tcGuideS7') }}
        </div>
      </div>

      <div class="step">
        <span class="step-num">8</span>
        <div class="step-text">
          {{ t('experiments.tcGuideS8') }}
        </div>
      </div>

      <div class="step">
        <span class="step-num">9</span>
        <div class="step-text">
          {{ t('experiments.tcGuideS9') }}
        </div>
      </div>

      <div class="step">
        <span class="step-num">10</span>
        <div class="step-text">
          {{ t('experiments.tcGuideS10') }}
        </div>
      </div>

      <div class="formula-hint">
        <div class="formula">μ = NIA</div>
        <div class="formula-desc">{{ t('experiments.tcGuideNoteMu') }}</div>
        <div class="formula" style="margin-top:.4rem">τ = μB sin(θ) = NIAB sin(θ)</div>
        <div class="formula-desc">{{ t('experiments.tcGuideNoteTau') }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-panel { background: #161B22; border: 1px solid #2D3645; border-radius: 8px; display: flex; flex-direction: column; max-height: 100%; overflow: hidden; }
.guide-header { display: flex; justify-content: space-between; align-items: center; padding: .6rem .75rem; border-bottom: 1px solid #2D3645; }
.guide-title { font-size: .85rem; font-weight: 700; color: #67e8f9; }
.close-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: .9rem; }
.close-btn:hover { color: #ef4444; }
.guide-body { padding: .6rem .75rem; overflow-y: auto; display: flex; flex-direction: column; gap: .5rem; }
.step { display: flex; gap: .5rem; align-items: flex-start; }
.step-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: rgba(103,232,249,.15); color: #67e8f9; font-size: .7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.step-text { font-size: .75rem; color: #94a3b8; line-height: 1.5; }
.step-text strong { color: #D1D7E0; }
.badge { background: rgba(34,197,94,.15); color: #22c55e; padding: .1rem .4rem; border-radius: 4px; font-size: .7rem; }
.badge.green { background: rgba(34,197,94,.15); color: #22c55e; }
.key { background: rgba(245,158,11,.12); color: #f59e0b; padding: .05rem .3rem; border-radius: 3px; font-size: .7rem; font-family: monospace; }
.formula-hint { margin-top: .5rem; padding: .6rem; background: rgba(103,232,249,.06); border-radius: 6px; border: 1px solid rgba(103,232,249,.12); }
.formula { font-family: 'Courier New', monospace; font-size: .85rem; color: #67e8f9; text-align: center; }
.formula-desc { font-size: .65rem; color: #64748b; text-align: center; margin-top: .25rem; }
</style>
