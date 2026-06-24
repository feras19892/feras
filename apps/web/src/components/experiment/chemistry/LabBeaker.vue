<script setup lang="ts">
import { computed, ref } from 'vue';
import { useBeakerDrops } from '../../../composables/chemistry/useBeakerDrops';
import { useBeakerScale } from '../../../composables/chemistry/useBeakerScale';

interface Props {
  volume?: number;
  maxVolume?: number;
  liquidColor?: string;
  liquidOpacity?: number;
  isHovered?: boolean;
  receiving?: boolean;
  stirred?: number;
  tiltAngle?: number;
  itemUid?: string;
  itemX?: number;
  itemY?: number;
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 250,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.3,
  isHovered: false,
  receiving: false,
  stirred: 0,
  tiltAngle: 0,
  itemX: 0,
  itemY: 0,
  itemUid: '',
});

const showMouthGlow = ref(false);

const isStirring = computed(() => {
  if (props.stirred <= 0) return false;
  return (performance.now() - props.stirred) < 2000;
});

const fillHeight = computed(() => {
  if (props.volume <= 0) return 0;
  const pct = Math.min(props.volume / props.maxVolume, 1);
  return pct * 125;
});

const liquidY = computed(() => 160 - fillHeight.value);
const allMarks = computed(() => useBeakerScale(props.maxVolume));

function onMouthEnter() { showMouthGlow.value = true; }
function onMouthLeave() { showMouthGlow.value = false; }

const emit = defineEmits<{ mouthInteract: []; spill: [amount: number]; dropExited: [worldX: number, worldY: number, color: string]; }>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

useBeakerDrops(
  canvasRef,
  () => props.tiltAngle,
  () => props.volume,
  () => props.maxVolume,
  () => props.liquidColor,
  () => props.itemX,
  () => props.itemY,
  (event, ...args) => {
    if (event === 'spill') emit('spill', args[0]);
    else if (event === 'dropExited') emit('dropExited', args[0], args[1], args[2]);
  }
);
</script>

<template>
  <div class="beaker-wrapper">
    <svg viewBox="0 0 140 200" class="beaker-svg" :class="{ hovered: isHovered }">
      <defs>
        <clipPath id="beakerClip" clipPathUnits="userSpaceOnUse">
          <path d="M 38 25 L 38 158 Q 38 172 70 172 Q 102 172 102 158 L 102 25 Z" />
        </clipPath>
      </defs>
      <!-- Ground shadow -->
      <ellipse cx="70" cy="188" rx="32" ry="3.5" fill="rgba(0,0,0,0.06)" />

      <!-- Main glass body -->
      <path
        d="M 38 25 L 38 158 Q 38 172 70 172 Q 102 172 102 158 L 102 25"
        fill="rgba(241,245,249,0.25)"
        stroke="#94a3b8"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <!-- Rim (top opening) -->
      <ellipse cx="70" cy="25" rx="32" ry="5" fill="none" stroke="#94a3b8" stroke-width="1.5" />
      <!-- Inner rim -->
      <ellipse cx="70" cy="25" rx="29" ry="4" fill="none" stroke="rgba(148,163,184,0.35)" stroke-width="0.5" />

      <!-- Spout -->
      <path d="M 100 23 Q 106 21 110 18" stroke="#94a3b8" stroke-width="1.2" fill="none" stroke-linecap="round" />

      <!-- ========== RIGHT-SIDE GRADUATED SCALE ========== -->
      <!-- Scale background strip -->
      <rect x="100" y="30" width="14" height="130" rx="2" fill="rgba(255,255,255,0.4)" stroke="rgba(148,163,184,0.25)" stroke-width="0.5" />
      <!-- Vertical guide line -->
      <line x1="102" y1="158" x2="102" y2="32" stroke="#cbd5e1" stroke-width="0.5" opacity="0.5" />
      <!-- Tick marks (pointing left into glass) -->
      <g v-for="mark in allMarks" :key="mark.value">
        <!-- Major marks extend farther into the body -->
        <line
          :x1="102"
          :y1="mark.y"
          :x2="mark.type === 'major' ? 86 : mark.type === 'mid' ? 94 : 98"
          :y2="mark.y"
          :stroke="mark.type === 'major' ? '#334155' : '#94a3b8'"
          :stroke-width="mark.type === 'major' ? 1.3 : mark.type === 'mid' ? 0.8 : 0.5"
          :opacity="mark.type === 'major' ? 0.9 : 0.4"
          stroke-linecap="round"
        />
        <!-- Number labels on the right -->
        <text
          v-if="mark.label"
          :x="108"
          :y="mark.y + 3.5"
          fill="#1e293b"
          font-size="9"
          font-weight="800"
          font-family="'Segoe UI', Arial, sans-serif"
          opacity="0.95"
          text-anchor="middle"
        >{{ mark.label }}</text>
      </g>

      <!-- ========== LIQUID LAYER ========== -->
      <!-- Clip path applied in UPRIGHT beaker space -->
      <g v-if="volume > 0" clip-path="url(#beakerClip)">
          <!-- Liquid body -->
          <path
            :d="`M 40 ${liquidY} L 40 158 Q 40 170 70 170 Q 100 170 100 158 L 100 ${liquidY} Z`"
            :fill="liquidColor"
            :opacity="liquidOpacity"
          />
          <!-- Meniscus surface -->
          <ellipse
            :cx="70"
            :cy="liquidY"
            rx="30"
            ry="4.5"
            :fill="liquidColor"
            :opacity="liquidOpacity + 0.12"
          />
          <!-- White highlight on meniscus (reading line) -->
          <ellipse
            :cx="70"
            :cy="liquidY + 0.5"
            rx="20"
            ry="2"
            fill="rgba(255,255,255,0.45)"
          />
          <!-- Surface level indicator (red line for visibility even with transparent liquids) -->
          <line
            x1="42"
            :y1="liquidY"
            x2="98"
            :y2="liquidY"
            stroke="#ef4444"
            stroke-width="1.2"
            opacity="0.65"
            stroke-linecap="round"
          />
          <circle :cx="70" :cy="liquidY" r="3" fill="#ef4444" opacity="0.3" />
          <!-- Side reflection inside liquid -->
          <path
            :d="`M 44 ${liquidY + 5} L 44 155`"
            stroke="rgba(255,255,255,0.25)"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
          <!-- Splash / ripple when receiving from burette or pour -->
          <g v-if="receiving">
            <ellipse cx="70" :cy="liquidY" rx="8" ry="2" fill="none" :stroke="liquidColor" stroke-width="1" opacity="0.6" class="ripple" />
            <ellipse cx="70" :cy="liquidY" rx="4" ry="1" fill="none" :stroke="liquidColor" stroke-width="0.8" opacity="0.4" class="ripple-delay" />
          </g>
          <!-- Swirl vortex when stirred -->
          <g v-if="isStirring && volume > 0">
            <path
              d="M 52 155 Q 60 145 70 155 Q 80 165 70 155 Q 60 145 52 155"
              fill="none"
              :stroke="liquidColor"
              stroke-width="1.5"
              opacity="0.5"
              class="swirl"
            >
              <animateTransform attributeName="transform" type="rotate" from="0 70 155" to="360 70 155" dur="0.4s" repeatCount="indefinite" />
            </path>
            <path
              d="M 58 150 Q 65 142 70 150 Q 75 158 70 150 Q 65 142 58 150"
              fill="none"
              :stroke="liquidColor"
              stroke-width="1"
              opacity="0.35"
              class="swirl-inner"
            >
              <animateTransform attributeName="transform" type="rotate" from="360 70 150" to="0 70 150" dur="0.3s" repeatCount="indefinite" />
            </path>
          </g>
      </g>

      <!-- ========== GLASS HIGHLIGHTS ========== -->
      <!-- Left bright reflection -->
      <path d="M 42 28 L 42 155" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" fill="none" />
      <!-- Subtle right reflection -->
      <path d="M 98 35 L 98 120" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <!-- Bottom curve highlight -->
      <path d="M 45 165 Q 70 168 95 165" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none" />

      <!-- ========== MOUTH INTERACTION HITBOX ========== -->
      <ellipse
        cx="70" cy="20" rx="34" ry="8"
        fill="transparent"
        class="mouth-hitbox"
        @mouseenter="onMouthEnter"
        @mouseleave="onMouthLeave"
        @click.stop="emit('mouthInteract')"
      />
      <!-- Mouth glow -->
      <g v-if="showMouthGlow || isHovered">
        <ellipse cx="70" cy="23" rx="30" ry="6" fill="none" stroke="#10b981" stroke-width="2" opacity="0.5" class="mouth-glow" />
        <ellipse cx="70" cy="23" rx="34" ry="8" fill="none" stroke="#10b981" stroke-width="0.5" opacity="0.2" class="mouth-glow-outer" />
      </g>
    </svg>

    <canvas
      v-if="volume > 0"
      ref="canvasRef"
      width="140"
      height="300"
      class="drop-canvas"
      :style="{ transform: `rotate(${-tiltAngle}deg)`, transformOrigin: '70px 100px' }"
    />
  </div>
</template>

<style scoped>
.beaker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.beaker-svg {
  width: 140px;
  height: 200px;
  transition: transform 0.2s;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.06));
}
.drop-canvas {
  position: absolute;
  top: 0;
  left: 50%;
  width: 140px;
  height: 300px;
  margin-left: -70px;
  z-index: 2;
  pointer-events: none;
}
.beaker-svg.hovered {
  transform: scale(1.04);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
}
.mouth-hitbox {
  cursor: pointer;
}
.mouth-glow {
  animation: pulse 1.5s ease infinite;
}
.mouth-glow-outer {
  animation: pulse 1.5s ease infinite 0.2s;
}
@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.2; }
}
.ripple {
  animation: rippleExpand 0.6s ease infinite;
}
.ripple-delay {
  animation: rippleExpand 0.6s ease 0.3s infinite;
}
@keyframes rippleExpand {
  0% { rx: 8; opacity: 0.6; }
  50% { rx: 22; opacity: 0; }
  100% { rx: 8; opacity: 0.6; }
}
</style>
