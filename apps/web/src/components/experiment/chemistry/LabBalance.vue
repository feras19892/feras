<script setup lang="ts">
interface Props {
  reading?: number | null; // grams
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  reading: null,
  isHovered: false,
});

const emit = defineEmits<{ click: [] }>();

const displayStr = () => {
  if (props.reading === null) return '0.00';
  return props.reading.toFixed(2);
};
</script>

<template>
  <div class="balance-wrapper" @click.stop="emit('click')">
    <svg viewBox="0 0 160 100" class="balance-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="80" cy="95" rx="72" ry="3" fill="rgba(0,0,0,0.08)" />

      <!-- Base body -->
      <rect x="8" y="48" width="144" height="42" rx="6" fill="#1e293b" />
      <rect x="10" y="50" width="140" height="38" rx="5" fill="#334155" />

      <!-- Side panel line -->
      <line x1="12" y1="85" x2="148" y2="85" stroke="#475569" stroke-width="1" />

      <!-- LCD Screen -->
      <rect x="22" y="56" width="80" height="22" rx="3" fill="#0f172a" />
      <!-- Screen inner glow -->
      <rect x="23" y="57" width="78" height="20" rx="2" fill="none" stroke="rgba(34,197,94,0.15)" stroke-width="0.5" />
      <!-- Digits -->
      <text
        x="62"
        y="72"
        font-family="'Segoe UI', monospace"
        font-size="16"
        font-weight="800"
        fill="#22c55e"
        text-anchor="middle"
        letter-spacing="2"
      >{{ displayStr() }}</text>
      <!-- Unit -->
      <text x="108" y="72" font-family="Arial" font-size="8" fill="#64748b" font-weight="700">g</text>

      <!-- Buttons -->
      <rect x="110" y="58" width="14" height="8" rx="2" fill="#475569" />
      <text x="117" y="64" font-size="4" fill="#94a3b8" text-anchor="middle" font-weight="700">TARE</text>
      <rect x="128" y="58" width="14" height="8" rx="2" fill="#475569" />
      <text x="135" y="64" font-size="4" fill="#94a3b8" text-anchor="middle" font-weight="700">MODE</text>

      <!-- Brand label -->
      <text x="80" y="89" font-size="5" fill="#64748b" text-anchor="middle" font-weight="700" letter-spacing="1">LAB-SCALE</text>

      <!-- Platform pillar -->
      <rect x="72" y="38" width="16" height="10" rx="1" fill="#64748b" />
      <rect x="73" y="39" width="14" height="8" rx="0.5" fill="#94a3b8" />

      <!-- Platform (stainless steel dish) -->
      <ellipse cx="80" cy="38" rx="44" ry="7" fill="#cbd5e1" />
      <ellipse cx="80" cy="37" rx="42" ry="5.5" fill="#e2e8f0" />
      <!-- Platform rim highlight -->
      <ellipse cx="80" cy="36.5" rx="40" ry="4" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.8" />

      <!-- Level indicator bubble -->
      <circle cx="142" cy="72" r="4" fill="rgba(255,255,255,0.1)" stroke="#475569" stroke-width="0.5" />
      <circle cx="142" cy="72" r="2" fill="rgba(255,255,255,0.3)" />

      <!-- Feet -->
      <rect x="14" y="90" width="8" height="4" rx="1" fill="#0f172a" />
      <rect x="138" y="90" width="8" height="4" rx="1" fill="#0f172a" />
    </svg>

    <!-- Reading badge -->
    <div v-if="reading !== null" class="balance-badge">{{ reading.toFixed(2) }}g</div>
  </div>
</template>

<style scoped>
.balance-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.balance-svg {
  width: 140px;
  height: 88px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
}
.balance-svg.hovered {
  transform: scale(1.04);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
}
.balance-badge {
  position: absolute;
  top: -4px;
  right: 8px;
  font-size: 0.65rem;
  font-weight: 800;
  color: #22c55e;
  background: rgba(15,23,42,0.9);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
  pointer-events: none;
}
</style>
