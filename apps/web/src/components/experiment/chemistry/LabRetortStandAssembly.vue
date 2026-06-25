<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { items, retortStandMap } from '../../../composables/chemistry/useChemistryLab';

interface Props {
  isHovered: boolean;
  itemUid: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ mousedown: [e: MouseEvent]; }>();

const clampDragging = ref(false);
const clampStartY = ref(0);
const clampStartTop = ref(0);
const clampPrevY = ref(60);
const clampY = computed(() => retortStandMap[props.itemUid]?.topClampY ?? 60);

onMounted(() => {
  if (!retortStandMap[props.itemUid]) {
    retortStandMap[props.itemUid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160 };
  }
});

function onClampMouseDown(e: MouseEvent) {
  e.stopPropagation();
  clampDragging.value = true;
  clampStartY.value = e.clientY;
  clampStartTop.value = clampY.value;
  clampPrevY.value = clampY.value;
  window.addEventListener('mousemove', onClampMove);
  window.addEventListener('mouseup', onClampUp);
}

function onClampMove(e: MouseEvent) {
  if (!clampDragging.value) return;
  if (!retortStandMap[props.itemUid]) {
    retortStandMap[props.itemUid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160 };
  }
  const dy = e.clientY - clampStartY.value;
  const newY = Math.max(20, Math.min(280, clampStartTop.value + dy));
  const clampDeltaY = newY - clampPrevY.value;
  clampPrevY.value = newY;
  retortStandMap[props.itemUid].topClampY = newY;
  // Sync attached burette Y positions by clamp movement
  const st = retortStandMap[props.itemUid];
  for (const uid of [st.leftBuretteUid, st.rightBuretteUid].filter(Boolean) as string[]) {
    const burette = items.value.find(i => i.uid === uid);
    if (burette) burette.y += clampDeltaY;
  }
}

function onClampUp() {
  clampDragging.value = false;
  window.removeEventListener('mousemove', onClampMove);
  window.removeEventListener('mouseup', onClampUp);
}
</script>

<template>
  <div class="retort-stand" :class="{ hovered: isHovered }">
    <!-- 1. القاعدة (Base) — bounding box خاص بها -->
    <svg class="stand-part" width="168" height="35" viewBox="0 0 168 35" style="left: 11px; top: 310px;" @mousedown="emit('mousedown', $event)">
      <defs>
        <linearGradient id="baseDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4b5563" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
      </defs>
      <path d="M 13 0 L 155 0 L 168 15 L 155 30 L 13 30 L 0 15 Z" fill="url(#baseDark)" stroke="#374151" stroke-width="1.5" />
      <path d="M 13 0 L 155 0 L 168 15 L 0 15 Z" fill="#6b7280" opacity="0.5" />
      <path d="M 0 15 L 13 30 L 155 30 L 168 15" fill="none" stroke="#0f172a" stroke-width="1" opacity="0.5" />
    </svg>

    <!-- 2. الساق (Rod) — bounding box خاص بها -->
    <svg class="stand-part" width="7" height="298" viewBox="0 0 7 298" style="left: 47px; top: 15px;" @mousedown="emit('mousedown', $event)">
      <defs>
        <linearGradient id="rodMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#6b7280" />
          <stop offset="25%" stop-color="#e5e7eb" />
          <stop offset="50%" stop-color="#d1d5db" />
          <stop offset="75%" stop-color="#9ca3af" />
          <stop offset="100%" stop-color="#4b5563" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="7" height="298" rx="3.5" fill="url(#rodMetal)" stroke="#6b7280" stroke-width="0.5" />
      <rect x="1" y="2" width="2.5" height="294" rx="1.25" fill="rgba(255,255,255,0.35)" />
      <rect x="4" y="2" width="1.5" height="294" rx="0.75" fill="rgba(0,0,0,0.15)" />
    </svg>

    <!-- 3. المشبك العلوي (Top Clamp) — bounding box خاص بها -->
    <svg class="stand-part clamp-part" width="86" height="28" viewBox="0 0 86 28" :style="{ left: '54px', top: clampY + 'px' }" @mousedown="onClampMouseDown">
      <rect x="0" y="10" width="72" height="8" rx="2" fill="#374151" stroke="#4b5563" stroke-width="0.5" />
      <rect x="0" y="15" width="72" height="3" rx="1" fill="rgba(0,0,0,0.25)" />
      <rect x="64" y="0" width="14" height="28" rx="3" fill="#1f2937" stroke="#4b5563" stroke-width="1" />
      <ellipse cx="71" cy="14" rx="4.5" ry="9" fill="#9ca3af" stroke="#6b7280" stroke-width="0.5" />
      <circle cx="12" cy="14" r="2.5" fill="#6b7280" stroke="#374151" stroke-width="0.5" />
      <circle cx="32" cy="14" r="2.5" fill="#6b7280" stroke="#374151" stroke-width="0.5" />
      <circle cx="52" cy="14" r="2.5" fill="#6b7280" stroke="#374151" stroke-width="0.5" />
    </svg>
  </div>
</template>

<style scoped>
.retort-stand {
  position: relative;
  width: 190px;
  height: 350px;
  pointer-events: none;
}
.stand-part {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
}
.retort-stand.hovered .stand-part {
  filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.35));
}
</style>
