<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  volume?: number;     // 0–10 mL drawn
  maxVolume?: number;  // 10
  liquidColor?: string;
  liquidOpacity?: number;
  isHovered?: boolean;
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 10,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.35,
  isHovered: false,
  isActive: false,
});

const emit = defineEmits<{ click: []; }>();

/* Geometry: long thin tube, small glass bulb in middle, fine tip */
const tubeBottom = 209; // where tube meets tip
const bulbTop = 142;    // where upper stem meets bulb (calibration ring)
const tubeH = tubeBottom - bulbTop; // 67px for liquid range = 10mL

/* Liquid fills from bottom up to calibration ring at bulbTop */
const liquidH = computed(() => {
  if (props.volume <= 0) return 0;
  return (props.volume / props.maxVolume) * tubeH;
});
const liquidY = computed(() => tubeBottom - liquidH.value);

/* Canvas for drop effect when emptying */
const canvasRef = ref<HTMLCanvasElement | null>(null);
</script>

<template>
  <div class="vpip-wrapper" :class="{ active: isActive }" @click.stop="emit('click')">
    <svg viewBox="0 0 40 280" class="vpip-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="20" cy="275" rx="3" ry="0.8" fill="rgba(0,0,0,0.06)" />

      <!-- Upper stem (long thin tube) -->
      <rect x="17" y="12" width="6" height="130" rx="1"
        fill="rgba(241,245,249,0.12)"
        stroke="#94a3b8"
        stroke-width="0.6"
      />

      <!-- Small glass bulb in middle -->
      <ellipse cx="20" cy="145" rx="9" ry="14"
        fill="rgba(241,245,249,0.1)"
        stroke="#94a3b8"
        stroke-width="0.8"
      />

      <!-- Lower stem -->
      <rect x="17.5" y="159" width="5" height="50" rx="1"
        fill="rgba(241,245,249,0.12)"
        stroke="#94a3b8"
        stroke-width="0.6"
      />

      <!-- Very fine tip (needle-like) -->
      <path
        d="M 18.5 209 L 19.5 262 L 20.5 262 L 21.5 209 Z"
        fill="rgba(241,245,249,0.2)"
        stroke="#94a3b8"
        stroke-width="0.5"
      />

      <!-- Top rim -->
      <ellipse cx="20" cy="12" rx="4" ry="1.5" fill="none" stroke="#94a3b8" stroke-width="0.6" />

      <!-- Calibration ring (red line around tube at bulb top) -->
      <ellipse cx="20" cy="142" rx="10" ry="2"
        fill="none"
        stroke="#dc2626"
        stroke-width="1.2"
        opacity="0.9"
      />
      <text
        x="32"
        y="144"
        font-size="5"
        fill="#dc2626"
        font-weight="800"
        opacity="0.9"
      >{{ maxVolume }}mL</text>

      <!-- LIQUID: fills from bottom up to the red ring -->
      <g v-if="volume > 0">
        <!-- Lower stem liquid -->
        <rect
          v-if="liquidY < 159"
          x="18.5"
          :y="liquidY"
          width="3"
          :height="159 - liquidY"
          rx="1"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Bulb liquid -->
        <ellipse
          v-if="liquidY < 159"
          cx="20"
          cy="145"
          rx="7"
          ry="12"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Upper stem liquid (if full) -->
        <rect
          v-if="liquidY < 142"
          x="18"
          :y="liquidY"
          width="4"
          :height="142 - liquidY"
          rx="1"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Meniscus at liquid top -->
        <ellipse
          :cx="20"
          :cy="liquidY"
          rx="2.5"
          ry="1"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.1"
        />
      </g>

      <!-- Glass highlight -->
      <path d="M 18 20 L 18 135" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" stroke-linecap="round" fill="none" />
      <path d="M 18 160 L 18 200" stroke="rgba(255,255,255,0.15)" stroke-width="0.6" stroke-linecap="round" fill="none" />
    </svg>

    <!-- Drop canvas -->
    <canvas
      ref="canvasRef"
      width="40"
      height="280"
      class="drop-canvas"
    />
  </div>
</template>

<style scoped>
.vpip-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.vpip-wrapper.active {
  filter: drop-shadow(0 0 12px rgba(59,130,246,0.4));
}
.vpip-svg {
  width: 36px;
  height: 230px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06));
}
.vpip-svg.hovered {
  transform: scale(1.08);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}
.drop-canvas {
  position: absolute;
  top: 0;
  left: 50%;
  width: 40px;
  height: 280px;
  margin-left: -20px;
  z-index: 2;
  pointer-events: none;
}
</style>
