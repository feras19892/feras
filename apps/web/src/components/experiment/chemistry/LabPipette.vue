<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  volume?: number;     // 0–10 mL drawn
  maxVolume?: number;  // 10
  liquidColor?: string;
  liquidOpacity?: number;
  isHovered?: boolean;
  isActive?: boolean;  // true when in cursor mode
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 10,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.35,
  isHovered: false,
  isActive: false,
});

const emit = defineEmits<{ click: [] }>();

/* Bulb area: y=30 to y=80 (50px tall) */
const bulbTop = 30;
const bulbBottom = 80;
const bulbH = bulbBottom - bulbTop;

const liquidH = computed(() => {
  if (props.volume <= 0) return 0;
  return (props.volume / props.maxVolume) * bulbH;
});
const liquidY = computed(() => bulbBottom - liquidH.value);

const pct = computed(() => Math.round((props.volume / props.maxVolume) * 100));
</script>

<template>
  <div class="pipette-wrapper" :class="{ active: isActive }" @click.stop="emit('click')">
    <svg viewBox="0 0 60 220" class="pipette-svg" :class="{ hovered: isHovered }">
      <!-- Ground shadow -->
      <ellipse cx="30" cy="212" rx="6" ry="1.5" fill="rgba(0,0,0,0.06)" />

      <!-- Tip (narrow) -->
      <path
        d="M 27 180 L 28 210 L 32 210 L 33 180 Z"
        fill="rgba(241,245,249,0.25)"
        stroke="#94a3b8"
        stroke-width="1"
      />

      <!-- Body (thin tube) -->
      <rect x="26" y="80" width="8" height="100" rx="2"
        fill="rgba(241,245,249,0.2)"
        stroke="#94a3b8"
        stroke-width="1"
      />

      <!-- Bulb (wide) -->
      <path
        d="M 22 30 Q 18 55 22 80 L 38 80 Q 42 55 38 30 Q 38 22 30 22 Q 22 22 22 30 Z"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1.2"
      />

      <!-- Top rim -->
      <ellipse cx="30" cy="22" rx="8" ry="2.5" fill="none" stroke="#94a3b8" stroke-width="1" />

      <!-- Graduation marks on body -->
      <g>
        <line x1="30" y1="90" x2="34" y2="90" stroke="#64748b" stroke-width="0.6" opacity="0.5" />
        <line x1="30" y1="100" x2="34" y2="100" stroke="#64748b" stroke-width="0.6" opacity="0.5" />
        <line x1="30" y1="110" x2="34" y2="110" stroke="#64748b" stroke-width="0.6" opacity="0.5" />
        <line x1="30" y1="120" x2="34" y2="120" stroke="#64748b" stroke-width="0.8" opacity="0.7" />
        <text x="36" y="123" font-size="6" fill="#475569" opacity="0.7" text-anchor="start">5</text>
        <line x1="30" y1="130" x2="34" y2="130" stroke="#64748b" stroke-width="0.6" opacity="0.5" />
        <line x1="30" y1="140" x2="34" y2="140" stroke="#64748b" stroke-width="0.6" opacity="0.5" />
        <line x1="30" y1="150" x2="34" y2="150" stroke="#64748b" stroke-width="0.6" opacity="0.5" />
        <line x1="30" y1="160" x2="34" y2="160" stroke="#64748b" stroke-width="0.8" opacity="0.7" />
        <text x="36" y="163" font-size="6" fill="#475569" opacity="0.7" text-anchor="start">10</text>
        <line x1="30" y1="170" x2="34" y2="170" stroke="#64748b" stroke-width="0.6" opacity="0.5" />
      </g>

      <!-- LIQUID inside bulb -->
      <g v-if="volume > 0">
        <path
          :d="`M 23.5 ${liquidY} Q 21 ${(liquidY + bulbBottom)/2} 23.5 ${bulbBottom} L 36.5 ${bulbBottom} Q 39 ${(liquidY + bulbBottom)/2} 36.5 ${liquidY} Q 36.5 ${liquidY - 2} 30 ${liquidY - 3} Q 23.5 ${liquidY - 2} 23.5 ${liquidY} Z`"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Meniscus -->
        <ellipse
          :cx="30"
          :cy="liquidY"
          rx="13"
          ry="3"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.1"
        />
        <!-- Highlight -->
        <ellipse
          :cx="30"
          :cy="liquidY + 0.5"
          rx="8"
          ry="1.5"
          fill="rgba(255,255,255,0.4)"
        />
      </g>

      <!-- Glass highlights -->
      <path d="M 27 85 L 27 170" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M 25 35 Q 22 55 25 75" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-linecap="round" fill="none" />

      <!-- Volume label on bulb -->
      <text
        v-if="volume > 0"
        x="30"
        y="58"
        font-size="9"
        font-weight="800"
        fill="#1e293b"
        text-anchor="middle"
        opacity="0.85"
      >{{ volume.toFixed(1) }}</text>
    </svg>

    <!-- Status badge -->
    <div v-if="volume > 0" class="pipette-badge" :style="{ background: liquidColor }">
      {{ volume.toFixed(1) }}mL
    </div>
    <div v-else class="pipette-badge empty">فارغة</div>
  </div>
</template>

<style scoped>
.pipette-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.pipette-wrapper.active {
  filter: drop-shadow(0 0 12px rgba(16,185,129,0.4));
}
.pipette-svg {
  width: 50px;
  height: 185px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06));
}
.pipette-svg.hovered {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}
.pipette-badge {
  position: absolute;
  bottom: -6px;
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  padding: 1px 6px;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
}
.pipette-badge.empty {
  background: #e2e8f0;
  color: #64748b;
}
</style>
