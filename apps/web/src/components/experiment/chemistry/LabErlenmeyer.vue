<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSpillDrops } from '../../../composables/chemistry/useSpillDrops';

interface Props {
  volume?: number;     // 0–300 mL
  maxVolume?: number;  // 300
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
  maxVolume: 300,
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
    const cx = 70, cy = 119, mouthDist = 91; // cy=(neckTop28+bodyBottom210)/2
    return { x: cx + mouthDist * Math.sin(rad), y: cy - mouthDist * Math.cos(rad) };
  },
  canvasW: 140,
  canvasH: 260,
  mouthBounds: { minX: 10, maxX: 130, minY: 10, maxY: 240 },
  exitY: 200,
  onSpill: (amount) => emit('spill', amount),
  onDropExited: (wx, wy, color) => emit('dropExited', wx, wy, color),
});

/* Flask geometry */
const neckTop = 28;
const neckW = 18;
const neckH = 55; // neck area
const shoulderY = neckTop + neckH; // 83
const bodyBottom = 210;
const bodyW = 100;
const centerX = 70;

/* Liquid fills from bottom of body up into neck */
const totalH = bodyBottom - shoulderY; // 127

const liquidH = computed(() => {
  if (props.volume <= 0) return 0;
  const pct = Math.min(props.volume / props.maxVolume, 1);
  // Non-linear: neck fills last
  let h: number;
  if (pct <= 0.85) {
    h = (pct / 0.85) * totalH; // fill body first
  } else {
    h = totalH + (pct - 0.85) / 0.15 * neckH;
  }
  return h;
});

const liquidY = computed(() => bodyBottom - Math.min(liquidH.value, totalH));
const liquidNeckH = computed(() => Math.max(0, liquidH.value - totalH));

/* Marks */
interface Mark { y: number; label: string }
const marks = computed<Mark[]>(() => [
  { y: bodyBottom - totalH * 0.25, label: '75' },
  { y: bodyBottom - totalH * 0.5, label: '150' },
  { y: bodyBottom - totalH * 0.75, label: '225' },
  { y: bodyBottom - totalH, label: '300' },
]);
</script>

<template>
  <div class="flask-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 140 230" class="flask-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="70" cy="222" rx="42" ry="3" fill="rgba(0,0,0,0.06)" />

      <!-- Neck (upper tube) -->
      <path
        d="M 61 28 L 61 83 L 79 83 L 79 28"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1.2"
      />

      <!-- Body (conical) -->
      <path
        d="M 61 83 L 20 210 Q 20 215 25 215 L 115 215 Q 120 215 120 210 L 79 83"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1.2"
      />

      <!-- Rim -->
      <ellipse cx="70" cy="28" rx="11" ry="3" fill="none" stroke="#94a3b8" stroke-width="1.2" />
      <ellipse cx="70" cy="28" rx="9" ry="2" fill="none" stroke="rgba(148,163,184,0.3)" stroke-width="0.5" />

      <!-- Scale marks on neck -->
      <line x1="65" y1="48" x2="75" y2="48" stroke="#64748b" stroke-width="0.6" opacity="0.5" />
      <line x1="65" y1="68" x2="75" y2="68" stroke="#64748b" stroke-width="0.6" opacity="0.5" />

      <!-- Scale marks on body (etched) -->
      <g v-for="mark in marks" :key="mark.label">
        <line
          :x1="centerX - 25"
          :y1="mark.y"
          :x2="centerX + 25"
          :y2="mark.y"
          stroke="#64748b"
          stroke-width="0.8"
          opacity="0.5"
          stroke-linecap="round"
        />
        <text
          :x="centerX + 30"
          :y="mark.y + 2.5"
          font-size="7"
          fill="#334155"
          font-weight="700"
          opacity="0.75"
        >{{ mark.label }}</text>
      </g>

      <!-- LIQUID in body -->
      <g v-if="volume > 0 && liquidH > 0">
        <!-- Body liquid -->
        <path
          v-if="liquidH > 0"
          :d="`M ${centerX - neckW/2 - 2} ${liquidY} L ${centerX - bodyW/2 + 2} ${bodyBottom - 4} Q ${centerX - bodyW/2 + 2} ${bodyBottom} ${centerX} ${bodyBottom} Q ${centerX + bodyW/2 - 2} ${bodyBottom} ${centerX + bodyW/2 - 2} ${bodyBottom - 4} L ${centerX + neckW/2 + 2} ${liquidY} Z`"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Meniscus at body top -->
        <ellipse
          :cx="centerX"
          :cy="liquidY"
          :rx="neckW/2 + 2"
          ry="2.5"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.1"
        />
        <!-- Highlight -->
        <ellipse
          :cx="centerX"
          :cy="liquidY + 0.3"
          :rx="neckW/2 - 2"
          ry="1"
          fill="rgba(255,255,255,0.35)"
        />
        <!-- Surface level indicator (red line for transparent liquids) -->
        <line
          :x1="centerX - neckW/2 - 2"
          :y1="liquidY"
          :x2="centerX + neckW/2 + 2"
          :y2="liquidY"
          stroke="#ef4444"
          stroke-width="1.2"
          opacity="0.65"
          stroke-linecap="round"
        />
        <circle :cx="centerX" :cy="liquidY" r="2.5" fill="#ef4444" opacity="0.3" />
        <!-- Side reflection -->
        <path
          :d="`M 25 ${liquidY + 8} L 25 ${bodyBottom - 6}`"
          stroke="rgba(255,255,255,0.18)"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
      </g>

      <!-- LIQUID in neck (only when >85%) -->
      <g v-if="liquidNeckH > 0">
        <rect
          :x="centerX - neckW/2 + 1.5"
          :y="shoulderY - liquidNeckH"
          :width="neckW - 3"
          :height="liquidNeckH"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Meniscus at top of neck liquid -->
        <ellipse
          :cx="centerX"
          :cy="shoulderY - liquidNeckH"
          :rx="neckW/2 - 2"
          ry="1.8"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.1"
        />
      </g>

      <!-- Glass highlights -->
      <path d="M 24 140 L 24 205" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M 64 35 L 64 75" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M 76 40 L 76 70" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-linecap="round" fill="none" />
      <path d="M 30 210 Q 70 215 110 210" stroke="rgba(255,255,255,0.15)" stroke-width="1" fill="none" />
    </svg>

    <!-- Drop canvas -->
    <canvas
      v-if="volume > 0"
      ref="canvasRef"
      width="140"
      height="260"
      class="drop-canvas"
      :style="{ transform: `rotate(${-tiltAngle}deg)`, transformOrigin: '70px 120px' }"
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
  width: 110px;
  height: 180px;
}
.flask-svg.hovered {
  transform: scale(1.05);
}
.drop-canvas {
  position: absolute;
  top: 0;
  left: 50%;
  width: 140px;
  height: 260px;
  margin-left: -70px;
  z-index: 2;
  pointer-events: none;
}
</style>
