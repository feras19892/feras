<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  clampAngle: number; // degrees: 0 = symmetric, rotate to bring one burette forward
  clampHeight: number; // px from base
  leftBuretteUid: string | null;
  rightBuretteUid: string | null;
  isHovered: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{ rotateLeft: []; rotateRight: []; toggleLeft: []; toggleRight: [] }>();

const clampTransform = computed(() => {
  const cx = 70; // center x of rod
  const cy = 20 + props.clampHeight; // y position of clamp on rod
  return `rotate(${props.clampAngle}, ${cx}, ${cy})`;
});

const hasLeft = computed(() => !!props.leftBuretteUid);
const hasRight = computed(() => !!props.rightBuretteUid);
</script>

<template>
  <div class="lab-retort-stand" :class="{ hovered: isHovered }">
    <svg width="140" height="200" viewBox="0 0 140 200">
      <!-- Base plate -->
      <rect x="40" y="180" width="60" height="14" rx="3" fill="#374151" />
      <rect x="50" y="178" width="40" height="4" rx="1" fill="#6b7280" />
      <!-- Vertical rod -->
      <rect x="67" y="20" width="6" height="162" rx="2" fill="#9ca3af" />
      <!-- Rod highlight -->
      <rect x="68" y="20" width="2" height="162" rx="1" fill="#d1d5db" opacity="0.5" />

      <!-- Clamp assembly (rotatable) -->
      <g :transform="clampTransform">
        <!-- Clamp crossbar -->
        <rect x="20" y="20 + clampHeight - 3" width="100" height="6" rx="2" fill="#4b5563" />
        <!-- Clamp center sleeve (slides on rod) -->
        <rect x="62" y="20 + clampHeight - 8" width="16" height="16" rx="2" fill="#374151" />
        <rect x="65" y="20 + clampHeight - 6" width="10" height="4" rx="1" fill="#6b7280" />

        <!-- LEFT JAW (holds left burette) -->
        <g transform="translate(20, 20 + clampHeight)">
          <!-- Upper jaw -->
          <path d="M -4,-12 L 4,-12 L 6,0 L -6,0 Z" fill="#1f2937" />
          <!-- Lower jaw -->
          <path d="M -4,12 L 4,12 L 6,0 L -6,0 Z" fill="#1f2937" />
          <!-- Burette indicator -->
          <rect v-if="hasLeft" x="-3" y="-35" width="6" height="35" rx="2" fill="#ef4444" opacity="0.5" />
          <rect v-else x="-3" y="-20" width="6" height="20" rx="2" fill="#d1d5db" opacity="0.3" stroke="#9ca3af" />
          <!-- Label -->
          <text x="0" y="22" text-anchor="middle" fill="#6b7280" font-size="6">1</text>
        </g>

        <!-- RIGHT JAW (holds right burette) -->
        <g transform="translate(120, 20 + clampHeight)">
          <!-- Upper jaw -->
          <path d="M -4,-12 L 4,-12 L 6,0 L -6,0 Z" fill="#1f2937" />
          <!-- Lower jaw -->
          <path d="M -4,12 L 4,12 L 6,0 L -6,0 Z" fill="#1f2937" />
          <!-- Burette indicator -->
          <rect v-if="hasRight" x="-3" y="-35" width="6" height="35" rx="2" fill="#ef4444" opacity="0.5" />
          <rect v-else x="-3" y="-20" width="6" height="20" rx="2" fill="#d1d5db" opacity="0.3" stroke="#9ca3af" />
          <!-- Label -->
          <text x="0" y="22" text-anchor="middle" fill="#6b7280" font-size="6">2</text>
        </g>
      </g>

      <!-- Rotation control hint -->
      <circle cx="70" cy="10" r="6" fill="#3b82f6" opacity="0.15" />
      <text x="70" y="12" text-anchor="middle" fill="#3b82f6" font-size="6" opacity="0.6">↻</text>
    </svg>

    <!-- Interaction buttons overlay -->
    <div class="rs-controls">
      <button class="rs-btn" @click.stop="emit('rotateLeft')" title="لف لليسار">←</button>
      <button class="rs-btn" @click.stop="emit('rotateRight')" title="لف لليمين">→</button>
    </div>
    <span class="tool-label">حامل السحاحة</span>
  </div>
</template>

<style scoped>
.lab-retort-stand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px;
  position: relative;
}
.lab-retort-stand.hovered {
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.3));
}
.rs-controls {
  display: flex;
  gap: 4px;
  margin-top: -8px;
}
.rs-btn {
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
.rs-btn:hover {
  background: #cbd5e1;
}
.tool-label {
  font-size: 0.65rem;
  color: #64748b;
  white-space: nowrap;
}
</style>
