<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  volume?: number;     // 0–250 mL
  maxVolume?: number;  // 250
  liquidColor?: string;
  liquidOpacity?: number;
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 250,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.35,
  isHovered: false,
});

const emit = defineEmits<{ click: [] }>();

/* Geometry: perfectly round bottom */
const bulbTop = 70;
const bulbBottom = 210;
const bulbH = bulbBottom - bulbTop;
const neckTop = 18;
const neckW = 16;
const centerX = 60;
const bulbW = 60;

/* Liquid */
const liquidH = computed(() => {
  if (props.volume <= 0) return 0;
  return (props.volume / props.maxVolume) * bulbH;
});
const liquidY = computed(() => bulbBottom - liquidH.value);
</script>

<template>
  <div class="rbf-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 120 220" class="rbf-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="60" cy="215" rx="32" ry="3" fill="rgba(0,0,0,0.06)" />

      <!-- Round bottom bulb -->
      <path
        d="M 32 70 Q 30 105 22 130 Q 18 155 30 180 Q 42 210 60 210 Q 78 210 90 180 Q 102 155 98 130 Q 90 105 88 70"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1.2"
      />

      <!-- Neck -->
      <rect
        :x="centerX - neckW/2"
        :y="neckTop"
        :width="neckW"
        :height="bulbTop - neckTop"
        rx="1"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1.2"
      />

      <!-- Standard taper joint (ground glass) -->
      <rect
        :x="centerX - neckW/2 - 2"
        :y="neckTop + 2"
        :width="neckW + 4"
        :height="8"
        rx="1"
        fill="none"
        stroke="#64748b"
        stroke-width="0.8"
      />

      <!-- Rim -->
      <ellipse :cx="centerX" :cy="neckTop" :rx="neckW/2 + 3" ry="3" fill="none" stroke="#94a3b8" stroke-width="1.2" />

      <!-- LIQUID -->
      <g v-if="volume > 0">
        <path
          :d="`M ${32 + (2 * (bulbBottom - liquidY)/bulbH)} ${liquidY} Q ${22 + (4 * (bulbBottom - liquidY)/bulbH)} ${(liquidY + bulbBottom)/2} ${30 + (6 * (bulbBottom - liquidY)/bulbH)} ${bulbBottom - 5} Q ${42} ${bulbBottom - 2} ${60} ${bulbBottom - 2} Q ${78} ${bulbBottom - 2} ${90 - (6 * (bulbBottom - liquidY)/bulbH)} ${bulbBottom - 5} Q ${98 - (4 * (bulbBottom - liquidY)/bulbH)} ${(liquidY + bulbBottom)/2} ${88 - (2 * (bulbBottom - liquidY)/bulbH)} ${liquidY} Z`"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Meniscus -->
        <ellipse
          :cx="centerX"
          :cy="liquidY"
          :rx="bulbW/2 - 4"
          ry="2.5"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.1"
        />
        <!-- Highlight -->
        <ellipse
          :cx="centerX"
          :cy="liquidY + 0.3"
          :rx="bulbW/2 - 10"
          ry="1"
          fill="rgba(255,255,255,0.4)"
        />
      </g>

      <!-- Glass highlights -->
      <line :x1="centerX - bulbW/2 + 8" :y1="bulbTop + 10" :x2="centerX - bulbW/2 + 14" :y2="bulbBottom - 20" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" />
      <line :x1="centerX - neckW/2 + 3" :y1="neckTop + 5" :x2="centerX - neckW/2 + 3" :y2="bulbTop - 5" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <div v-if="volume > 0" class="rbf-label">{{ volume.toFixed(1) }}mL</div>
  </div>
</template>

<style scoped>
.rbf-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.rbf-svg {
  width: 72px;
  height: 132px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06));
}
.rbf-svg.hovered {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}
.rbf-label {
  position: absolute;
  bottom: -6px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  background: rgba(255,255,255,0.9);
  padding: 1px 6px;
  border-radius: 4px;
  pointer-events: none;
}
</style>
