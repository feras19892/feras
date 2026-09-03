<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, onErrorCaptured } from 'vue';

const error = ref<Error | null>(null);

onErrorCaptured((err) => {
  error.value = err instanceof Error ? err : new Error(String(err));
  if (import.meta.env.DEV) console.error('[ErrorBoundary]', err);
  return false;
});

function retry() {
  error.value = null;
}
</script>

<template>
  <div v-if="error" class="error-boundary">
    <div class="error-icon">⚠️</div>
    <div class="error-title">{{ t('shared.errorOccurred') }}</div>
    <div class="error-desc">{{ error.message }}</div>
    <button class="btn-retry" @click="retry">{{ t('shared.retry') }}</button>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  text-align: center;
}
.error-icon { font-size: 2.5rem; margin-bottom: 0.6rem; }
.error-title { font-size: 0.95rem; font-weight: 700; color: #fca5a5; }
.error-desc { font-size: 0.8rem; color: #94a3b8; margin-top: 0.3rem; max-width: 320px; word-break: break-word; }
.btn-retry {
  margin-top: 1rem;
  padding: 0.4rem 1rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(99,102,241,0.3);
  background: rgba(99,102,241,0.1);
  color: #a5b4fc;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.btn-retry:hover { background: rgba(99,102,241,0.2); }
</style>
