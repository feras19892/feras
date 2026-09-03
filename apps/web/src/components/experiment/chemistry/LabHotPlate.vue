<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue';

interface Props {
  isOn: boolean;
  temperature: number;
  isHovered: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{ toggle: [] }>();

const ledColor = computed(() => props.isOn ? '#ef4444' : '#374151');
</script>

<template>
  <div class="lab-hot-plate" :class="{ hovered: isHovered, on: isOn }" @click.stop="emit('toggle')">
    <svg width="120" height="90" viewBox="0 0 120 90">
      <!-- Base body -->
      <rect x="5" y="20" width="110" height="60" rx="6" fill="#4b5563" stroke="#374151" stroke-width="2" />
      <!-- Top heating surface -->
      <ellipse cx="60" cy="22" rx="48" ry="14" fill="#1f2937" stroke="#111827" stroke-width="2" />
      <ellipse cx="60" cy="22" rx="42" ry="10" fill="#111827" />
      <!-- Heating glow when on -->
      <ellipse v-if="isOn" cx="60" cy="22" rx="42" ry="10" fill="#ef4444" opacity="0.15" />
      <ellipse v-if="isOn" cx="60" cy="22" rx="30" ry="6" fill="#fca5a5" opacity="0.3" />
      <!-- Control knob left -->
      <circle cx="28" cy="65" r="10" fill="#1f2937" stroke="#374151" stroke-width="1" />
      <line x1="28" y1="65" x2="22" y2="65" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" />
      <!-- Control knob right -->
      <circle cx="92" cy="65" r="10" fill="#1f2937" stroke="#374151" stroke-width="1" />
      <line x1="92" y1="65" x2="98" y2="65" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" />
      <!-- Power LED -->
      <circle cx="60" cy="65" r="5" :fill="ledColor" />
      <circle cx="60" cy="63" r="2" fill="white" opacity="0.3" />
      <!-- Front label -->
      <text x="60" y="82" text-anchor="middle" fill="#9ca3af" font-size="7" font-family="sans-serif">HOT PLATE</text>
    </svg>
    <span class="tool-label">
      {{ isOn ? temperature + '°C' : t('chemistryLab.off') }}
    </span>
  </div>
</template>

<style scoped>
.lab-hot-plate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px;
  cursor: pointer;
  transition: filter 0.2s;
}
.lab-hot-plate.hovered {
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.3));
}
.lab-hot-plate.on {
  filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.3));
}
.tool-label {
  font-size: 0.65rem;
  color: #64748b;
  white-space: nowrap;
}
</style>
