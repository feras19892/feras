<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue';

interface Props {
  clampAngle: number;
  heldContainerUid: string | null;
  isHovered: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{ rotateLeft: []; rotateRight: [] }>();

const hasContainer = computed(() => !!props.heldContainerUid);
const clampTransform = computed(() => {
  return `rotate(${props.clampAngle}, 70, 30)`;
});
</script>

<template>
  <div class="lab-beaker-clamp" :class="{ hovered: isHovered }">
    <svg width="140" height="90" viewBox="0 0 140 90">
      <!-- Rod sleeve (connects to retort stand) -->
      <rect x="64" y="0" width="12" height="20" rx="2" fill="#374151" />
      <rect x="67" y="2" width="6" height="4" rx="1" fill="#6b7280" />

      <!-- Clamp arm (rotatable) -->
      <g :transform="clampTransform">
        <!-- Horizontal arm -->
        <rect x="15" y="26" width="110" height="6" rx="2" fill="#4b5563" />
        <!-- Arm highlight -->
        <rect x="15" y="26" width="110" height="2" rx="1" fill="#6b7280" opacity="0.4" />

        <!-- Clamp jaws (open, ready to grip) -->
        <g transform="translate(70, 30)">
          <!-- Left half -->
          <path d="M -25,-10 Q -15,-10 -10,0 Q -15,10 -25,10 L -30,8 L -30,-8 Z" fill="#1f2937" />
          <!-- Right half -->
          <path d="M 25,-10 Q 15,-10 10,0 Q 15,10 25,10 L 30,8 L 30,-8 Z" fill="#1f2937" />
          <!-- Container placeholder / indicator -->
          <rect v-if="hasContainer" x="-18" y="-20" width="36" height="28" rx="3" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" stroke-width="1" />
          <rect v-else x="-14" y="-16" width="28" height="22" rx="2" fill="#d1d5db" opacity="0.2" stroke="#9ca3af" stroke-dasharray="3,2" />
        </g>
      </g>

      <!-- Rotation hint -->
      <circle cx="70" cy="78" r="5" fill="#10b981" opacity="0.15" />
      <text x="70" y="80" text-anchor="middle" fill="#10b981" font-size="5" opacity="0.6">↔</text>
    </svg>

    <div class="bc-controls">
      <button class="bc-btn" @click.stop="emit('rotateLeft')" :title="t('chemistryLab.rotateLeft')">←</button>
      <button class="bc-btn" @click.stop="emit('rotateRight')" :title="t('chemistryLab.rotateRight')">→</button>
    </div>
    <span class="tool-label">
      {{ hasContainer ? t('chemistryLab.holdingContainer') : t('chemistryLab.emptyClamp') }}
    </span>
  </div>
</template>

<style scoped>
.lab-beaker-clamp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px;
  position: relative;
}
.lab-beaker-clamp.hovered {
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.3));
}
.bc-controls {
  display: flex;
  gap: 4px;
  margin-top: -4px;
}
.bc-btn {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  background: #e2e8f0;
  color: #334155;
  font-size: 0.7rem;
  cursor: pointer;
  transition: background 0.15s;
}
.bc-btn:hover {
  background: #cbd5e1;
}
.tool-label {
  font-size: 0.65rem;
  color: #64748b;
  white-space: nowrap;
}
</style>
