<script setup lang="ts">
interface Props {
  isHovered?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  isHovered: false,
});
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <div class="filter-funnel-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 80 140" class="filter-funnel-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="40" cy="135" rx="18" ry="2" fill="rgba(0,0,0,0.06)" />

      <!-- Funnel body (cone) -->
      <path d="M 10 20 L 30 80 L 34 120 L 46 120 L 50 80 L 70 20 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="0.8" />
      <!-- Inner shading -->
      <path d="M 14 22 L 32 78 L 35 118 L 45 118 L 48 78 L 66 22 Z" fill="#e2e8f0" />
      <!-- Rim -->
      <ellipse cx="40" cy="20" rx="32" ry="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1" />
      <ellipse cx="40" cy="19" rx="30" ry="4" fill="#e2e8f0" />
      <!-- Rim highlight -->
      <ellipse cx="40" cy="18" rx="28" ry="3" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.6" />

      <!-- Filter paper inside funnel -->
      <ellipse cx="40" cy="21" rx="26" ry="3.5" fill="rgba(255,255,255,0.9)" stroke="#e2e8f0" stroke-width="0.5" />
      <!-- Paper cone edge -->
      <path d="M 18 22 Q 40 55 62 22" fill="none" stroke="rgba(200,200,200,0.4)" stroke-width="0.5" />

      <!-- Stem -->
      <rect x="36" y="120" width="8" height="12" rx="1" fill="#cbd5e1" stroke="#94a3b8" stroke-width="0.6" />
      <rect x="37" y="121" width="6" height="10" rx="0.5" fill="#e2e8f0" />
      <!-- Stem opening -->
      <ellipse cx="40" cy="132" rx="4" ry="1.5" fill="#1e293b" />
    </svg>
  </div>
</template>

<style scoped>
.filter-funnel-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.filter-funnel-svg {
  width: 45px;
  height: 79px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
}
.filter-funnel-svg.hovered {
  transform: scale(1.06);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
}
</style>
