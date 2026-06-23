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
  <div class="watch-glass-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 100 40" class="watch-glass-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="50" cy="36" rx="42" ry="3" fill="rgba(0,0,0,0.06)" />
      <!-- Glass dish outer -->
      <ellipse cx="50" cy="20" rx="44" ry="14" fill="rgba(200,220,240,0.25)" stroke="#94a3b8" stroke-width="1" />
      <!-- Inner concave surface -->
      <ellipse cx="50" cy="21" rx="38" ry="11" fill="rgba(220,235,250,0.35)" />
      <!-- Highlight rim -->
      <ellipse cx="50" cy="18" rx="40" ry="10" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.8" />
      <!-- Center depression highlight -->
      <ellipse cx="50" cy="23" rx="20" ry="6" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.5" />
    </svg>
  </div>
</template>

<style scoped>
.watch-glass-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.watch-glass-svg {
  width: 80px;
  height: 32px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 1px 4px rgba(0,0,0,0.06));
}
.watch-glass-svg.hovered {
  transform: scale(1.06);
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.1));
}
</style>
