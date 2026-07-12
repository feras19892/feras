<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSpillDrops } from '../../../composables/chemistry/useSpillDrops';
import ReactionEffects from './ReactionEffects.vue';

interface Props {
  volume?: number;     // 0–250 mL
  maxVolume?: number;  // 250
  liquidColor?: string;
  liquidOpacity?: number;
  isHovered?: boolean;
  tiltAngle?: number;
  itemUid?: string;
  itemX?: number;
  itemY?: number;
  gasEvolution?: boolean;
  gasType?: string;
  precipitate?: boolean;
  precipitateColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 250,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.35,
  isHovered: false,
  tiltAngle: 0,
  itemX: 0,
  itemY: 0,
  itemUid: '',
  gasEvolution: false,
  gasType: '',
  precipitate: false,
  precipitateColor: '#c0c0c0',
});

const emit = defineEmits<{ click: []; spill: [amount: number]; dropExited: [worldX: number, worldY: number, color: string]; }>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

useSpillDrops({
  canvasRef,
  tiltAngle: () => props.tiltAngle,
  volume: () => props.volume,
  maxVolume: () => props.maxVolume,
  liquidColor: () => props.liquidColor,
  itemX: () => props.itemX,
  itemY: () => props.itemY,
  mouthPosition: (tilt) => {
    const rad = tilt * Math.PI / 180;
    const cx = 60, cy = 114, mouthDist = 96; // cy=(neckTop18+bulbBottom210)/2
    return { x: cx + mouthDist * Math.sin(rad), y: cy - mouthDist * Math.cos(rad) };
  },
  canvasW: 120,
  canvasH: 260,
  mouthBounds: { minX: 10, maxX: 110, minY: 10, maxY: 240 },
  exitY: 200,
  onSpill: (amount) => emit('spill', amount),
  onDropExited: (wx, wy, color) => emit('dropExited', wx, wy, color),
});

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

/* Scale marks */
interface Mark { y: number; label: string }
const marks = computed<Mark[]>(() => [
  { y: bulbBottom - bulbH * 0.25, label: '62' },
  { y: bulbBottom - bulbH * 0.5, label: '125' },
  { y: bulbBottom - bulbH * 0.75, label: '188' },
  { y: bulbBottom - bulbH, label: '250' },
]);
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

      <!-- Scale marks (etched on body) -->
      <g v-for="mark in marks" :key="mark.label">
        <line
          :x1="centerX - bulbW/2 + 4"
          :y1="mark.y"
          :x2="centerX + bulbW/2 - 4"
          :y2="mark.y"
          stroke="#64748b"
          stroke-width="0.8"
          opacity="0.5"
          stroke-linecap="round"
        />
        <text
          :x="centerX + bulbW/2 + 2"
          :y="mark.y + 2.5"
          font-size="6"
          fill="#334155"
          font-weight="700"
          opacity="0.75"
        >{{ mark.label }}</text>
      </g>

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
        <!-- Surface level indicator (visible even for transparent liquids) -->
        <line
          :x1="centerX - bulbW/2 + 8"
          :y1="liquidY"
          :x2="centerX + bulbW/2 - 8"
          :y2="liquidY"
          stroke="#ef4444"
          stroke-width="1.2"
          opacity="0.7"
          stroke-linecap="round"
        />
        <circle :cx="centerX" :cy="liquidY" r="2.5" fill="#ef4444" opacity="0.35" />
        <!-- Reaction effects: gas bubbles & precipitate -->
        <ReactionEffects
          :gas-evolution="gasEvolution"
          :gas-type="gasType"
          :precipitate="precipitate"
          :precipitate-color="precipitateColor"
          :center-x="centerX"
          :liquid-y="liquidY"
          :width="bulbW - 10"
        />
      </g>

      <!-- Glass highlights -->
      <line :x1="centerX - bulbW/2 + 8" :y1="bulbTop + 10" :x2="centerX - bulbW/2 + 14" :y2="bulbBottom - 20" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" />
      <line :x1="centerX - neckW/2 + 3" :y1="neckTop + 5" :x2="centerX - neckW/2 + 3" :y2="bulbTop - 5" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <canvas
      v-if="volume > 0"
      ref="canvasRef"
      width="120"
      height="260"
      class="drop-canvas"
      :style="{ transform: `rotate(${-tiltAngle}deg)`, transformOrigin: '60px 115px' }"
    />
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
}
.rbf-svg.hovered {
  transform: scale(1.05);
}
.drop-canvas {
  position: absolute;
  top: 0;
  left: 50%;
  width: 120px;
  height: 260px;
  margin-left: -60px;
  z-index: 2;
  pointer-events: none;
}
</style>
