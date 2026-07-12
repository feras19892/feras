<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { items, liquidMap, burnerMap, hotPlateMap, isContainer } from '../../../composables/chemistry/useChemistryLab';
import { isBunsenBurner, isHeatingMantle, isHotPlate } from '../../../composables/chemistry/chemLabIds';
import { getEnvironmentTemp } from '../../../composables/chemistry/useThermometer';

interface Props {
  variant: 'mercury' | 'digital';
  uid: string;
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), { isHovered: false });
const emit = defineEmits<{ click: [] }>();

// === Reactive target temperature from environment ===
const env = computed(() => {
  const thermo = items.value.find(i => i.uid === props.uid);
  if (!thermo) return { temperature: 25, inLiquid: false };
  // Touch reactive deps so Vue tracks them
  for (const i of items.value) {
    if (isContainer(i.id)) { const l = liquidMap[i.uid]; if (l) l.temperature; }
    const b = burnerMap[i.uid]; if (b) { b.on; b.intensity; }
    const h = hotPlateMap[i.uid]; if (h) { h.on; }
  }
  return getEnvironmentTemp(thermo);
});

const targetTemp = computed(() => env.value.temperature);
const inLiquid = computed(() => env.value.inLiquid);

// === Smoothed temperature via rAF (thermal inertia) ===
const smoothedTemp = ref(25);
let rafId = 0;

onMounted(() => {
  function tick() {
    const target = targetTemp.value;
    const current = smoothedTemp.value;
    const diff = target - current;
    // Mercury in glass: slow in air (glass is poor conductor), fast in liquid
    // Digital probe: faster response (RTD sensor)
    const lag = props.variant === 'digital' ? 0.25 : (inLiquid.value ? 0.12 : 0.035);
    if (Math.abs(diff) > 0.02) {
      smoothedTemp.value = +(current + diff * lag).toFixed(2);
    } else {
      smoothedTemp.value = target;
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
});
onUnmounted(() => cancelAnimationFrame(rafId));

// === Display values ===
const displayStr = computed(() => smoothedTemp.value.toFixed(1));

const tempColor = computed(() => {
  const t = smoothedTemp.value;
  if (t < 0) return '#1e3a8a';
  if (t < 15) return '#2563eb';
  if (t < 25) return '#3b82f6';
  if (t < 35) return '#06b6d4';
  if (t < 50) return '#10b981';
  if (t < 65) return '#84cc16';
  if (t < 80) return '#eab308';
  if (t < 95) return '#f59e0b';
  if (t < 110) return '#f97316';
  return '#dc2626';
});

// Mercury column height: linear mapping -10..120 → 5..175
const TEMP_MIN = -10;
const TEMP_MAX = 120;
const COL_BOTTOM = 200;
const COL_MAX_H = 175;

const mercuryHeight = computed(() => {
  const pct = Math.max(0, Math.min(1, (smoothedTemp.value - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)));
  return pct * COL_MAX_H;
});

const mercuryY = computed(() => COL_BOTTOM - mercuryHeight.value);

// Scale ticks: -10 to 120, major every 20, minor every 10
const scaleTicks = Array.from({ length: 14 }, (_, i) => i * 10 - 10);

function tickY(tick: number): number {
  const pct = (tick - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);
  return COL_BOTTOM - pct * COL_MAX_H;
}

// Digital display: update once per second (real LCD behavior)
const digitalDisplay = ref('25.0');
let digitalInterval = 0;
onMounted(() => {
  digitalInterval = window.setInterval(() => {
    digitalDisplay.value = smoothedTemp.value.toFixed(1);
  }, 1000);
});
onUnmounted(() => clearInterval(digitalInterval));

const digitalBgColor = computed(() => {
  const t = smoothedTemp.value;
  if (t >= 60) return 'rgba(239,68,68,0.12)';
  if (t <= 10) return 'rgba(59,130,246,0.12)';
  return 'rgba(34,197,94,0.08)';
});
</script>

<template>
  <div class="thermometer-wrapper" @click.stop="emit('click')">

    <!-- ===== Mercury Thermometer ===== -->
    <svg v-if="variant === 'mercury'" viewBox="0 0 60 250" width="30" height="125" class="therm-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="30" cy="242" rx="16" ry="2" fill="rgba(0,0,0,0.08)" />

      <!-- Top cap (metal ring) -->
      <rect x="22" y="4" width="16" height="8" rx="3" fill="#64748b" stroke="#475569" stroke-width="0.5" />
      <rect x="24" y="5" width="12" height="3" rx="1.5" fill="#94a3b8" />

      <!-- Glass tube outer -->
      <rect x="23" y="12" width="14" height="190" rx="7" fill="rgba(220,235,250,0.12)" stroke="#cbd5e1" stroke-width="1" />

      <!-- Glass inner highlight (left shine) -->
      <rect x="24.5" y="14" width="2.5" height="186" rx="1.25" fill="rgba(255,255,255,0.35)" />

      <!-- Scale background -->
      <rect x="38" y="15" width="16" height="185" rx="2" fill="rgba(255,255,255,0.08)" />

      <!-- Scale ticks & numbers -->
      <g v-for="tick in scaleTicks" :key="tick">
        <line
          v-if="tick % 20 === 0"
          x1="37" :y1="tickY(tick)" x2="44" :y2="tickY(tick)"
          stroke="#475569" stroke-width="1"
        />
        <text
          v-if="tick % 20 === 0"
          x="46" :y="tickY(tick) + 3"
          font-size="5" fill="#475569" text-anchor="start" font-weight="600"
        >{{ tick }}</text>
        <line
          v-if="tick % 20 !== 0"
          x1="37" :y1="tickY(tick)" x2="41" :y2="tickY(tick)"
          stroke="#94a3b8" stroke-width="0.6"
        />
      </g>

      <!-- Mercury column -->
      <rect
        x="25.5" :y="mercuryY" width="9"
        :height="mercuryHeight + 5" rx="4.5"
        :fill="tempColor"
      />
      <!-- Mercury column highlight -->
      <rect
        x="26.5" :y="mercuryY + 2" width="2"
        :height="Math.max(0, mercuryHeight)" rx="1"
        fill="rgba(255,255,255,0.3)"
      />

      <!-- Mercury bulb -->
      <circle cx="30" cy="208" r="12" :fill="tempColor" />
      <circle cx="30" cy="208" r="10" :fill="tempColor" opacity="0.9" />
      <ellipse cx="27" cy="204" rx="3" ry="4" fill="rgba(255,255,255,0.35)" />

      <!-- Glass tube bottom -->
      <rect x="25.5" y="195" width="9" height="10" :fill="tempColor" />
      <!-- Neck -->
      <rect x="24" y="198" width="12" height="6" rx="2" fill="rgba(220,235,250,0.15)" stroke="#cbd5e1" stroke-width="0.5" />

      <!-- °C label -->
      <text x="30" y="22" font-size="5" fill="#64748b" text-anchor="middle" font-weight="700">°C</text>

      <!-- Temperature number -->
      <text x="30" y="248" font-size="9" :fill="tempColor" text-anchor="middle" font-weight="800" font-family="monospace">{{ displayStr }}°</text>
    </svg>

    <!-- ===== Digital Thermometer ===== -->
    <svg v-else viewBox="0 0 80 140" width="40" height="70" class="therm-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="40" cy="135" rx="30" ry="2" fill="rgba(0,0,0,0.06)" />

      <!-- Probe stem -->
      <rect x="36" y="90" width="8" height="45" rx="2" fill="#94a3b8" />
      <rect x="37" y="91" width="6" height="43" rx="1" fill="#cbd5e1" />
      <ellipse cx="40" cy="136" rx="4" ry="3" fill="#64748b" />

      <!-- Body -->
      <rect x="8" y="15" width="64" height="80" rx="8" fill="#1e293b" />
      <rect x="10" y="17" width="60" height="76" rx="6" fill="#334155" />

      <!-- Screen background -->
      <rect x="16" y="25" width="48" height="30" rx="4" :fill="digitalBgColor" />
      <rect x="17" y="26" width="46" height="28" rx="3" fill="none" stroke="rgba(34,197,94,0.08)" stroke-width="0.5" />

      <!-- Temperature display -->
      <text x="40" y="47" font-family="'Segoe UI', monospace" font-size="16" font-weight="800" :fill="tempColor" text-anchor="middle">{{ digitalDisplay }}°</text>

      <!-- Unit label -->
      <text x="40" y="62" font-size="6" fill="#64748b" text-anchor="middle" font-weight="700" letter-spacing="1">°C</text>

      <!-- Power button -->
      <circle cx="25" cy="75" r="5" fill="#475569" />
      <text x="25" y="78" font-size="4" fill="#94a3b8" text-anchor="middle" font-weight="700">P</text>

      <!-- Mode button -->
      <circle cx="55" cy="75" r="5" fill="#475569" />
      <text x="55" y="78" font-size="4" fill="#94a3b8" text-anchor="middle" font-weight="700">M</text>

      <!-- Brand -->
      <text x="40" y="90" font-size="5" fill="#64748b" text-anchor="middle" font-weight="700" letter-spacing="1">DIGITAL</text>

      <!-- Belt clip -->
      <rect x="30" y="95" width="20" height="6" rx="2" fill="#1e293b" />
    </svg>

    <!-- Reading badge -->
    <div class="temp-badge" :style="{ color: tempColor }">
      {{ displayStr }}°C
      <span v-if="inLiquid" class="immersed-dot">●</span>
    </div>
  </div>
</template>

<style scoped>
.thermometer-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.therm-svg {
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
  overflow: visible;
}
.therm-svg rect, .therm-svg circle, .therm-svg ellipse {
  transition: y 0.3s ease-out, height 0.3s ease-out, fill 0.5s ease-out;
}
.therm-svg.hovered {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
}
.temp-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  font-size: 0.65rem;
  font-weight: 800;
  background: rgba(15,23,42,0.9);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
  pointer-events: none;
  white-space: nowrap;
}
.immersed-dot {
  color: #22c55e;
  font-size: 0.5rem;
  margin-left: 2px;
}
</style>
