<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  volume?: number;     // 0–10 mL drawn
  maxVolume?: number;  // 10
  liquidColor?: string;
  liquidOpacity?: number;
  isHovered?: boolean;
  isActive?: boolean;  // true when in cursor mode
  scale?: number;
  isSelected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 10,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.35,
  isHovered: false,
  isActive: false,
  scale: 1,
  isSelected: false,
});

const emit = defineEmits<{ click: []; }>();

/* Geometry: rubber bulb at top, graduated tube, fine tip */
const tubeBottom = 210; // where tube meets tip
const tubeTop = 55;     // where tube meets neck
const tubeH = tubeBottom - tubeTop; // 155px = 10mL

/* Liquid fills tube from bottom up */
const liquidH = computed(() => {
  if (props.volume <= 0) return 0;
  return (props.volume / props.maxVolume) * tubeH;
});
const liquidY = computed(() => tubeBottom - liquidH.value);
const liquidTop = computed(() => liquidY.value);

/* Graduation marks: 0 at tubeBottom, 10 at tubeTop */
const marks = computed(() => {
  const m: { y: number; val: number; showLabel: boolean }[] = [];
  for (let i = 0; i <= 10; i++) {
    m.push({ y: tubeBottom - (i / 10) * tubeH, val: i, showLabel: i % 5 === 0 });
  }
  return m;
});

/* Canvas for drop effect when emptying */
const canvasRef = ref<HTMLCanvasElement | null>(null);
</script>

<template>
  <div class="pipette-wrapper" :class="{ active: isActive }" @click.stop="emit('click')">
    <svg
      viewBox="0 0 60 280"
      class="pipette-svg"
      :class="{ hovered: isHovered }"
      :style="{ width: 50 * props.scale + 'px', height: 230 * props.scale + 'px' }"
    >
      <!-- Shadow -->
      <ellipse cx="30" cy="275" rx="4" ry="1" fill="rgba(0,0,0,0.06)" />

      <!-- Fine tip (tapered cone) -->
      <path
        d="M 27 210 L 29 262 L 31 262 L 33 210 Z"
        fill="rgba(241,245,249,0.3)"
        stroke="#94a3b8"
        stroke-width="0.8"
      />

      <!-- Graduated tube -->
      <rect x="27" y="55" width="6" height="155" rx="1"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="0.8"
      />
      <!-- Selection outline -->
      <rect
        v-if="isSelected"
        x="25"
        y="48"
        width="10"
        height="167"
        rx="2"
        fill="none"
        stroke="#10b981"
        stroke-width="1.8"
        opacity="0.9"
      />

      <!-- Neck connector -->
      <rect x="26" y="48" width="8" height="7" rx="1"
        fill="rgba(241,245,249,0.2)"
        stroke="#94a3b8"
        stroke-width="0.8"
      />

      <!-- Rubber bulb at top -->
      <ellipse cx="30" cy="22" rx="13" ry="18"
        fill="rgba(220,38,38,0.15)"
        stroke="#dc2626"
        stroke-width="1"
      />
      <!-- Bulb highlight -->
      <ellipse cx="25" cy="16" rx="5" ry="8"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        stroke-width="1"
      />

      <!-- Graduation marks -->
      <g v-for="(mark, idx) in marks" :key="idx">
        <line
          :x1="30"
          :y1="mark.y"
          :x2="mark.showLabel ? 36 : 33"
          :y2="mark.y"
          :stroke="mark.showLabel ? '#334155' : '#94a3b8'"
          :stroke-width="mark.showLabel ? 0.8 : 0.5"
          :opacity="mark.showLabel ? 0.7 : 0.4"
          stroke-linecap="round"
        />
        <text
          v-if="mark.showLabel"
          :x="38"
          :y="mark.y + 2"
          font-size="5"
          fill="#334155"
          font-weight="700"
          opacity="0.7"
        >{{ mark.val }}</text>
      </g>

      <!-- LIQUID in graduated tube -->
      <g v-if="volume > 0">
        <rect
          :x="28"
          :y="liquidTop"
          :width="4"
          :height="liquidH"
          :fill="liquidColor"
          :opacity="liquidOpacity"
          rx="1"
        />
        <!-- Meniscus -->
        <ellipse
          :cx="30"
          :cy="liquidTop"
          :rx="2.5"
          ry="1"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.15"
        />
        <!-- Highlight on liquid surface -->
        <ellipse
          :cx="30"
          :cy="liquidTop + 0.5"
          :rx="1.5"
          ry="0.5"
          fill="rgba(255,255,255,0.5)"
        />
        <!-- Volume number inside tube -->
        <text
          x="30"
          :y="liquidTop - 6"
          font-size="7"
          font-weight="800"
          :fill="liquidColor"
          text-anchor="middle"
          opacity="0.9"
        >{{ volume.toFixed(1) }}</text>
      </g>

      <!-- Glass highlights -->
      <path d="M 28 65 L 28 200" stroke="rgba(255,255,255,0.25)" stroke-width="1" stroke-linecap="round" fill="none" />
      <path d="M 26 15 Q 23 22 26 30" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-linecap="round" fill="none" />
    </svg>

    <!-- Drop canvas (only when emptying animation active) -->
    <canvas
      ref="canvasRef"
      width="60"
      height="280"
      class="drop-canvas"
    />
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
.pipette-svg.hovered {
  filter: brightness(1.04);
}
.drop-canvas {
  position: absolute;
  top: 0;
  left: 50%;
  width: 60px;
  height: 280px;
  margin-left: -30px;
  z-index: 2;
  pointer-events: none;
}
</style>
