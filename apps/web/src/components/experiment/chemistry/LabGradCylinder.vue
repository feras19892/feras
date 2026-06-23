<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSpillDrops } from '../../../composables/chemistry/useSpillDrops';

interface Props {
  volume?: number;     // 0–100 mL
  maxVolume?: number;  // 100
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
  maxVolume: 100,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.35,
  isHovered: false,
  tiltAngle: 0,
  itemX: 0,
  itemY: 0,
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
    const cx = 55, cy = 114, mouthDist = 92; // cy=(tubeTop22+tubeBottom205)/2
    return { x: cx + mouthDist * Math.sin(rad), y: cy - mouthDist * Math.cos(rad) };
  },
  canvasW: 110,
  canvasH: 260,
  mouthBounds: { minX: 10, maxX: 100, minY: 10, maxY: 240 },
  exitY: 200,
  onSpill: (amount) => emit('spill', amount),
  onDropExited: (wx, wy, color) => emit('dropExited', wx, wy, color),
});

/* Geometry */
const tubeTop = 22;
const tubeBottom = 205;
const tubeH = tubeBottom - tubeTop;
const tubeW = 28;
const centerX = 55;

/* Liquid */
const liquidH = computed(() => {
  if (props.volume <= 0) return 0;
  return (props.volume / props.maxVolume) * tubeH;
});
const liquidY = computed(() => tubeBottom - liquidH.value);

/* Scale: every 10 mL with minor every 5 */
interface Mark { y: number; value: number; type: 'major' | 'minor'; label?: string }
const marks = computed<Mark[]>(() => {
  const m: Mark[] = [];
  const step = 5; // every 5 mL
  for (let v = 0; v <= props.maxVolume; v += step) {
    const pct = v / props.maxVolume;
    const y = tubeBottom - pct * tubeH;
    const type: Mark['type'] = v % 10 === 0 ? 'major' : 'minor';
    m.push({ y, value: v, type, label: v % 10 === 0 && v > 0 ? String(v) : undefined });
  }
  return m;
});
</script>

<template>
  <div class="cylinder-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 110 230" class="cylinder-svg" :class="{ hovered: isHovered }">
      <!-- Ground shadow -->
      <ellipse cx="55" cy="223" rx="22" ry="2.5" fill="rgba(0,0,0,0.06)" />

      <!-- Base (hexagonal feel) -->
      <path
        d="M 38 205 L 42 218 Q 42 220 45 220 L 65 220 Q 68 220 68 218 L 72 205"
        fill="rgba(241,245,249,0.3)"
        stroke="#94a3b8"
        stroke-width="1"
      />

      <!-- Tube body -->
      <rect
        :x="centerX - tubeW/2"
        :y="tubeTop"
        :width="tubeW"
        :height="tubeH"
        rx="2"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1.2"
      />

      <!-- Rim (poured lip) -->
      <ellipse cx="55" cy="tubeTop" rx="16" ry="3.5" fill="none" stroke="#94a3b8" stroke-width="1.2" />
      <ellipse cx="55" cy="tubeTop" rx="14" ry="2.5" fill="none" stroke="rgba(148,163,184,0.3)" stroke-width="0.5" />

      <!-- Scale marks (right side) -->
      <g v-for="mark in marks" :key="mark.value">
        <line
          :x1="centerX + tubeW/2"
          :y1="mark.y"
          :x2="mark.type === 'major' ? centerX + tubeW/2 + 10 : centerX + tubeW/2 + 6"
          :y2="mark.y"
          :stroke="mark.type === 'major' ? '#334155' : '#94a3b8'"
          :stroke-width="mark.type === 'major' ? 1 : 0.5"
          :opacity="mark.type === 'major' ? 0.8 : 0.4"
          stroke-linecap="round"
        />
        <text
          v-if="mark.label"
          :x="centerX + tubeW/2 + 12"
          :y="mark.y + 2.5"
          font-size="7"
          fill="#1e293b"
          font-weight="800"
          opacity="0.85"
          text-anchor="start"
        >{{ mark.label }}</text>
      </g>

      <!-- LIQUID -->
      <g v-if="volume > 0">
        <rect
          :x="centerX - tubeW/2 + 1.5"
          :y="liquidY"
          :width="tubeW - 3"
          :height="liquidH"
          rx="1"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Meniscus -->
        <ellipse
          :cx="centerX"
          :cy="liquidY"
          :rx="tubeW/2 - 2"
          ry="2.5"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.1"
        />
        <!-- Highlight -->
        <ellipse
          :cx="centerX"
          :cy="liquidY + 0.3"
          :rx="tubeW/2 - 6"
          ry="1"
          fill="rgba(255,255,255,0.4)"
        />
        <!-- Side reflection -->
        <line
          :x1="centerX - tubeW/2 + 4"
          :y1="liquidY + 5"
          :x2="centerX - tubeW/2 + 4"
          :y2="tubeBottom - 3"
          stroke="rgba(255,255,255,0.22)"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </g>

      <!-- Glass highlights -->
      <line :x1="centerX - tubeW/2 + 4" :y1="tubeTop + 5" :x2="centerX - tubeW/2 + 4" :y2="tubeBottom - 5" stroke="rgba(255,255,255,0.35)" stroke-width="2" stroke-linecap="round" />
      <line :x1="centerX + tubeW/2 - 5" :y1="tubeTop + 8" :x2="centerX + tubeW/2 - 5" :y2="tubeBottom - 8" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-linecap="round" />

      <!-- Base highlight -->
      <path d="M 44 218 Q 55 221 66 218" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none" />
    </svg>

    <!-- Drop canvas -->
    <canvas
      v-if="volume > 0"
      ref="canvasRef"
      width="110"
      height="260"
      class="drop-canvas"
      :style="{ transform: `rotate(${-tiltAngle}deg)`, transformOrigin: '55px 115px' }"
    />
  </div>
</template>

<style scoped>
.cylinder-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.cylinder-svg {
  width: 75px;
  height: 158px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06));
}
.cylinder-svg.hovered {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
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
