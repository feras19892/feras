<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click="emit('close')">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>🚀 {{ t('experiments.projectileGuide') }}</h3>
          <button @click="emit('close')">×</button>
        </div>
        <div class="modal-body">
          <h4>{{ t('experiments.goal') }}</h4>
          <p>{{ t('experiments.projectileGoalDesc') }}</p>
          <h4>{{ t('experiments.equationsLabel') }}</h4>
          <ul>
            <li><b>{{ t('experiments.rangeLabel') }}:</b> R = v₀² sin(2θ) / g</li>
            <li><b>{{ t('experiments.maxHeight') }}:</b> H = (v₀ sinθ)² / 2g</li>
            <li><b>{{ t('experiments.flightTimeEquation') }}</b> t = 2v₀ sinθ / g</li>
          </ul>
          <h4>{{ t('experiments.scenario1') }}</h4>
          <ol>
            <li>{{ t('experiments.scenario1Step1') }}</li>
            <li>{{ t('experiments.scenario1Step2') }}</li>
            <li>{{ t('experiments.scenario1Step3') }}</li>
            <li>{{ t('experiments.scenario1Step4') }}</li>
          </ol>
          <h4>{{ t('experiments.scenario2') }}</h4>
          <ol>
            <li>{{ t('experiments.scenario2Step1') }}</li>
            <li>{{ t('experiments.scenario2Step2') }}</li>
            <li>{{ t('experiments.scenario2Step3') }}</li>
          </ol>
          <h4>{{ t('experiments.shortcuts') }}</h4>
          <p>{{ t('experiments.projectileShortcutsDesc') }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal { background: #1A1F27; border: 1px solid #2D3645; border-radius: 12px; width: 90%; max-width: 560px; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: .6rem .8rem; border-bottom: 1px solid #2D3645; }
.modal-header h3 { margin: 0; font-size: .9rem; color: #5B8DB8; }
.modal-header button { background: none; border: none; color: #8B95A5; font-size: 1.3rem; cursor: pointer; }
.modal-body { padding: .8rem; font-size: .78rem; color: #D1D7E0; line-height: 1.6; }
.modal-body h4 { margin: .6rem 0 .2rem; font-size: .8rem; color: #5B8DB8; }
.modal-body p { margin: .2rem 0; }
.modal-body ul, .modal-body ol { margin: .2rem 0; padding-right: 1.2rem; }
</style>
