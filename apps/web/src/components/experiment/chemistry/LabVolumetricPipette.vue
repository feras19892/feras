<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  volume?: number;      // 0–10 mL drawn
  maxVolume?: number;   // 10
  liquidColor?: string;
  liquidOpacity?: number;
  isActive?: boolean;
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 10,
  liquidColor: '#3b82f6',
  liquidOpacity: 0.35,
  isActive: false,
  isHovered: false,
});

const emit = defineEmits<{ click: [] }>();

/* Geometry: long narrow tube with bulb */
const tubeTop = 12;
const tubeBottom = 240;
const tubeH = tubeBottom - tubeTop;
const tubeW = 10;
const centerX = 28;

/* Bulb position (in upper half) */
const bulbTop = 65;
const bulbBottom = 105;
const bulbW = 22;

/* Liquid fills from bottom tip up through bulb */
const liquidH = computed(() => {
  if (props.volume <= 0) return 0;
  return (props.volume / props.maxVolume) * tubeH;
});
const liquidY = computed(() => tubeBottom - liquidH.value);

/* Single calibration ring at the bulb top */
const calMarkY = bulbTop;
</script>

<template>
  <div class="vpip-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 56 260" class="vpip-svg" :class="{ hovered: isHovered, active: isActive }">
      <!-- Shadow -->
      <ellipse cx="28" cy="255" rx="8" ry="2" fill="rgba(0,0,0,0.06)" />

      <!-- Upper narrow stem (above bulb) -->
      <rect
        :x="centerX - tubeW/2"
        :y="tubeTop"
        :width="tubeW"
        :height="bulbTop - tubeTop"
        rx="1"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1"
      />

      <!-- Bulb (expanded middle) -->
      <ellipse
        :cx="centerX"
        :cy="(bulbTop + bulbBottom) / 2"
        :rx="bulbW/2"
        :ry="(bulbBottom - bulbTop) / 2"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1"
      />

      <!-- Lower narrow stem (below bulb) -->
      <rect
        :x="centerX - tubeW/2"
        :y="bulbBottom"
        :width="tubeW"
        :height="tubeBottom - bulbBottom"
        rx="1"
        fill="rgba(241,245,249,0.15)"
        stroke="#94a3b8"
        stroke-width="1"
      />

      <!-- Top rim -->
      <ellipse :cx="centerX" :cy="tubeTop" :rx="tubeW/2 + 1" ry="2" fill="none" stroke="#94a3b8" stroke-width="1" />

      <!-- Tip -->
      <ellipse :cx="centerX" :cy="tubeBottom" :rx="tubeW/2 - 1" ry="1.5" fill="none" stroke="#94a3b8" stroke-width="0.8" />

      <!-- Calibration mark (single line at bulb top) -->
      <line
        :x1="centerX - bulbW/2 - 3"
        :y1="calMarkY"
        :x2="centerX + bulbW/2 + 3"
        :y2="calMarkY"
        stroke="#334155"
        stroke-width="1.5"
        opacity="0.9"
      />
      <text
        :x="centerX + bulbW/2 + 6"
        :y="calMarkY + 2.5"
        font-size="7"
        fill="#334155"
        font-weight="800"
        opacity="0.85"
      >{{ maxVolume }}mL</text>

      <!-- LIQUID -->
      <g v-if="volume > 0">
        <!-- If liquid reaches bulb -->
        <template v-if="liquidY < bulbBottom">
          <!-- Lower stem liquid -->
          <rect
            :x="centerX - tubeW/2 + 1"
            :y="Math.max(liquidY, bulbBottom)"
            :width="tubeW - 2"
            :height="bulbBottom - Math.max(liquidY, bulbBottom)"
            rx="1"
            :fill="liquidColor"
            :opacity="liquidOpacity"
          />
          <!-- Bulb liquid -->
          <ellipse
            v-if="liquidY < bulbBottom"
            :cx="centerX"
            :cy="(bulbTop + bulbBottom) / 2"
            :rx="bulbW/2 - 2"
            :ry="(bulbBottom - bulbTop) / 2 - 1"
            :fill="liquidColor"
            :opacity="liquidOpacity"
          />
          <!-- Upper stem liquid (if full) -->
          <rect
            v-if="liquidY < bulbTop"
            :x="centerX - tubeW/2 + 1"
            :y="liquidY"
            :width="tubeW - 2"
            :height="bulbTop - liquidY"
            rx="1"
            :fill="liquidColor"
            :opacity="liquidOpacity"
          />
        </template>
        <!-- Only lower stem -->
        <rect
          v-else
          :x="centerX - tubeW/2 + 1"
          :y="liquidY"
          :width="tubeW - 2"
          :height="tubeBottom - liquidY"
          rx="1"
          :fill="liquidColor"
          :opacity="liquidOpacity"
        />
        <!-- Meniscus -->
        <ellipse
          :cx="centerX"
          :cy="liquidY"
          :rx="tubeW/2 - 1"
          ry="1.5"
          :fill="liquidColor"
          :opacity="liquidOpacity + 0.1"
        />
      </g>

      <!-- Glass highlights -->
      <line :x1="centerX - tubeW/2 + 2" :y1="tubeTop + 4" :x2="centerX - tubeW/2 + 2" :y2="tubeBottom - 4" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-linecap="round" />
    </svg>

    <div v-if="volume > 0" class="vpip-label">{{ volume.toFixed(2) }}mL</div>
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
.vpip-svg {
  width: 36px;
  height: 168px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06));
}
.vpip-svg.hovered {
  transform: scale(1.08);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}
.vpip-svg.active {
  filter: drop-shadow(0 0 12px rgba(59,130,246,0.4));
}
.vpip-label {
  position: absolute;
  bottom: -6px;
  font-size: 0.6rem;
  font-weight: 700;
  color: #64748b;
  background: rgba(255,255,255,0.9);
  padding: 1px 5px;
  border-radius: 4px;
  pointer-events: none;
}
</style>
