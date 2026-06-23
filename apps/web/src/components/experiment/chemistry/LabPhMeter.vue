<script setup lang="ts">
interface Props {
  reading?: number | null; // pH value
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  reading: null,
  isHovered: false,
});

const emit = defineEmits<{ click: [] }>();

const displayStr = () => {
  if (props.reading === null) return '--.--';
  return props.reading.toFixed(2);
};

const phColor = (ph: number | null): string => {
  if (ph === null) return '#94a3b8';
  if (ph < 3) return '#ef4444';
  if (ph < 7) return '#f59e0b';
  if (ph === 7) return '#22c55e';
  if (ph < 11) return '#3b82f6';
  return '#8b5cf6';
};
</script>

<template>
  <div class="ph-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 160 240" class="ph-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="80" cy="232" rx="50" ry="3" fill="rgba(0,0,0,0.06)" />

      <!-- Probe cable -->
      <path d="M 55 95 Q 55 40 80 15" stroke="#334155" stroke-width="3" fill="none" />
      <path d="M 80 15 L 80 5" stroke="#334155" stroke-width="2.5" fill="none" />

      <!-- Glass probe -->
      <!-- Probe bulb -->
      <ellipse cx="80" cy="18" rx="7" ry="10" fill="rgba(200,220,240,0.3)" stroke="#94a3b8" stroke-width="1" />
      <!-- Probe stem -->
      <rect x="76" y="5" width="8" height="18" rx="2" fill="rgba(200,220,240,0.25)" stroke="#94a3b8" stroke-width="0.8" />
      <!-- Probe tip highlight -->
      <ellipse cx="80" cy="10" rx="3" ry="4" fill="rgba(255,255,255,0.3)" />

      <!-- Meter body (box) -->
      <rect x="20" y="95" width="120" height="110" rx="10" fill="#1e293b" />
      <rect x="22" y="97" width="116" height="106" rx="8" fill="#334155" />

      <!-- Screen area -->
      <rect x="32" y="106" width="96" height="42" rx="6" fill="#0f172a" />
      <!-- Screen border glow -->
      <rect x="33" y="107" width="94" height="40" rx="5" fill="none" stroke="rgba(34,197,94,0.1)" stroke-width="0.5" />

      <!-- pH display -->
      <text
        x="80"
        y="135"
        font-family="'Segoe UI', monospace"
        font-size="24"
        font-weight="800"
        :fill="phColor(reading)"
        text-anchor="middle"
      >{{ displayStr() }}</text>

      <!-- pH label -->
      <text x="80" y="155" font-size="8" fill="#64748b" text-anchor="middle" font-weight="700" letter-spacing="2">pH</text>

      <!-- Scale bar (acid to base) -->
      <rect x="38" y="165" width="84" height="6" rx="3" fill="#1e293b" />
      <defs>
        <linearGradient id="phGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="25%" stop-color="#f59e0b" />
          <stop offset="50%" stop-color="#22c55e" />
          <stop offset="75%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="38" y="165" width="84" height="6" rx="3" fill="url(#phGradient)" opacity="0.6" />
      <!-- Indicator dot -->
      <circle
        v-if="reading !== null"
        :cx="38 + Math.min(Math.max((reading / 14) * 84, 4), 80)"
        cy="168"
        r="3"
        fill="#fff"
        stroke="#1e293b"
        stroke-width="1"
      />

      <!-- Buttons -->
      <rect x="38" y="180" width="22" height="10" rx="3" fill="#475569" />
      <text x="49" y="187" font-size="5" fill="#94a3b8" text-anchor="middle" font-weight="700">CAL</text>
      <rect x="70" y="180" width="22" height="10" rx="3" fill="#475569" />
      <text x="81" y="187" font-size="5" fill="#94a3b8" text-anchor="middle" font-weight="700">HOLD</text>
      <rect x="102" y="180" width="22" height="10" rx="3" fill="#475569" />
      <text x="113" y="187" font-size="5" fill="#94a3b8" text-anchor="middle" font-weight="700">ON/OFF</text>

      <!-- Brand -->
      <text x="80" y="200" font-size="6" fill="#64748b" text-anchor="middle" font-weight="700" letter-spacing="1">pH-METER</text>

      <!-- Feet -->
      <rect x="28" y="205" width="10" height="4" rx="2" fill="#0f172a" />
      <rect x="122" y="205" width="10" height="4" rx="2" fill="#0f172a" />

      <!-- Connector port -->
      <ellipse cx="55" cy="95" rx="6" ry="3" fill="#64748b" />
      <ellipse cx="55" cy="95" rx="4" ry="2" fill="#1e293b" />
    </svg>

    <!-- Reading badge -->
    <div v-if="reading !== null" class="ph-badge" :style="{ color: phColor(reading) }">
      pH {{ reading.toFixed(2) }}
    </div>
  </div>
</template>

<style scoped>
.ph-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.ph-svg {
  width: 80px;
  height: 120px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
}
.ph-svg.hovered {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
}
.ph-badge {
  position: absolute;
  top: -4px;
  right: 0;
  font-size: 0.65rem;
  font-weight: 800;
  background: rgba(15,23,42,0.9);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
  pointer-events: none;
}
</style>
