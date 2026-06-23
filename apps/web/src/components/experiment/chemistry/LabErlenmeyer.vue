<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  volume?: number;     // 0–300 mL
  maxVolume?: number;  // 300
  liquidColor?: string;
  liquidOpacity?: number;
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 300,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.35,
  isHovered: false,
});

const emit = defineEmits<{ click: [] }>();

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
const neckVolRatio = 0.15; // neck holds ~15% of volume

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

const pct = computed(() => Math.round((props.volume / props.maxVolume) * 100));
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

    <!-- Label -->
    <div v-if="volume > 0" class="flask-label">{{ volume.toFixed(1) }}mL</div>
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
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.06));
}
.flask-svg.hovered {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
}
.flask-label {
  position: absolute;
  bottom: -6px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  background: rgba(255,255,255,0.9);
  padding: 1px 6px;
  border-radius: 4px;
  pointer-events: none;
}
</style>
