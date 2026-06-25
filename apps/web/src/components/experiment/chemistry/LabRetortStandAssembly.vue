<script setup lang="ts">
interface Props {
  isHovered: boolean;
  topClampY?: number;
  bottomClampY?: number;
  hasLeftBurette?: boolean;
  hasRightBurette?: boolean;
  hasLeftContainer?: boolean;
  hasRightContainer?: boolean;
  hasHeatingDevice?: boolean;
  leftBuretteUid?: string | null;
  rightBuretteUid?: string | null;
  leftContainerUid?: string | null;
  rightContainerUid?: string | null;
  leftBuretteVolume?: number;
  leftBuretteMax?: number;
  leftBuretteOpen?: boolean;
  leftBuretteColor?: string;
  rightBuretteVolume?: number;
  rightBuretteMax?: number;
  rightBuretteOpen?: boolean;
  rightBuretteColor?: string;
  leftContainerVolume?: number;
  leftContainerMax?: number;
  leftContainerColor?: string;
  rightContainerVolume?: number;
  rightContainerMax?: number;
  rightContainerColor?: string;
}
withDefaults(defineProps<Props>(), {
  topClampY: 60,
  bottomClampY: 160,
  hasLeftBurette: false,
  hasRightBurette: false,
  hasLeftContainer: false,
  hasRightContainer: false,
  hasHeatingDevice: false,
  leftBuretteUid: null,
  rightBuretteUid: null,
  leftContainerUid: null,
  rightContainerUid: null,
  leftBuretteVolume: 50,
  leftBuretteMax: 50,
  leftBuretteOpen: false,
  leftBuretteColor: '#3b82f6',
  rightBuretteVolume: 50,
  rightBuretteMax: 50,
  rightBuretteOpen: false,
  rightBuretteColor: '#3b82f6',
  leftContainerVolume: 0,
  leftContainerMax: 250,
  leftContainerColor: '#3b82f6',
  rightContainerVolume: 0,
  rightContainerMax: 250,
  rightContainerColor: '#3b82f6',
});

const emit = defineEmits<{
  selectBurette: [uid: string];
  selectContainer: [uid: string];
}>();
</script>

<template>
  <div class="lab-retort-stand-assembly" :class="{ hovered: isHovered }">
    <!-- Burette 1 click overlay -->
    <div
      v-if="hasLeftBurette && leftBuretteUid"
      class="burette-click-zone"
      style="left: 15px; top: 60px; width: 30px; height: 75px;"
      @mousedown.stop="emit('selectBurette', leftBuretteUid)"
    />
    <!-- Burette 2 click overlay -->
    <div
      v-if="hasRightBurette && rightBuretteUid"
      class="burette-click-zone"
      style="left: 135px; top: 60px; width: 30px; height: 75px;"
      @mousedown.stop="emit('selectBurette', rightBuretteUid)"
    />
    <svg width="180" height="293" viewBox="0 0 160 260" style="pointer-events: none;">
      <!-- Heavy base -->
      <rect x="30" y="240" width="100" height="16" rx="4" fill="#374151" />
      <rect x="35" y="238" width="90" height="4" rx="2" fill="#6b7280" />

      <!-- Heating slot (on top of base) -->
      <ellipse cx="80" cy="238" rx="35" ry="6" fill="#1f2937" stroke="#374151" stroke-width="1" />
      <ellipse v-if="hasHeatingDevice" cx="80" cy="238" rx="30" ry="4" fill="#ef4444" opacity="0.2" />

      <!-- Vertical rod -->
      <rect x="76" y="20" width="8" height="220" rx="3" fill="#9ca3af" />
      <rect x="77" y="20" width="3" height="220" rx="1" fill="#d1d5db" opacity="0.4" />

      <!-- Rod foot (connection to base) -->
      <rect x="72" y="230" width="16" height="10" rx="2" fill="#4b5563" />

      <!-- Bottom double clamp (crossbar style like top clamp) -->
      <!-- Clamp crossbar -->
      <rect x="20" :y="bottomClampY - 3" width="120" height="6" rx="2" fill="#4b5563" />
      <rect x="20" :y="bottomClampY - 1" width="120" height="2" rx="1" fill="#6b7280" opacity="0.3" />

      <!-- Left bottom jaw (holds beaker under burette 1) -->
      <g :transform="`translate(20, ${bottomClampY})`">
        <path d="M -6,-12 L 6,-12 L 8,0 L -8,0 Z" fill="#1f2937" />
        <path d="M -6,12 L 6,12 L 8,0 L -8,0 Z" fill="#1f2937" />
        <!-- Beaker holder ring -->
        <ellipse cx="0" cy="12" rx="10" ry="3" fill="none" stroke="#4b5563" stroke-width="1" />
        <!-- Integrated Beaker sitting below clamp -->
        <g v-if="hasLeftContainer" :transform="`translate(0, 14)`">
          <path d="M -12,0 L -11,26 Q -11,30 0,30 Q 11,30 11,26 L 12,0 Z" fill="none" stroke="#3b82f6" stroke-width="0.8" opacity="0.7" />
          <rect x="-13" y="-2" width="26" height="3" rx="1" fill="#93c5fd" opacity="0.6" />
          <rect x="-11" :y="26 - (leftContainerVolume / leftContainerMax) * 26" width="22" :height="(leftContainerVolume / leftContainerMax) * 26" rx="1" :fill="leftContainerColor" opacity="0.35" />
          <line x1="-11" y1="8" x2="-8" y2="8" stroke="#64748b" stroke-width="0.5" />
          <line x1="-11" y1="16" x2="-8" y2="16" stroke="#64748b" stroke-width="0.5" />
          <line :x1="-14" :y1="26 - (leftContainerVolume / leftContainerMax) * 26" :x2="2" :y2="26 - (leftContainerVolume / leftContainerMax) * 26" stroke="#ef4444" stroke-width="1" />
          <!-- Volume badge (dark bg like burette) -->
          <rect :x="-28" :y="26 - (leftContainerVolume / leftContainerMax) * 26 - 5" width="20" height="8" rx="2" fill="#1e293b" opacity="0.95" />
          <text :x="-18" :y="26 - (leftContainerVolume / leftContainerMax) * 26 + 1" font-size="5" fill="#fbbf24" font-weight="bold" text-anchor="middle">{{ leftContainerVolume.toFixed(0) }}ml</text>
        </g>
        <g v-else :transform="`translate(0, 14)`">
          <rect x="-6" y="-2" width="12" height="10" rx="1" fill="#d1d5db" opacity="0.15" stroke="#9ca3af" stroke-dasharray="2,2" />
        </g>
      </g>
      <!-- Right bottom jaw (holds beaker under burette 2) -->
      <g :transform="`translate(140, ${bottomClampY})`">
        <path d="M -6,-12 L 6,-12 L 8,0 L -8,0 Z" fill="#1f2937" />
        <path d="M -6,12 L 6,12 L 8,0 L -8,0 Z" fill="#1f2937" />
        <!-- Beaker holder ring -->
        <ellipse cx="0" cy="12" rx="10" ry="3" fill="none" stroke="#4b5563" stroke-width="1" />
        <!-- Integrated Beaker sitting below clamp -->
        <g v-if="hasRightContainer" :transform="`translate(0, 14)`">
          <path d="M -12,0 L -11,26 Q -11,30 0,30 Q 11,30 11,26 L 12,0 Z" fill="none" stroke="#3b82f6" stroke-width="0.8" opacity="0.7" />
          <rect x="-13" y="-2" width="26" height="3" rx="1" fill="#93c5fd" opacity="0.6" />
          <rect x="-11" :y="26 - (rightContainerVolume / rightContainerMax) * 26" width="22" :height="(rightContainerVolume / rightContainerMax) * 26" rx="1" :fill="rightContainerColor" opacity="0.35" />
          <line x1="-11" y1="8" x2="-8" y2="8" stroke="#64748b" stroke-width="0.5" />
          <line x1="-11" y1="16" x2="-8" y2="16" stroke="#64748b" stroke-width="0.5" />
          <line :x1="-2" :y1="26 - (rightContainerVolume / rightContainerMax) * 26" :x2="14" :y2="26 - (rightContainerVolume / rightContainerMax) * 26" stroke="#ef4444" stroke-width="1" />
          <!-- Volume badge (dark bg like burette) -->
          <rect :x="8" :y="26 - (rightContainerVolume / rightContainerMax) * 26 - 5" width="20" height="8" rx="2" fill="#1e293b" opacity="0.95" />
          <text :x="18" :y="26 - (rightContainerVolume / rightContainerMax) * 26 + 1" font-size="5" fill="#fbbf24" font-weight="bold" text-anchor="middle">{{ rightContainerVolume.toFixed(0) }}ml</text>
        </g>
        <g v-else :transform="`translate(0, 14)`">
          <rect x="-6" y="-2" width="12" height="10" rx="1" fill="#d1d5db" opacity="0.15" stroke="#9ca3af" stroke-dasharray="2,2" />
        </g>
      </g>

      <!-- Top double clamp sleeve -->
      <rect x="64" :y="topClampY - 8" width="32" height="16" rx="2" fill="#4b5563" />
      <rect x="66" :y="topClampY - 6" width="28" height="4" rx="1" fill="#6b7280" />

      <!-- Left jaw (burette 1) -->
      <g :transform="`translate(20, ${topClampY})`" style="cursor: pointer;" @click.stop="leftBuretteUid && emit('selectBurette', leftBuretteUid)">
        <!-- Jaw -->
        <path d="M -6,-12 L 6,-12 L 8,0 L -8,0 Z" fill="#1f2937" />
        <path d="M -6,12 L 6,12 L 8,0 L -8,0 Z" fill="#1f2937" />
        <!-- Burette (full shape when attached) -->
        <g v-if="hasLeftBurette">
          <!-- Number badge above -->
          <circle cx="0" cy="-62" r="7" fill="#3b82f6" />
          <text x="0" y="-59" text-anchor="middle" fill="white" font-size="9" font-weight="bold">1</text>
          <!-- Funnel top -->
          <path d="M -5,-55 L 5,-55 L 3,-48 L -3,-48 Z" fill="#93c5fd" />
          <!-- Body outline (glass) -->
          <rect x="-3" y="-48" width="6" height="42" rx="1" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.6" />
          <!-- Liquid fill (dynamic height, actual color) -->
          <rect x="-2.5" :y="-6 - (leftBuretteVolume / leftBuretteMax) * 42" width="5" :height="(leftBuretteVolume / leftBuretteMax) * 42" rx="0.5" :fill="leftBuretteColor || '#3b82f6'" opacity="0.5" />
          <!-- Graduations -->
          <line v-for="n in 4" :key="n" :x1="-3" :y1="-44 + n * 8" :x2="0" :y2="-44 + n * 8" stroke="#64748b" stroke-width="0.5" />
          <!-- Meniscus red indicator line (extends right, clearer) -->
          <line :x1="-2" :y1="-6 - (leftBuretteVolume / leftBuretteMax) * 42" :x2="12" :y2="-6 - (leftBuretteVolume / leftBuretteMax) * 42" stroke="#dc2626" stroke-width="1.2" />
          <!-- Volume reading number (on right side, dark bg) -->
          <rect :x="4" :y="-6 - (leftBuretteVolume / leftBuretteMax) * 42 - 5" width="16" height="7" rx="2" fill="#1e293b" opacity="0.9" />
          <text :x="12" :y="-6 - (leftBuretteVolume / leftBuretteMax) * 42" font-size="5" fill="#fbbf24" text-anchor="middle" font-weight="bold">{{ leftBuretteVolume.toFixed(1) }}</text>
          <!-- Stopcock -->
          <circle cx="0" cy="-6" r="3" fill="#374151" />
          <rect x="-1" y="-6" width="4" height="2" fill="#3b82f6" transform="rotate(45, 0, -6)" />
          <!-- Tip -->
          <path d="M -1,-6 L 1,-6 L 0,2 Z" fill="#9ca3af" />
        </g>
        <g v-else>
          <rect x="-2" y="-18" width="4" height="18" rx="1" fill="#d1d5db" opacity="0.2" stroke="#9ca3af" />
          <text x="0" y="22" text-anchor="middle" fill="#6b7280" font-size="6">1</text>
        </g>
      </g>

      <!-- Right jaw (burette 2) -->
      <g :transform="`translate(140, ${topClampY})`" style="cursor: pointer;" @click.stop="rightBuretteUid && emit('selectBurette', rightBuretteUid)">
        <!-- Jaw -->
        <path d="M -6,-12 L 6,-12 L 8,0 L -8,0 Z" fill="#1f2937" />
        <path d="M -6,12 L 6,12 L 8,0 L -8,0 Z" fill="#1f2937" />
        <!-- Burette (full shape when attached) -->
        <g v-if="hasRightBurette">
          <!-- Number badge above -->
          <circle cx="0" cy="-62" r="7" fill="#3b82f6" />
          <text x="0" y="-59" text-anchor="middle" fill="white" font-size="9" font-weight="bold">2</text>
          <!-- Funnel top -->
          <path d="M -5,-55 L 5,-55 L 3,-48 L -3,-48 Z" fill="#93c5fd" />
          <!-- Body outline (glass) -->
          <rect x="-3" y="-48" width="6" height="42" rx="1" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.6" />
          <!-- Liquid fill (dynamic height, actual color) -->
          <rect x="-2.5" :y="-6 - (rightBuretteVolume / rightBuretteMax) * 42" width="5" :height="(rightBuretteVolume / rightBuretteMax) * 42" rx="0.5" :fill="rightBuretteColor || '#3b82f6'" opacity="0.5" />
          <!-- Graduations -->
          <line v-for="n in 4" :key="n" :x1="-3" :y1="-44 + n * 8" :x2="0" :y2="-44 + n * 8" stroke="#64748b" stroke-width="0.5" />
          <!-- Meniscus red indicator line (extends left, clearer) -->
          <line :x1="-12" :y1="-6 - (rightBuretteVolume / rightBuretteMax) * 42" :x2="2" :y2="-6 - (rightBuretteVolume / rightBuretteMax) * 42" stroke="#dc2626" stroke-width="1.2" />
          <!-- Volume reading number (on left side, dark bg) -->
          <rect :x="-20" :y="-6 - (rightBuretteVolume / rightBuretteMax) * 42 - 5" width="16" height="7" rx="2" fill="#1e293b" opacity="0.9" />
          <text :x="-12" :y="-6 - (rightBuretteVolume / rightBuretteMax) * 42" font-size="5" fill="#fbbf24" text-anchor="middle" font-weight="bold">{{ rightBuretteVolume.toFixed(1) }}</text>
          <!-- Stopcock -->
          <circle cx="0" cy="-6" r="3" fill="#374151" />
          <rect x="-1" y="-6" width="4" height="2" fill="#3b82f6" transform="rotate(45, 0, -6)" />
          <!-- Tip -->
          <path d="M -1,-6 L 1,-6 L 0,2 Z" fill="#9ca3af" />
        </g>
        <g v-else>
          <rect x="-2" y="-18" width="4" height="18" rx="1" fill="#d1d5db" opacity="0.2" stroke="#9ca3af" />
          <text x="0" y="22" text-anchor="middle" fill="#6b7280" font-size="6">2</text>
        </g>
      </g>

      <!-- Clamp crossbar -->
      <rect x="20" :y="topClampY - 3" width="120" height="6" rx="2" fill="#4b5563" />
      <rect x="20" :y="topClampY - 1" width="120" height="2" rx="1" fill="#6b7280" opacity="0.3" />

      <!-- Vertical movement hint arrows -->
      <polygon :points="`78,${topClampY - 14} 82,${topClampY - 14} 80,${topClampY - 18}`" fill="#9ca3af" opacity="0.5" />
      <polygon :points="`78,${bottomClampY + 14} 82,${bottomClampY + 14} 80,${bottomClampY + 18}`" fill="#9ca3af" opacity="0.5" />
    </svg>
    <!-- Hidden label to avoid double display -->
    <span v-if="false" class="tool-label">حامل المختبر</span>
  </div>
</template>

<style scoped>
.lab-retort-stand-assembly {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px;
  position: relative;
}
.lab-retort-stand-assembly.hovered {
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.3));
}
.tool-label {
  font-size: 0.65rem;
  color: #64748b;
  white-space: nowrap;
}
.burette-click-zone {
  position: absolute;
  cursor: pointer;
  z-index: 10;
  pointer-events: all;
}
</style>
