<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSpillDrops } from '../../../composables/chemistry/useSpillDrops';

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
    const cx = 60, cy = 121, mouthDist = 99; // cy=(neckTop22+bulbBottom220)/2
    return { x: cx + mouthDist * Math.sin(rad), y: cy - mouthDist * Math.cos(rad) };
  },
  canvasW: 120,
  canvasH: 260,
  mouthBounds: { minX: 10, maxX: 110, minY: 10, maxY: 240 },
  exitY: 200,
  onSpill: (amount) => emit('spill', amount),
  onDropExited: (wx, wy, color) => emit('dropExited', wx, wy, color),
});

/* Geometry: pear-shaped with long narrow neck */
const bulbTop = 85;
const bulbBottom = 220;
const bulbH = bulbBottom - bulbTop;
const neckTop = 22;
const neckW = 14;
const centerX = 60;
const bulbW = 56;

/* Liquid fills only the bulb (not the neck) */
const liquidH = computed(() => {
  if (props.volume <= 0) return 0;
  return (props.volume / props.maxVolume) * bulbH;
});
const liquidY = computed(() => bulbBottom - liquidH.value);

/* Single calibration mark on neck */
const markY = bulbTop;
</script>

<template>
  <div class="flask-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 120 240" class="flask-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="60" cy="235" rx="30" ry="3" fill="rgba(0,0,0,0.06)" />

      <!-- Bulb (pear shape) -->
      <path
        d="M 34 85 Q 28 140 18 170 Q 14 195 28 215 Q 44 230 60 230 Q 76 230 92 215 Q 106 195 102 170 Q 92 140 86 85"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1.2"
      />

      <!-- Neck (narrow cylinder) -->
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

      <!-- Rim -->
      <ellipse :cx="centerX" :cy="neckTop" :rx="neckW/2 + 3" ry="3" fill="none" stroke="#94a3b8" stroke-width="1.2" />
      <ellipse :cx="centerX" :cy="neckTop" :rx="neckW/2" ry="2" fill="none" stroke="rgba(148,163,184,0.3)" stroke-width="0.5" />

      <!-- Calibration mark (single ring on neck) -->
      <line
        :x1="centerX - neckW/2 - 4"
        :y1="markY"
        :x2="centerX + neckW/2 + 4"
        :y2="markY"
        stroke="#334155"
        stroke-width="1.5"
        opacity="0.9"
      />
      <text
        :x="centerX + neckW/2 + 8"
        :y="markY + 2.5"
        font-size="7"
        fill="#334155"
        font-weight="800"
        opacity="0.85"
      >{{ maxVolume }}</text>

      <!-- LIQUID (bulb only) -->
      <g v-if="volume > 0">
        <path
          :d="`M ${34 + (1.5 * (bulbBottom - liquidY)/bulbH)} ${liquidY} Q ${28 + (2 * (bulbBottom - liquidY)/bulbH)} ${(liquidY + bulbBottom)/2} ${28 + (4 * (bulbBottom - liquidY)/bulbH)} ${bulbBottom - 5} Q ${44} ${bulbBottom - 2} ${60} ${bulbBottom - 2} Q ${76} ${bulbBottom - 2} ${92 - (4 * (bulbBottom - liquidY)/bulbH)} ${bulbBottom - 5} Q ${92 - (2 * (bulbBottom - liquidY)/bulbH)} ${(liquidY + bulbBottom)/2} ${86 - (1.5 * (bulbBottom - liquidY)/bulbH)} ${liquidY} Z`"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Meniscus at bulb top -->
        <ellipse
          :cx="centerX"
          :cy="liquidY"
          :rx="bulbW/2 - 2"
          ry="2.5"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.1"
        />
        <!-- Highlight -->
        <ellipse
          :cx="centerX"
          :cy="liquidY + 0.3"
          :rx="bulbW/2 - 8"
          ry="1"
          fill="rgba(255,255,255,0.4)"
        />
      </g>

      <!-- Glass highlights -->
      <line :x1="centerX - bulbW/2 + 6" :y1="bulbTop + 10" :x2="centerX - bulbW/2 + 12" :y2="bulbBottom - 15" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" />
      <line :x1="centerX + bulbW/2 - 8" :y1="bulbTop + 15" :x2="centerX + bulbW/2 - 5" :y2="bulbBottom - 20" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-linecap="round" />
      <line :x1="centerX - neckW/2 + 3" :y1="neckTop + 5" :x2="centerX - neckW/2 + 3" :y2="bulbTop - 5" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- Drop canvas -->
    <canvas
      v-if="volume > 0"
      ref="canvasRef"
      width="120"
      height="260"
      class="drop-canvas"
      :style="{ transform: `rotate(${-tiltAngle}deg)`, transformOrigin: '60px 120px' }"
    />
  </div>
</template>

<style scoped>
.flask-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.flask-svg {
  width: 72px;
  height: 144px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06));
}
.flask-svg.hovered {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
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
