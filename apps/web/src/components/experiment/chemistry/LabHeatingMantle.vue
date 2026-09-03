<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
interface Props {

  isOn?: boolean;
  intensity?: number;    // 0–1
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOn: false,
  intensity: 0.5,
  isHovered: false,
});

</script>

<template>
  <div class="mantle-wrapper">
    <svg viewBox="0 0 120 130" class="mantle-svg" :class="{ hovered: isHovered, on: isOn }">
      <!-- Shadow -->
      <ellipse cx="60" cy="125" rx="52" ry="3" fill="rgba(0,0,0,0.08)" />

      <!-- Base housing -->
      <rect x="10" y="85" width="100" height="32" rx="6" fill="#334155" />
      <rect x="12" y="87" width="96" height="28" rx="5" fill="#475569" />

      <!-- Control dial -->
      <circle cx="60" cy="100" r="10" fill="#1e293b" />
      <circle cx="60" cy="100" r="7" fill="#64748b" />
      <!-- Dial indicator -->
      <line
        :x1="60"
        :y1="100"
        :x2="60 + 6 * Math.cos((intensity * 270 - 135) * Math.PI / 180)"
        :y2="100 + 6 * Math.sin((intensity * 270 - 135) * Math.PI / 180)"
        stroke="#ef4444"
        stroke-width="1.5"
        stroke-linecap="round"
      />

      <!-- Power LED -->
      <circle cx="30" cy="100" r="3" :fill="isOn ? '#22c55e' : '#64748b'" />

      <!-- Heating cavity (where flask sits) -->
      <ellipse cx="60" cy="80" rx="46" ry="10" fill="#1e293b" />
      <ellipse cx="60" cy="80" rx="42" ry="8" fill="#0f172a" />

      <!-- Heating element coils (visible inside) -->
      <g v-if="isOn" opacity="0.6">
        <ellipse cx="60" cy="78" rx="38" ry="6" fill="none" stroke="#ef4444" stroke-width="1.5" />
        <ellipse cx="60" cy="78" rx="32" ry="5" fill="none" stroke="#f97316" stroke-width="1" />
        <ellipse cx="60" cy="78" rx="26" ry="4" fill="none" stroke="#fbbf24" stroke-width="0.8" />
      </g>

      <!-- Fabric cover (hemispherical feel) -->
      <path
        d="M 14 80 Q 14 55 60 50 Q 106 55 106 80"
        fill="rgba(120,53,15,0.3)"
        stroke="#92400e"
        stroke-width="1.2"
      />
      <!-- Fabric texture lines -->
      <line x1="30" y1="65" x2="30" y2="78" stroke="#92400e" stroke-width="0.5" opacity="0.4" />
      <line x1="45" y1="58" x2="45" y2="78" stroke="#92400e" stroke-width="0.5" opacity="0.4" />
      <line x1="60" y1="55" x2="60" y2="78" stroke="#92400e" stroke-width="0.5" opacity="0.4" />
      <line x1="75" y1="58" x2="75" y2="78" stroke="#92400e" stroke-width="0.5" opacity="0.4" />
      <line x1="90" y1="65" x2="90" y2="78" stroke="#92400e" stroke-width="0.5" opacity="0.4" />

      <!-- Top rim -->
      <ellipse cx="60" cy="50" rx="42" ry="5" fill="none" stroke="#92400e" stroke-width="1.5" />

      <!-- Glow when on -->
      <ellipse
        v-if="isOn"
        cx="60"
        cy="65"
        rx="35"
        ry="12"
        fill="rgba(239,68,68,0.15)"
        class="glow"
      />

      <!-- Cord -->
      <path d="M 110 102 Q 125 102 125 115" stroke="#334155" stroke-width="3" fill="none" />
      <circle cx="125" cy="118" r="3" fill="#1e293b" />
    </svg>

    <!-- Status label -->
    <div v-if="isOn" class="mantle-label on">🔥 {{ Math.round(intensity * 100) }}%</div>
    <div v-else class="mantle-label off">⚫ {{ t('chemistry.off') }}</div>
  </div>
</template>

<style scoped>
.mantle-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.mantle-svg {
  width: 90px;
  height: 98px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
}
.mantle-svg.hovered {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
}
.mantle-svg.on {
  filter: drop-shadow(0 0 15px rgba(239,68,68,0.3));
}
.glow {
  animation: mantleGlow 2s ease infinite alternate;
}
@keyframes mantleGlow {
  0% { opacity: 0.1; }
  100% { opacity: 0.25; }
}
.mantle-label {
  position: absolute;
  bottom: -2px;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
}
.mantle-label.on {
  color: #ea580c;
  background: rgba(254,243,199,0.9);
}
.mantle-label.off {
  color: #64748b;
  background: rgba(241,245,249,0.9);
}
</style>