<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';

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

interface Mark { y: number; value: number; type: 'major' | 'mid' | 'minor'; label?: string }

const allMarks = computed<Mark[]>(() => {
  const marks: Mark[] = [];
  const minorStep = props.maxVolume >= 500 ? 10 : props.maxVolume >= 250 ? 5 : 5;
  const majorStep = props.maxVolume >= 500 ? 50 : props.maxVolume >= 250 ? 25 : 10;
  for (let v = minorStep; v <= props.maxVolume; v += minorStep) {
    const pct = v / props.maxVolume;
    const y = 160 - pct * 125;
    const isMajor = v % majorStep === 0;
    const isMid = v % (majorStep / 2) === 0;
    marks.push({ y, value: v, type: isMajor ? 'major' : isMid ? 'mid' : 'minor', label: isMajor ? String(v) : undefined });
  }
  return marks;
});

function onMouthEnter() { showMouthGlow.value = true; }
function onMouthLeave() { showMouthGlow.value = false; }

const emit = defineEmits<{
  mouthInteract: [];
  spill: [amount: number];
}>();

/* ---- Drop physics ---- */
const canvasRef = ref<HTMLCanvasElement | null>(null);
interface Drop { x: number; y: number; vx: number; vy: number; size: number }
let activeDrops: Drop[] = [];
let dropTimer = 0;
let localVolume = props.volume;
let animId = 0;
let running = false;

function hexToRgb(hex: string) {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.substring(0, 2), 16) || 59,
    g: parseInt(c.substring(2, 4), 16) || 130,
    b: parseInt(c.substring(4, 6), 16) || 246,
  };
}

function startDropsLoop() {
  if (running) return;
  running = true;
  const ctx = canvasRef.value?.getContext('2d');
  if (!ctx) { setTimeout(startDropsLoop, 50); return; }

  const loop = () => {
    if (!running) return;
    ctx.clearRect(0, 0, 140, 300);

    const rgb = hexToRgb(props.liquidColor);
    const tilt = props.tiltAngle;
    const absTilt = Math.abs(tilt);
    const fillH = Math.min(localVolume / props.maxVolume, 1) * 125;
    const surfaceY = 160 - fillH;

    // Determine spill side and threshold
    let isSpilling = false;
    let spillX = 0;
    const threshold = 55 - (fillH / 125) * 45; // 55° (empty) → 10° (full)

    if (absTilt > threshold && localVolume > 2) {
      // In counter-rotated canvas space, liquid surface is horizontal
      // Beaker appears tilted. Lower rim is where drops spawn.
      if (tilt > 0) { isSpilling = true; spillX = 102; } // clockwise → right rim lower
      else { isSpilling = true; spillX = 38; } // counter-clockwise → left rim lower
    }

    if (isSpilling) {
      dropTimer++;
      let interval = 25;
      if (absTilt > 20) interval = 12;
      if (absTilt > 40) interval = 5;
      if (absTilt > 55) interval = 2;

      if (dropTimer >= interval) {
        activeDrops.push({
          x: spillX + (tilt > 0 ? 4 : -4),
          y: 25,
          vx: tilt > 0 ? 1.5 : -1.5,
          vy: 1,
          size: 3.5 + Math.random() * 2,
        });
        dropTimer = 0;
        const dropAmount = 0.15;
        localVolume = Math.max(0, +(localVolume - dropAmount).toFixed(1));
        emit('spill', dropAmount);
      }
    } else {
      dropTimer = 0;
    }

    // Update and draw drops — gravity points screen-down regardless of canvas rotation
    const tiltRad = props.tiltAngle * (Math.PI / 180);
    const grav = 0.25;
    const gravX = Math.sin(tiltRad) * grav;
    const gravY = Math.cos(tiltRad) * grav;
    for (let i = activeDrops.length - 1; i >= 0; i--) {
      const d = activeDrops[i];
      d.vx += gravX;
      d.vy += gravY;
      d.x += d.vx;
      d.y += d.vy;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
      ctx.fill();

      if (d.y > 300) activeDrops.splice(i, 1);
    }

    animId = requestAnimationFrame(loop);
  };
  loop();
}

function stopDropsLoop() {
  running = false;
  if (animId) cancelAnimationFrame(animId);
}

watch(() => props.volume, (v: number) => { localVolume = v; });
watch(() => props.tiltAngle, () => { if (!running && props.volume > 0) startDropsLoop(); });

onMounted(() => { if (props.volume > 0) startDropsLoop(); });
onUnmounted(() => { stopDropsLoop(); });
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

    <!-- Falling drops canvas -->
    <canvas
      v-if="volume > 0"
      ref="canvasRef"
      width="140"
      height="300"
      class="drop-canvas"
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
