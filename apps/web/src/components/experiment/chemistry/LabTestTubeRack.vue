<script setup lang="ts">
interface SlotData {
  uid: string | null;
  volume?: number;
  maxVolume?: number;
  color?: string;
  opacity?: number;
}

interface Props {
  isHovered?: boolean;
  slots?: SlotData[];
  highlightIndex?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  isHovered: false,
  slots: () => new Array(6).fill(null).map(() => ({ uid: null })),
  highlightIndex: null,
});

const emit = defineEmits<{
  click: [];
  slotClick: [index: number];
}>();

function onSlotClick(index: number, e: MouseEvent) {
  e.stopPropagation();
  emit('slotClick', index);
}
</script>

<template>
  <div class="rack-wrapper" @click.stop="emit('click')">
    <!-- Wire rack: metal frame with 3 rows of holes -->
    <svg viewBox="0 0 240 100" class="rack-svg" :class="{ hovered: isHovered }">
      <!-- Shadow -->
      <ellipse cx="120" cy="96" rx="110" ry="3" fill="rgba(0,0,0,0.06)" />

      <!-- Bottom wire frame -->
      <rect x="10" y="85" width="220" height="6" rx="3" fill="#64748b" />
      <rect x="11" y="86" width="218" height="4" rx="2" fill="#94a3b8" />

      <!-- Middle wire frame -->
      <rect x="10" y="48" width="220" height="6" rx="3" fill="#64748b" />
      <rect x="11" y="49" width="218" height="4" rx="2" fill="#94a3b8" />

      <!-- Top wire frame -->
      <rect x="10" y="14" width="220" height="6" rx="3" fill="#64748b" />
      <rect x="11" y="15" width="218" height="4" rx="2" fill="#94a3b8" />

      <!-- Vertical side wires (left and right) -->
      <rect x="12" y="20" width="4" height="65" rx="2" fill="#475569" />
      <rect x="224" y="20" width="4" height="65" rx="2" fill="#475569" />

      <!-- Vertical middle wires -->
      <rect x="62" y="20" width="3" height="65" rx="1.5" fill="#475569" />
      <rect x="120" y="20" width="3" height="65" rx="1.5" fill="#475569" />
      <rect x="175" y="20" width="3" height="65" rx="1.5" fill="#475569" />

      <!-- Holes in top frame (6 tubes) -->
      <g v-for="i in 6" :key="i">
        <ellipse :cx="20 + (i-1) * 38" cy="17" rx="11" ry="3.5" fill="#334155" />
        <ellipse :cx="20 + (i-1) * 38" cy="17" rx="9" ry="2.5" fill="#0f172a" />
      </g>

      <!-- Holes in middle frame (6 tubes, same positions) -->
      <g v-for="i in 6" :key="'m' + i">
        <ellipse :cx="20 + (i-1) * 38" cy="51" rx="11" ry="3.5" fill="#334155" />
        <ellipse :cx="20 + (i-1) * 38" cy="51" rx="9" ry="2.5" fill="#0f172a" />
      </g>

      <!-- Dynamic test tubes from slots -->
      <g v-for="(slot, i) in slots" :key="i" opacity="0.85" @click.stop="onSlotClick(i, $event)">
        <g :transform="`translate(${20 + i * 38 - 20}, 0)`">
          <!-- Tube body -->
          <path
            d="M 12 17 L 12 82 Q 12 88 20 88 Q 28 88 28 82 L 28 17"
            :fill="slot.uid ? 'rgba(241,245,249,0.2)' : 'rgba(241,245,249,0.05)'"
            stroke="#94a3b8"
            stroke-width="0.7"
          />
          <ellipse cx="20" cy="17" rx="8" ry="2.5" fill="none" stroke="#94a3b8" stroke-width="0.7" />
          <!-- Liquid fill -->
          <path
            v-if="slot.uid && slot.volume && slot.volume > 0 && slot.maxVolume"
            :d="`M 14 ${82 - (slot.volume / slot.maxVolume) * 65} L 14 82 Q 14 86 20 86 Q 26 86 26 82 L 26 ${82 - (slot.volume / slot.maxVolume) * 65} Z`"
            :fill="slot.color || '#3b82f6'"
            :opacity="slot.opacity || 0.3"
          />
          <!-- Highlight ring for empty slot when hovered rack -->
          <ellipse
            v-if="!slot.uid && highlightIndex === i"
            cx="20" cy="17" rx="9" ry="3"
            fill="none" stroke="#10b981" stroke-width="1.2" opacity="0.7"
          >
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1s" repeatCount="indefinite" />
          </ellipse>
        </g>
      </g>

      <!-- Wire highlights -->
      <line x1="14" y1="16" x2="226" y2="16" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      <line x1="14" y1="50" x2="226" y2="50" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      <line x1="14" y1="87" x2="226" y2="87" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
    </svg>
  </div>
</template>

<style scoped>
.rack-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.rack-svg {
  width: 170px;
  height: 71px;
  transition: transform 0.2s, filter 0.2s;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
}
.rack-svg.hovered {
  transform: scale(1.04);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
}
</style>
