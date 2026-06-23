<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSpillDrops } from '../../../composables/chemistry/useSpillDrops';

interface Props {
  volume?: number;        // 0–250 mL (total in funnel)
  maxVolume?: number;     // 250
  liquidColor?: string;   // top layer
  liquidOpacity?: number;
  bottomLayerColor?: string;  // bottom layer (heavier)
  bottomLayerVolume?: number; // 0–max
  isOpen?: boolean;      // stopcock open/closed
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
  bottomLayerColor: '#92400e',
  bottomLayerVolume: 0,
  isOpen: false,
  isHovered: false,
  tiltAngle: 0,
  itemX: 0,
  itemY: 0,
});

const emit = defineEmits<{ click: []; toggleStopcock: []; spill: [amount: number]; dropExited: [worldX: number, worldY: number, color: string]; }>();

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
    const cx = 55;
    const cy = 120; // mid of SVG viewBox 0 0 110 240
    const mouthDist = 80; // cy - bodyTop(40)
    return { x: cx + mouthDist * Math.sin(rad), y: cy - mouthDist * Math.cos(rad) };
  },
  canvasW: 110,
  canvasH: 260,
  mouthBounds: { minX: 10, maxX: 100, minY: 10, maxY: 240 },
  exitY: 200,
  onSpill: (amount) => emit('spill', amount),
  onDropExited: (wx, wy, color) => emit('dropExited', wx, wy, color),
});

/* Geometry: pear shape with stopcock at bottom */
const bodyTop = 40;
const bodyBottom = 170;
const bodyH = bodyBottom - bodyTop;
const stemH = 55;
const stemW = 10;
const centerX = 55;
const bodyW = 50;

/* Top layer (above) */
const topLayerH = computed(() => {
  if (props.volume <= 0) return 0;
  const topVol = props.volume - props.bottomLayerVolume;
  return (topVol / props.maxVolume) * bodyH;
});
const topLayerY = computed(() => bodyBottom - props.bottomLayerVolume / props.maxVolume * bodyH - topLayerH.value);

/* Bottom layer */
const bottomLayerH = computed(() => {
  if (props.bottomLayerVolume <= 0) return 0;
  return (props.bottomLayerVolume / props.maxVolume) * bodyH;
});
const bottomLayerY = computed(() => bodyBottom - bottomLayerH.value);
</script>

<template>
  <div class="sep-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 110 240" class="sep-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="55" cy="235" rx="20" ry="3" fill="rgba(0,0,0,0.06)" />

      <!-- Main body (pear) -->
      <path
        d="M 35 40 Q 32 80 22 110 Q 18 135 28 160 Q 38 175 50 175 Q 62 175 72 160 Q 82 135 78 110 Q 68 80 65 40"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1.2"
      />

      <!-- Neck -->
      <rect :x="centerX - 10" :y="10" width="20" height="30" rx="1" fill="rgba(241,245,249,0.15)" stroke="#94a3b8" stroke-width="1.2" />
      <ellipse cx="centerX" cy="10" rx="12" ry="3" fill="none" stroke="#94a3b8" stroke-width="1.2" />

      <!-- Stopcock stem -->
      <rect :x="centerX - stemW/2" :y="bodyBottom" :width="stemW" :height="stemH" rx="1" fill="rgba(241,245,249,0.15)" stroke="#94a3b8" stroke-width="1" />

      <!-- Stopcock handle -->
      <g @click.stop="emit('toggleStopcock')" class="stopcock">
        <rect :x="centerX - 14" :y="bodyBottom + 18" width="28" height="10" rx="3" :fill="isOpen ? '#ef4444' : '#475569'" />
        <line :x1="centerX - 8" :y1="bodyBottom + 23" :x2="centerX + 8" :y2="bodyBottom + 23" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
      </g>

      <!-- Tip -->
      <ellipse :cx="centerX" :cy="bodyBottom + stemH" :rx="6" ry="2" fill="none" stroke="#94a3b8" stroke-width="1" />

      <!-- Bottom layer (heavier, lower) -->
      <g v-if="bottomLayerVolume > 0">
        <path
          :d="`M ${35 + (2 * (bodyBottom - bottomLayerY)/bodyH)} ${bottomLayerY} Q ${28 + (4 * (bodyBottom - bottomLayerY)/bodyH)} ${(bottomLayerY + bodyBottom)/2} ${38 + (6 * (bodyBottom - bottomLayerY)/bodyH)} ${bodyBottom - 3} Q ${50} ${bodyBottom - 1} ${50} ${bodyBottom - 1} Q ${50} ${bodyBottom - 1} ${62 - (6 * (bodyBottom - bottomLayerY)/bodyH)} ${bodyBottom - 3} Q ${72 - (4 * (bodyBottom - bottomLayerY)/bodyH)} ${(bottomLayerY + bodyBottom)/2} ${65 - (2 * (bodyBottom - bottomLayerY)/bodyH)} ${bottomLayerY} Z`"
          :fill="bottomLayerColor"
          :opacity="liquidOpacity"
        />
      </g>

      <!-- Top layer (lighter, upper) -->
      <g v-if="volume > bottomLayerVolume">
        <path
          :d="`M ${35 + (2 * (bodyBottom - topLayerY)/bodyH)} ${topLayerY} Q ${32} ${(topLayerY + bottomLayerY)/2} ${38 + (4 * (bodyBottom - topLayerY)/bodyH)} ${bottomLayerY - 2} Q ${50} ${bottomLayerY} ${50} ${bottomLayerY} Q ${50} ${bottomLayerY} ${62 - (4 * (bodyBottom - topLayerY)/bodyH)} ${bottomLayerY - 2} Q ${68} ${(topLayerY + bottomLayerY)/2} ${65 - (2 * (bodyBottom - topLayerY)/bodyH)} ${topLayerY} Z`"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Interface line -->
        <line
          v-if="bottomLayerVolume > 0"
          :x1="centerX - bodyW/2 + 5"
          :y1="bottomLayerY"
          :x2="centerX + bodyW/2 - 5"
          :y2="bottomLayerY"
          stroke="rgba(255,255,255,0.5)"
          stroke-width="0.8"
          stroke-dasharray="3 2"
        />
      </g>

      <!-- Glass highlights -->
      <line :x1="centerX - bodyW/2 + 6" :y1="bodyTop + 10" :x2="centerX - bodyW/2 + 10" :y2="bodyBottom - 20" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" />
    </svg>

    <canvas
      v-if="volume > 0"
      ref="canvasRef"
      width="110"
      height="260"
      class="drop-canvas"
      :style="{ transform: `rotate(${-tiltAngle}deg)`, transformOrigin: '55px 100px' }"
    />
  </div>
</template>

<style scoped>
.sep-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.sep-svg {
  width: 65px;
  height: 142px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06));
}
.sep-svg.hovered {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}
.stopcock {
  cursor: pointer;
}
.stopcock:hover rect {
  filter: brightness(1.2);
}
.drop-canvas {
  position: absolute;
  top: 0;
  left: 50%;
  width: 110px;
  height: 260px;
  margin-left: -55px;
  z-index: 2;
  pointer-events: none;
}
</style>
