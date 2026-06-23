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
  <div class="rod-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 160 20" class="rod-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="80" cy="16" rx="72" ry="2" fill="rgba(0,0,0,0.06)" />

      <!-- Rod body (glass) -->
      <rect x="4" y="6" width="152" height="6" rx="3" fill="rgba(241,245,249,0.4)" stroke="#94a3b8" stroke-width="0.8" />
      <!-- Rod inner -->
      <rect x="5" y="7" width="150" height="4" rx="2" fill="rgba(255,255,255,0.3)" />

      <!-- Highlights -->
      <line x1="8" y1="8" x2="152" y2="8" stroke="rgba(255,255,255,0.5)" stroke-width="1" stroke-linecap="round" />
      <line x1="12" y1="9" x2="148" y2="9" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" stroke-linecap="round" />
    </svg>
  </div>
</template>

<style scoped>
.rod-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.rod-svg {
  width: 100px;
  height: 13px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.06));
}
.rod-svg.hovered {
  transform: scale(1.1) rotate(-5deg);
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.1));
}
</style>
