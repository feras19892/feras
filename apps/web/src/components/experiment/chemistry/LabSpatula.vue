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
  <div class="spatula-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 140 30" class="spatula-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="70" cy="26" rx="62" ry="2" fill="rgba(0,0,0,0.06)" />

      <!-- Handle (wood/plastic) -->
      <rect x="65" y="10" width="68" height="8" rx="3" fill="#92400e" />
      <rect x="67" y="11" width="64" height="6" rx="2" fill="#b45309" />
      <!-- Handle highlight -->
      <line x1="70" y1="12" x2="130" y2="12" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-linecap="round" />

      <!-- Metal shaft -->
      <rect x="28" y="11" width="38" height="6" rx="2" fill="#cbd5e1" />
      <rect x="29" y="12" width="36" height="4" rx="1" fill="#e2e8f0" />

      <!-- Shaft highlight -->
      <line x1="30" y1="13" x2="65" y2="13" stroke="rgba(255,255,255,0.5)" stroke-width="1" stroke-linecap="round" />

      <!-- Blade (spoon shaped) -->
      <path
        d="M 4 11 Q 2 11 2 14 Q 2 19 8 19 L 24 19 Q 28 19 28 14 L 28 11 Q 28 8 24 8 L 8 8 Q 4 8 4 11 Z"
        fill="#94a3b8"
        stroke="#64748b"
        stroke-width="0.8"
      />
      <!-- Blade inner -->
      <path
        d="M 5 12 Q 4 12 4 14 Q 4 17 8 17 L 23 17 Q 26 17 26 14 L 26 12 Q 26 10 23 10 L 8 10 Q 5 10 5 12 Z"
        fill="#cbd5e1"
      />
      <!-- Blade highlight -->
      <path
        d="M 6 13 Q 5 13 5 14 Q 5 16 8 16"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        stroke-width="1"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.spatula-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.spatula-svg {
  width: 90px;
  height: 19px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 1px 4px rgba(0,0,0,0.06));
}
.spatula-svg.hovered {
  transform: scale(1.06) rotate(3deg);
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.1));
}
</style>
