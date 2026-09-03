<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
const props = defineProps<{ mode: 'pendulum' | 'projectile' | 'coupled' }>()

const emit = defineEmits<{ (e: 'change', val: 'pendulum' | 'projectile' | 'coupled'): void }>()
const modes: { key: 'pendulum' | 'projectile' | 'coupled'; label: string; icon: string }[] = [
  { key: 'pendulum', label: t('experiments.pendulumMode'), icon: '🕰️' },
  { key: 'projectile', label: t('experiments.projectileMode'), icon: '🎯' },
  { key: 'coupled', label: t('experiments.coupledMode'), icon: '🔗' },
]
</script>

<template>
  <div class="mode-switcher">
    <button v-for="m in modes" :key="m.key" class="mode-btn" :class="{ active: props.mode === m.key }" @click="emit('change', m.key)">
      <span class="mode-icon">{{ m.icon }}</span><span class="mode-label">{{ m.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.mode-switcher { display:flex; gap:.2rem; background:#0f172a; border:1px solid #334155; border-radius:8px; padding:.2rem; }
.mode-btn { display:flex; align-items:center; gap:.2rem; padding:.35rem .55rem; border-radius:6px; border:none; background:transparent; color:#94a3b8; font-size:.72rem; font-weight:700; cursor:pointer; transition:all .15s; }
.mode-btn:hover { background:rgba(96,165,250,.1); color:#e2e8f0; }
.mode-btn.active { background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; box-shadow:0 2px 6px rgba(59,130,246,.3); }
.mode-icon { font-size:.85rem; }
.mode-label { font-size:.68rem; }
</style>