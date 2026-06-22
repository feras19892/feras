<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="backdrop" @click="emit('close')">
      <div class="modal" @click.stop>
        <div class="header">
          <h3>❓ {{ t('experiments.collisionGuide') }}</h3>
          <button class="close" @click="emit('close')">×</button>
        </div>
        <div class="body">
          <p><strong>{{ t('experiments.speed') }}:</strong> {{ t('experiments.speedDesc') }}</p>
          <p><strong>{{ t('experiments.restitutionCoefficient') }} (e):</strong> {{ t('experiments.restitutionDesc') }}</p>
          <p><strong>{{ t('experiments.shortcuts') }}:</strong> {{ t('experiments.shortcutsDesc') }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 180; display: flex; align-items: center; justify-content: center; }
.modal { background: #161B22; border: 1px solid #2D3645; border-radius: 10px; width: 90%; max-width: 480px; max-height: 80vh; overflow: auto; }
.header { display: flex; justify-content: space-between; align-items: center; padding: .6rem .8rem; border-bottom: 1px solid #2D3645; }
.header h3 { margin: 0; font-size: .85rem; color: #D1D7E0; }
.close { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; }
.body { padding: .8rem; font-size: .75rem; color: #B8C0CC; line-height: 1.7; }
</style>
