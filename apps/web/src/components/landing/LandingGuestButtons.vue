<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'enterAsTeacher'): void
  (e: 'enterAsStudent'): void
}>()
</script>

<template>
  <div class="guest-row">
    <span>{{ t('auth.or') }}</span>
  </div>
  <div class="guest-btn-row">
    <button type="button" class="btn-guest teacher" @click="emit('enterAsTeacher')">
      {{ t('auth.guestTeacher') }}
    </button>
    <button data-testid="guest-login" type="button" class="btn-guest student" @click="emit('enterAsStudent')">
      {{ t('auth.guestStudent') }}
    </button>
  </div>
</template>

<style scoped>
.guest-row {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #64748b;
}
.guest-row span { margin: 0 0.4rem; }

.guest-btn-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
}
.btn-guest {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 0.5rem;
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.btn-guest:hover {
  background: rgba(255,255,255,0.08);
  color: #e2e8f0;
}
.btn-guest.teacher:hover {
  border-color: rgba(59,130,246,0.4);
  background: rgba(59,130,246,0.1);
  color: #93c5fd;
}
.btn-guest.student:hover {
  border-color: rgba(16,185,129,0.4);
  background: rgba(16,185,129,0.1);
  color: #86efac;
}
</style>
