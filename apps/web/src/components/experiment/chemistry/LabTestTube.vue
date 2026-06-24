<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSpillDrops } from '../../../composables/chemistry/useSpillDrops';

interface Props {
  volume?: number;
  maxVolume?: number;
  liquidColor?: string;
  liquidOpacity?: number;
  isHovered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tiltAngle?: number;
  itemUid?: string;
  itemX?: number;
  itemY?: number;
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 25,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.35,
  isHovered: false,
  size: 'md',
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
    const cx = c.value.w / 2;
    const cy = (c.value.rimY + c.value.bottomY) / 2;
    const mouthDist = cy - c.value.rimY;
    return {
      x: cx + mouthDist * Math.sin(rad),
      y: cy - mouthDist * Math.cos(rad),
    };
  },
  canvasW: 60,
  canvasH: 200,
  mouthBounds: { minX: 5, maxX: 55, minY: 5, maxY: 180 },
  exitY: 160,
  onSpill: (amount) => emit('spill', amount),
  onDropExited: (wx, wy, color) => emit('dropExited', wx, wy, color),
});

/* Size configs */
const configs = {
  sm: { w: 34, h: 100, tubeW: 20, liquidMaxH: 55, rimY: 12, bottomY: 85, capacity: 15 },
  md: { w: 40, h: 140, tubeW: 24, liquidMaxH: 80, rimY: 14, bottomY: 120, capacity: 25 },
  lg: { w: 48, h: 180, tubeW: 28, liquidMaxH: 105, rimY: 16, bottomY: 155, capacity: 50 },
};

const c = computed(() => configs[props.size]);
const actualMax = computed(() => props.maxVolume || c.value.capacity);

/* Liquid */
const liquidH = computed(() => {
  if (props.volume <= 0) return 0;
  return Math.min((props.volume / actualMax.value) * c.value.liquidMaxH, c.value.liquidMaxH);
});
const liquidY = computed(() => c.value.bottomY - liquidH.value);

/* Scale marks */
interface Mark { y: number; label?: string }
const marks = computed<Mark[]>(() => {
  const m: Mark[] = [];
  const stepVal = props.size === 'sm' ? 5 : props.size === 'md' ? 5 : 10;
  const steps = Math.floor(actualMax.value / stepVal);
  for (let i = 1; i <= steps; i++) {
    const val = i * stepVal;
    const pct = val / actualMax.value;
    const y = c.value.bottomY - pct * c.value.liquidMaxH;
    m.push({ y, label: String(val) });
  }
  return m;
});
</script>

<template>
  <div class="tube-wrapper" @click.stop="emit('click')">
    <svg :viewBox="`0 0 ${c.w} ${c.h}`" class="tube-svg" :class="{ hovered: isHovered }" :style="{ width: c.w + 10 + 'px', height: c.h + 15 + 'px' }">
      <!-- Shadow -->
      <ellipse :cx="c.w/2" :cy="c.h - 3" :rx="c.tubeW/2 + 2" ry="2" fill="rgba(0,0,0,0.06)" />

      <!-- Glass tube body -->
      <path
        :d="`M ${(c.w - c.tubeW)/2} ${c.rimY} L ${(c.w - c.tubeW)/2} ${c.bottomY - 8} Q ${(c.w - c.tubeW)/2} ${c.bottomY} ${c.w/2} ${c.bottomY} Q ${(c.w + c.tubeW)/2} ${c.bottomY} ${(c.w + c.tubeW)/2} ${c.bottomY - 8} L ${(c.w + c.tubeW)/2} ${c.rimY}`"
        fill="rgba(241,245,249,0.18)"
        stroke="#94a3b8"
        stroke-width="1.2"
      />

      <!-- Rim -->
      <ellipse :cx="c.w/2" :cy="c.rimY" :rx="c.tubeW/2 + 1.5" ry="2.5" fill="none" stroke="#94a3b8" stroke-width="1.2" />
      <ellipse :cx="c.w/2" :cy="c.rimY" :rx="c.tubeW/2" ry="1.8" fill="none" stroke="rgba(148,163,184,0.3)" stroke-width="0.5" />

      <!-- Scale marks (etched) -->
      <g v-for="(mark, idx) in marks" :key="idx">
        <line
          :x1="(c.w - c.tubeW)/2 + 2"
          :y1="mark.y"
          :x2="(c.w - c.tubeW)/2 + (mark.label ? 8 : 5)"
          :y2="mark.y"
          :stroke="mark.label ? '#334155' : '#94a3b8'"
          :stroke-width="mark.label ? 0.9 : 0.5"
          :opacity="mark.label ? 0.8 : 0.4"
          stroke-linecap="round"
        />
        <text
          v-if="mark.label"
          :x="(c.w - c.tubeW)/2 + 10"
          :y="mark.y + 2.5"
          font-size="6"
          fill="#334155"
          font-weight="700"
          opacity="0.8"
        >{{ mark.label }}</text>
      </g>

      <!-- LIQUID -->
      <g v-if="volume > 0">
        <path
          :d="`M ${(c.w - c.tubeW)/2 + 1.5} ${liquidY} L ${(c.w - c.tubeW)/2 + 1.5} ${c.bottomY - 6} Q ${(c.w - c.tubeW)/2 + 1.5} ${c.bottomY - 1} ${c.w/2} ${c.bottomY - 1} Q ${(c.w + c.tubeW)/2 - 1.5} ${c.bottomY - 1} ${(c.w + c.tubeW)/2 - 1.5} ${c.bottomY - 6} L ${(c.w + c.tubeW)/2 - 1.5} ${liquidY} Z`"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Meniscus -->
        <ellipse
          :cx="c.w/2"
          :cy="liquidY"
          :rx="c.tubeW/2 - 2"
          ry="2"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.1"
        />
        <!-- Highlight -->
        <ellipse
          :cx="c.w/2"
          :cy="liquidY + 0.3"
          :rx="c.tubeW/2 - 5"
          ry="1"
          fill="rgba(255,255,255,0.35)"
        />
        <!-- Side reflection -->
        <line
          :x1="(c.w - c.tubeW)/2 + 4"
          :y1="liquidY + 4"
          :x2="(c.w - c.tubeW)/2 + 4"
          :y2="c.bottomY - 8"
          stroke="rgba(255,255,255,0.2)"
          stroke-width="1"
          stroke-linecap="round"
        />
      </g>

      <!-- Glass highlights -->
      <line :x1="(c.w - c.tubeW)/2 + 3" :y1="c.rimY + 4" :x2="(c.w - c.tubeW)/2 + 3" :y2="c.bottomY - 10" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" />
      <line :x1="(c.w + c.tubeW)/2 - 4" :y1="c.rimY + 6" :x2="(c.w + c.tubeW)/2 - 4" :y2="c.bottomY - 12" stroke="rgba(255,255,255,0.12)" stroke-width="0.8" stroke-linecap="round" />
    </svg>

    <!-- Drop canvas -->
    <canvas
      v-if="volume > 0"
      ref="canvasRef"
      width="60"
      height="200"
      class="drop-canvas"
      :style="{ transform: `rotate(${-tiltAngle}deg)`, transformOrigin: `${c.w/2}px ${c.h/2+10}px` }"
    />
  </div>
</template>

<style scoped>
.tube-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.tube-svg {
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06));
}
.tube-svg.hovered {
  transform: scale(1.06);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}
.drop-canvas {
  position: absolute;
  top: 0;
  left: 50%;
  width: 60px;
  height: 200px;
  margin-left: -30px;
  z-index: 2;
  pointer-events: none;
}
</style>
