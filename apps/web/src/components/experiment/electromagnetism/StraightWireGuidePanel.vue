<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
defineProps<{

  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Transition name="guide-fade">
    <div v-if="visible" class="guide-panel">
      <div class="guide-header">
        <span class="guide-title">{{ t('experiments.emGuideTitle') }}</span>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="guide-body">
        <div class="step">
          <span class="step-num">1</span>
          <div class="step-text">
            {{ t('experiments.swGuideS1') }}
          </div>
        </div>

        <div class="step">
          <span class="step-num">2</span>
          <div class="step-text">
            {{ t('experiments.swGuideS2') }}
          </div>
        </div>

        <div class="step">
          <span class="step-num">3</span>
          <div class="step-text">
            {{ t('experiments.swGuideS3') }}
          </div>
        </div>

        <div class="step">
          <span class="step-num">4</span>
          <div class="step-text">
            {{ t('experiments.swGuideS4') }}
          </div>
        </div>

        <div class="step">
          <span class="step-num">5</span>
          <div class="step-text">
            {{ t('experiments.swGuideS5') }}
          </div>
        </div>

        <div class="step">
          <span class="step-num">6</span>
          <div class="step-text">
            {{ t('experiments.swGuideS6') }}
          </div>
        </div>

        <div class="step">
          <span class="step-num">7</span>
          <div class="step-text">
            {{ t('experiments.swGuideS7') }}
          </div>
        </div>

        <div class="step">
          <span class="step-num">8</span>
          <div class="step-text">
            {{ t('experiments.swGuideS8') }}
          </div>
        </div>

        <div class="step">
          <span class="step-num">9</span>
          <div class="step-text">
            {{ t('experiments.swGuideS9') }}
          </div>
        </div>

        <div class="formula-note">
          <div class="formula">B = μ₀I / (2πr)</div>
          <div class="note">{{ t('experiments.swGuideNote') }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.guide-panel { background: rgba(30,37,48,.8); backdrop-filter: blur(12px); border: 1px solid rgba(34,197,94,.15); border-radius: 10px; display: flex; flex-direction: column; max-height: 100%; overflow: hidden; }
.guide-header { display: flex; justify-content: space-between; align-items: center; padding: .5rem .75rem; border-bottom: 1px solid rgba(34,197,94,.1); flex-shrink: 0; }
.guide-title { font-size: .85rem; font-weight: 700; color: #22c55e; }
.close-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: .8rem; }
.close-btn:hover { color: #ef4444; }
.guide-body { padding: .6rem .75rem; overflow-y: auto; display: flex; flex-direction: column; gap: .5rem; }
.step { display: flex; gap: .5rem; align-items: flex-start; }
.step-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: rgba(34,197,94,.15); color: #22c55e; font-size: .75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.step-text { font-size: .75rem; color: #B8C0CC; line-height: 1.5; }
.step-text strong { color: #D1D7E0; }
.badge { display: inline-block; padding: .1rem .4rem; background: rgba(245,158,11,.12); border: 1px solid rgba(245,158,11,.2); border-radius: 4px; font-size: .7rem; color: #f59e0b; }
.badge.green { background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.2); color: #22c55e; }
.key { display: inline-block; padding: .05rem .3rem; background: #2D3645; border: 1px solid #3D4655; border-radius: 3px; font-size: .7rem; font-family: monospace; color: #94a3b8; }
.formula-note { margin-top: .3rem; padding: .5rem; background: rgba(245,158,11,.06); border-radius: 6px; border: 1px solid rgba(245,158,11,.1); }
.formula { font-family: 'Courier New', monospace; font-size: .85rem; color: #f59e0b; text-align: center; }
.note { font-size: .68rem; color: #64748b; text-align: center; margin-top: .25rem; }
.guide-fade-enter-active, .guide-fade-leave-active { transition: all .2s ease; }
.guide-fade-enter-from, .guide-fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>