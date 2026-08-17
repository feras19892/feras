<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'enterAsTeacher'): void
  (e: 'enterAsStudent'): void
}>()
</script>

<template>
  <div class="guest-btn-row">
    <button type="button" class="btn-guest teacher" @click="emit('enterAsTeacher')">
      {{ t('auth.guestTeacher') }}
    </button>
    <button data-testid="guest-login" type="button" class="btn-guest student" @click="emit('enterAsStudent')">
      {{ t('auth.guestStudent') }}
    </button>
  </div>
  <p class="guest-hint">{{ t('auth.guestLimitations', 'وضع تجريبي: يمكنك تصفح التجارب ولكن لا يمكن حفظ التقارير أو التدرجات') }}</p>
</template>

<style scoped>
.guest-btn-row {
  display: flex;
  gap: 0.6rem;
  width: 100%;
}
.btn-guest {
  flex: 1;
  padding: 0.7rem 0.5rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
}
.btn-guest:hover {
  background: rgba(255,255,255,0.06);
  color: #e2e8f0;
  transform: translateY(-1px);
}
.btn-guest.teacher:hover {
  border-color: rgba(59,130,246,0.35);
  background: rgba(59,130,246,0.08);
  color: #93c5fd;
}
.btn-guest.student:hover {
  border-color: rgba(16,185,129,0.35);
  background: rgba(16,185,129,0.08);
  color: #86efac;
}
.guest-hint {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: #64748b;
  text-align: center;
}
</style>
