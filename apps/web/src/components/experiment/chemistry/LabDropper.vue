<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
interface Props {
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isHovered: false,
});

const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <div class="dropper-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 50 160" class="dropper-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="25" cy="155" rx="10" ry="2" fill="rgba(0,0,0,0.06)" />

      <!-- Rubber bulb -->
      <ellipse cx="25" cy="20" rx="14" ry="16" fill="#ef4444" opacity="0.8" />
      <ellipse cx="25" cy="17" rx="10" ry="10" fill="#f87171" opacity="0.5" />

      <!-- Bulb highlight -->
      <ellipse cx="21" cy="14" rx="5" ry="6" fill="rgba(255,255,255,0.25)" />

      <!-- Connector -->
      <rect x="20" y="32" width="10" height="6" rx="1" fill="#cbd5e1" />

      <!-- Glass tube -->
      <rect x="21" y="36" width="8" height="100" rx="2" fill="rgba(241,245,249,0.3)" stroke="#94a3b8" stroke-width="0.8" />
      <rect x="22" y="37" width="6" height="98" rx="1" fill="rgba(255,255,255,0.2)" />

      <!-- Tube highlight -->
      <line x1="23" y1="38" x2="23" y2="134" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round" />

      <!-- Tip -->
      <path d="M 22 136 L 23 148 L 27 148 L 28 136 Z" fill="rgba(241,245,249,0.4)" stroke="#94a3b8" stroke-width="0.6" />

      <!-- Tip highlight -->
      <line x1="24" y1="138" x2="25" y2="146" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />
    </svg>
  </div>
</template>

<style scoped>
.dropper-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.dropper-svg {
  width: 30px;
  height: 96px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06));
}
.dropper-svg.hovered {
  transform: scale(1.08);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}
</style>