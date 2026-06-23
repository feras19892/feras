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
  <div class="stopper-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 60 80" class="stopper-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="30" cy="76" rx="16" ry="2" fill="rgba(0,0,0,0.06)" />

      <!-- Top handle (knob) -->
      <ellipse cx="30" cy="10" rx="12" ry="6" fill="#0f172a" />
      <ellipse cx="30" cy="9" rx="10" ry="4.5" fill="#1e293b" />

      <!-- Upper cone (tapering into tube) -->
      <path d="M 18 14 Q 16 28 14 38 Q 12 52 14 58 Q 16 64 30 64 Q 44 64 46 58 Q 48 52 46 38 Q 44 28 42 14 Z" fill="#1e293b" />
      <path d="M 20 16 Q 18 28 16 38 Q 14 50 16 56 Q 18 60 30 60 Q 42 60 44 56 Q 46 50 44 38 Q 42 28 40 16 Z" fill="#334155" />

      <!-- Ribs (grip rings) -->
      <ellipse cx="30" cy="24" rx="20" ry="2.5" fill="none" stroke="#0f172a" stroke-width="1.5" />
      <ellipse cx="30" cy="24" rx="18" ry="1.8" fill="none" stroke="#475569" stroke-width="0.8" />
      <ellipse cx="30" cy="34" rx="19" ry="2.2" fill="none" stroke="#0f172a" stroke-width="1.5" />
      <ellipse cx="30" cy="34" rx="17" ry="1.6" fill="none" stroke="#475569" stroke-width="0.8" />
      <ellipse cx="30" cy="44" rx="18" ry="2" fill="none" stroke="#0f172a" stroke-width="1.5" />
      <ellipse cx="30" cy="44" rx="16" ry="1.4" fill="none" stroke="#475569" stroke-width="0.8" />

      <!-- Bottom tip -->
      <ellipse cx="30" cy="62" rx="14" ry="3" fill="#0f172a" />

      <!-- Highlight on knob -->
      <ellipse cx="27" cy="8" rx="4" ry="2" fill="rgba(255,255,255,0.1)" />
    </svg>
  </div>
</template>

<style scoped>
.stopper-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.stopper-svg {
  width: 30px;
  height: 40px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 1px 4px rgba(0,0,0,0.06));
}
.stopper-svg.hovered {
  transform: scale(1.1);
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.1));
}
</style>
