<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  isOn?: boolean;
  intensity?: number; // 0–1 flame intensity
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOn: false,
  intensity: 0.7,
  isHovered: false,
});

const flameOpacity = computed(() => props.isOn ? 0.85 : 0);
const flameHeight = computed(() => props.isOn ? 55 * props.intensity : 0);
</script>

<template>
  <div class="burner-wrapper">
    <svg viewBox="0 0 80 180" class="burner-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="40" cy="172" rx="28" ry="3" fill="rgba(0,0,0,0.08)" />

      <!-- Base (rubber foot) -->
      <ellipse cx="40" cy="168" rx="26" ry="5" fill="#334155" />
      <ellipse cx="40" cy="166" rx="24" ry="4" fill="#475569" />

      <!-- Base tube (metal) -->
      <rect x="32" y="130" width="16" height="36" rx="2" fill="#64748b" />
      <rect x="33" y="131" width="14" height="34" rx="1" fill="#94a3b8" />
      <!-- Tube highlight -->
      <line x1="34" y1="132" x2="34" y2="164" stroke="rgba(255,255,255,0.3)" stroke-width="1" />

      <!-- Collar (air regulator) -->
      <rect x="30" y="120" width="20" height="12" rx="3" fill="#475569" />
      <rect x="32" y="122" width="16" height="8" rx="1" fill="#64748b" />
      <!-- Collar holes -->
      <circle cx="36" cy="126" r="1.5" fill="#1e293b" />
      <circle cx="44" cy="126" r="1.5" fill="#1e293b" />
      <line x1="36" y1="126" x2="44" y2="126" stroke="#1e293b" stroke-width="0.8" />

      <!-- Burner tube -->
      <rect x="34" y="60" width="12" height="60" rx="1" fill="#cbd5e1" />
      <rect x="35" y="61" width="10" height="58" rx="0.5" fill="#e2e8f0" />
      <!-- Tube highlight -->
      <line x1="36" y1="62" x2="36" y2="118" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />

      <!-- Top rim -->
      <ellipse cx="40" cy="60" rx="8" ry="2.5" fill="#94a3b8" />
      <ellipse cx="40" cy="60" rx="7" ry="1.8" fill="#cbd5e1" />

      <!-- Flame (3 layers) -->
      <g v-if="isOn" class="flame-group">
        <!-- Outer (pale blue) -->
        <ellipse
          cx="40"
          :cy="60 - flameHeight * 0.3"
          :rx="10 * intensity"
          :ry="flameHeight"
          fill="#60a5fa"
          :opacity="flameOpacity * 0.3"
          class="flame-outer"
        />
        <!-- Middle (bright blue) -->
        <ellipse
          cx="40"
          :cy="60 - flameHeight * 0.35"
          :rx="7 * intensity"
          :ry="flameHeight * 0.75"
          fill="#3b82f6"
          :opacity="flameOpacity * 0.5"
          class="flame-mid"
        />
        <!-- Inner (white/bright core) -->
        <ellipse
          cx="40"
          :cy="60 - flameHeight * 0.4"
          :rx="4 * intensity"
          :ry="flameHeight * 0.5"
          fill="#dbeafe"
          :opacity="flameOpacity * 0.7"
          class="flame-inner"
        />
        <!-- Tip (yellow) -->
        <ellipse
          cx="40"
          :cy="60 - flameHeight * 0.9"
          :rx="3 * intensity"
          :ry="flameHeight * 0.15"
          fill="#fbbf24"
          :opacity="flameOpacity * 0.6"
          class="flame-tip"
        />
      </g>

      <!-- Gas tube connector (bottom side) -->
      <path d="M 46 150 Q 55 150 55 158" stroke="#334155" stroke-width="3" fill="none" />
      <circle cx="55" cy="158" r="3" fill="#1e293b" />
    </svg>

    <!-- Status label -->
    <div v-if="isOn" class="burner-label on">🔥 مشتعل</div>
    <div v-else class="burner-label off">⚫ مطفأ</div>
  </div>
</template>

<style scoped>
.burner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.burner-svg {
  width: 55px;
  height: 125px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
}
.burner-svg.hovered {
  transform: scale(1.06);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
}
.burner-label {
  position: absolute;
  bottom: -4px;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
}
.burner-label.on {
  color: #ea580c;
  background: rgba(254,243,199,0.9);
}
.burner-label.off {
  color: #64748b;
  background: rgba(241,245,249,0.9);
}

/* Flame flicker animation */
.flame-outer { animation: flicker 0.12s ease-in-out infinite alternate; }
.flame-mid { animation: flicker 0.1s ease-in-out infinite alternate-reverse; }
.flame-inner { animation: flicker 0.08s ease-in-out infinite alternate; }
.flame-tip { animation: flicker 0.15s ease-in-out infinite alternate; }

@keyframes flicker {
  0% { transform: scale(1); opacity: var(--o, 0.6); }
  100% { transform: scale(1.05) translateX(0.5px); opacity: calc(var(--o, 0.6) * 0.9); }
}
</style>
