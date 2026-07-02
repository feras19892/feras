<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
  volume?: number;     // remaining in burette (0–50)
  maxVolume?: number;  // usually 50
  liquidColor?: string;
  liquidOpacity?: number;
  isOpen?: boolean;    // stopcock state
  isHovered?: boolean;
  scale?: number;
  isSelected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  volume: 50,
  maxVolume: 50,
  liquidColor: '#ef4444',
  liquidOpacity: 0.35,
  isOpen: false,
  isHovered: false,
  scale: 1,
  isSelected: false,
});

const emit = defineEmits<{ toggleValve: []; tipInteract: [] }>();

/* Liquid fills from bottom up */
const tubeTop = 15;
const tubeBottom = 285;
const tubeH = tubeBottom - tubeTop;

const liquidH = computed(() => {
  if (props.volume <= 0) return 0;
  return (props.volume / props.maxVolume) * tubeH;
});
const liquidY = computed(() => tubeBottom - liquidH.value);

/* Scale: 0 at top → maxVolume at bottom */
interface Mark { y: number; value: number; type: 'major' | 'mid' | 'minor'; label?: string }

const allMarks = computed<Mark[]>(() => {
  const marks: Mark[] = [];
  const step = 1; // every 1 mL
  for (let v = 0; v <= props.maxVolume; v += step) {
    const pct = v / props.maxVolume;
    const y = tubeTop + pct * tubeH;
    const type: Mark['type'] = v % 10 === 0 ? 'major' : v % 5 === 0 ? 'mid' : 'minor';
    marks.push({
      y, value: v, type,
      label: v % 10 === 0 ? String(v) : undefined,
    });
  }
  return marks;
});

const dropOffset = ref(0);
let dropRaf = 0;
function animateDrop() {
  dropOffset.value += 2.5;
  if (dropOffset.value > 35) dropOffset.value = 0;
  if (props.isOpen && props.volume > 0) {
    dropRaf = requestAnimationFrame(animateDrop);
  }
}

watch(() => props.isOpen, (open) => {
  if (open && props.volume > 0) {
    dropRaf = requestAnimationFrame(animateDrop);
  } else {
    cancelAnimationFrame(dropRaf);
    dropOffset.value = 0;
  }
});

watch(() => props.volume, (vol) => {
  if (vol <= 0) {
    cancelAnimationFrame(dropRaf);
    dropOffset.value = 0;
  }
});

function onValveClick(e: MouseEvent) {
  e.stopPropagation();
  emit('toggleValve');
}
</script>

<template>
  <div class="burette-wrapper">
    <svg
      viewBox="0 0 110 380"
      class="burette-svg"
      :class="{ hovered: isHovered }"
      :style="{ width: 85 * props.scale + 'px', height: 295 * props.scale + 'px' }"
    >
      <!-- Ground shadow -->
      <ellipse cx="55" cy="368" rx="20" ry="2.5" fill="rgba(0,0,0,0.05)" />

      <!-- ========== HANGER LOOP (sits on the retort-stand clamp) ========== -->
      <path d="M 42 8 C 42 0, 68 0, 68 8" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
      <line x1="55" y1="0" x2="55" y2="14" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />

      <!-- ========== GLASS TUBE (rounded bottom) ========== -->
      <!-- Body -->
      <path
        d="M 42 14 L 42 280 Q 42 292 55 292 Q 68 292 68 280 L 68 14"
        fill="rgba(241,245,249,0.2)"
        stroke="#94a3b8"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <!-- Selection outline -->
      <path
        v-if="isSelected"
        d="M 42 14 L 42 280 Q 42 292 55 292 Q 68 292 68 280 L 68 14 Q 68 10 55 10 Q 42 10 42 14 Z"
        fill="none"
        stroke="#10b981"
        stroke-width="2.5"
        stroke-linecap="round"
        opacity="0.9"
      />
      <!-- Top rim -->
      <ellipse cx="55" cy="14" rx="13" ry="3.5" fill="none" stroke="#94a3b8" stroke-width="1.5" />
      <ellipse cx="55" cy="14" rx="11" ry="2.5" fill="none" stroke="rgba(148,163,184,0.3)" stroke-width="0.5" />

      <!-- ========== LEFT-SIDE SCALE (etched into glass, 0 at top) ========== -->
      <!-- Scale strip background -->
      <rect x="26" y="18" width="14" height="262" rx="2" fill="rgba(255,255,255,0.35)" stroke="rgba(148,163,184,0.2)" stroke-width="0.5" />
      <!-- Guide line -->
      <line x1="38" y1="18" x2="38" y2="280" stroke="#cbd5e1" stroke-width="0.5" opacity="0.5" />
      <g v-for="mark in allMarks" :key="mark.value">
        <line
          :x1="38"
          :y1="mark.y"
          :x2="mark.type === 'major' ? 52 : mark.type === 'mid' ? 46 : 42"
          :y2="mark.y"
          :stroke="mark.type === 'major' ? '#334155' : '#94a3b8'"
          :stroke-width="mark.type === 'major' ? 1.1 : mark.type === 'mid' ? 0.7 : 0.4"
          :opacity="mark.type === 'major' ? 0.9 : 0.35"
          stroke-linecap="round"
        />
        <text
          v-if="mark.label"
          :x="30"
          :y="mark.y + 3.5"
          fill="#1e293b"
          font-size="8"
          font-weight="800"
          font-family="'Segoe UI', Arial, sans-serif"
          text-anchor="middle"
          opacity="0.95"
        >{{ mark.label }}</text>
      </g>

      <!-- ========== LIQUID LAYER ========== -->
      <g v-if="volume > 0">
        <!-- Body -->
        <path
          :d="`M 44 ${liquidY} L 44 280 Q 44 290 55 290 Q 66 290 66 280 L 66 ${liquidY} Z`"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Meniscus -->
        <ellipse
          :cx="55"
          :cy="liquidY"
          rx="11"
          ry="2.8"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.1"
        />
        <!-- Reading line highlight -->
        <ellipse
          :cx="55"
          :cy="liquidY + 0.5"
          rx="7"
          ry="1.2"
          fill="rgba(255,255,255,0.4)"
        />
        <!-- Side reflection in liquid -->
        <path
          :d="`M 46 ${liquidY + 4} L 46 282`"
          stroke="rgba(255,255,255,0.2)"
          stroke-width="1.5"
          stroke-linecap="round"
          fill="none"
        />
      </g>

      <!-- ========== GLASS HIGHLIGHTS ========== -->
      <path d="M 44 18 L 44 275" stroke="rgba(255,255,255,0.35)" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M 48 52 L 48 150" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M 64 55 L 64 130" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-linecap="round" fill="none" />

      <!-- ========== STOPCOCK (T-handle) ========== -->
      <g class="stopcock" @click.stop="onValveClick">
        <!-- Glass tip cone -->
        <path d="M 48 292 L 50 305 L 60 305 L 62 292 Z" fill="none" stroke="#94a3b8" stroke-width="1" />
        <!-- Valve barrel -->
        <rect x="52" y="303" width="6" height="8" rx="1" fill="#e2e8f0" stroke="#64748b" stroke-width="1" />
        <!-- T-handle (rotates 90°) -->
        <g
          :transform="`rotate(${isOpen ? 90 : 0}, 55, 307)`"
          style="transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);"
        >
          <line x1="46" y1="307" x2="64" y2="307" stroke="#334155" stroke-width="2.8" stroke-linecap="round" />
          <circle cx="55" cy="307" r="2.5" fill="#334155" />
        </g>
        <!-- Click hitbox -->
        <rect x="42" y="300" width="26" height="16" fill="transparent" cursor="pointer" />
      </g>

      <!-- ========== STREAM + DROP ANIMATION ========== -->
      <g v-if="isOpen && volume > 0">
        <!-- Thin continuous stream -->
        <line x1="55" y1="308" x2="55" :y2="315 + dropOffset" :stroke="liquidColor" stroke-width="1.2" opacity="0.5" />
        <!-- Main drop (teardrop) -->
        <path
          :d="`M 55 ${315 + dropOffset} Q 52.5 ${320 + dropOffset} 55 ${323 + dropOffset} Q 57.5 ${320 + dropOffset} 55 ${315 + dropOffset} Z`"
          :fill="liquidColor"
          opacity="0.65"
        />
        <!-- Secondary drop -->
        <path
          v-if="dropOffset > 15"
          :d="`M 55 ${315 + dropOffset - 18} Q 53 ${318 + dropOffset - 18} 55 ${320 + dropOffset - 18} Q 57 ${318 + dropOffset - 18} 55 ${315 + dropOffset - 18} Z`"
          :fill="liquidColor"
          opacity="0.35"
        />
      </g>

      <!-- ========== TIP INTERACTION ZONE ========== -->
      <ellipse
        cx="55" cy="320" rx="14" ry="8"
        fill="transparent"
        class="tip-hitbox"
        @mouseenter="emit('tipInteract')"
      />
      <ellipse
        v-if="isHovered"
        cx="55" cy="320" rx="16" ry="9"
        fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.4"
        class="tip-glow"
      />
    </svg>
  </div>
</template>

<style scoped>
.burette-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.burette-svg.hovered {
  filter: brightness(1.04);
}
.stopcock {
  cursor: pointer;
}
.stopcock:hover {
  filter: brightness(1.1);
}
.tip-hitbox {
  cursor: crosshair;
}
.tip-glow {
  animation: tipPulse 1.2s ease infinite;
}
@keyframes tipPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.15; }
}
</style>
