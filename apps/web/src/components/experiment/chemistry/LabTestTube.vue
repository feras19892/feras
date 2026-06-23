<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  volume?: number;
  maxVolume?: number;
  liquidColor?: string;
  liquidOpacity?: number;
  isHovered?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 25,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.35,
  isHovered: false,
  size: 'md',
});

const emit = defineEmits<{ click: [] }>();

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
  const steps = props.size === 'sm' ? 3 : props.size === 'md' ? 5 : 10;
  for (let i = 1; i <= steps; i++) {
    const pct = i / steps;
    const y = c.value.bottomY - pct * c.value.liquidMaxH;
    m.push({ y, label: i === steps ? String(actualMax.value) : undefined });
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

    <!-- Label -->
    <div v-if="volume > 0" class="tube-label">{{ volume.toFixed(1) }}mL</div>
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
.tube-label {
  position: absolute;
  bottom: -10px;
  font-size: 0.6rem;
  font-weight: 700;
  color: #64748b;
  background: rgba(255,255,255,0.9);
  padding: 1px 5px;
  border-radius: 4px;
  pointer-events: none;
}
</style>
