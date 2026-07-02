<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { items, retortStandMap, getBurette, getPipette, getLiquid, isBurette, isPipette, isGradCylinder } from '../../../composables/chemistry/useChemistryLab';
import { isBeaker } from '../../../composables/chemistry/chemLabIds';
import { bottomClampSnapUid } from '../../../composables/chemistry/useWorkspaceDrag';
import LabBurette from './LabBurette.vue';
import LabPipette from './LabPipette.vue';
import LabGradCylinder from './LabGradCylinder.vue';
import LabBeaker from './LabBeaker.vue';

interface Props {
  isHovered: boolean;
  itemUid: string;
  selectedBuretteUid?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ mousedown: [e: MouseEvent]; buretteClick: [e: MouseEvent, uid: string]; }>();

const clampDragging = ref(false);
const clampStartY = ref(0);
const clampStartTop = ref(0);
const clampPrevY = ref(60);
const clampY = computed(() => retortStandMap[props.itemUid]?.topClampY ?? 60);

const bottomClampDragging = ref(false);
const bottomClampStartX = ref(0);
const bottomClampStartLeft = ref(0);
const bottomClampStartY = ref(0);
const bottomClampStartTop = ref(0);
const bottomClampPrevX = ref(0);
const bottomClampPrevY = ref(160);
const bottomClampX = computed(() => retortStandMap[props.itemUid]?.bottomClampX ?? 0);
const bottomClampY = computed(() => retortStandMap[props.itemUid]?.bottomClampY ?? 160);
const isSnapTarget = computed(() => bottomClampSnapUid.value === props.itemUid);

const st = computed(() => retortStandMap[props.itemUid]);

const attachedItems = computed(() => {
  const stand = st.value;
  if (!stand) return [];
  const result: { uid: string; slotOffset: number; slotIndex: number; item: any }[] = [];
  for (let i = 0; i < stand.slotOffsets.length; i++) {
    const uid = stand.slotOccupants[i];
    if (uid) {
      const item = items.value.find(i => i.uid === uid);
      if (item) result.push({ uid, slotOffset: stand.slotOffsets[i], slotIndex: i, item });
    }
  }
  return result;
});

function getAttachedStyle(id: string, slotOffset: number) {
  if (isBurette(id)) {
    return {
      left: (54 + slotOffset - 28.5) + 'px',
      top: (clampY.value + 14 - 52) + 'px',
      width: '57px',
      height: '198px',
    };
  }
  if (isPipette(id)) {
    return {
      left: (54 + slotOffset - 16.75) + 'px',
      top: (clampY.value + 14 - 55) + 'px',
      width: '34px',
      height: '154px',
    };
  }
  if (isGradCylinder(id)) {
    return {
      left: (54 + slotOffset - 25.1) + 'px',
      top: (clampY.value + 14 - 36.9) + 'px',
      width: '50px',
      height: '106px',
    };
  }
  return { left: '0px', top: '0px', width: '50px', height: '150px' };
}

function onAttachedMouseDown(e: MouseEvent, uid: string) {
  e.stopPropagation();
  emit('buretteClick', e, uid);
}

onMounted(() => {
  if (!retortStandMap[props.itemUid]) {
    retortStandMap[props.itemUid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160, bottomClampX: 0, slotOffsets: [30, 79, 128], slotOccupants: [null, null, null], bottomSlotOccupant: null };
  }
});

function onClampMouseDown(e: MouseEvent) {
  e.stopPropagation();
  e.stopImmediatePropagation();
  e.preventDefault();
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
    retortStandMap[props.itemUid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160, bottomClampX: 0, slotOffsets: [30, 79, 128], slotOccupants: [null, null, null], bottomSlotOccupant: null };
  }
  const dy = e.clientY - clampStartY.value;
  const newY = Math.max(20, Math.min(280, clampStartTop.value + dy));
  const clampDeltaY = newY - clampPrevY.value;
  clampPrevY.value = newY;
  retortStandMap[props.itemUid].topClampY = newY;
  // Sync attached burette Y positions
  const st = retortStandMap[props.itemUid];
  for (const uid of st.slotOccupants.filter(Boolean) as string[]) {
    const burette = items.value.find(i => i.uid === uid);
    if (burette) burette.y += clampDeltaY;
  }
}

function onClampUp() {
  clampDragging.value = false;
  window.removeEventListener('mousemove', onClampMove);
  window.removeEventListener('mouseup', onClampUp);
}

/* ---- Bottom clamp (ring clamp for beaker) ---- */
function onBottomClampMouseDown(e: MouseEvent) {
  e.stopPropagation();
  e.stopImmediatePropagation();
  e.preventDefault();
  bottomClampDragging.value = true;
  bottomClampStartX.value = e.clientX;
  bottomClampStartLeft.value = bottomClampX.value;
  bottomClampStartY.value = e.clientY;
  bottomClampStartTop.value = bottomClampY.value;
  bottomClampPrevX.value = bottomClampX.value;
  bottomClampPrevY.value = bottomClampY.value;
  window.addEventListener('mousemove', onBottomClampMove);
  window.addEventListener('mouseup', onBottomClampUp);
}

function onBottomClampMove(e: MouseEvent) {
  if (!bottomClampDragging.value) return;
  if (!retortStandMap[props.itemUid]) {
    retortStandMap[props.itemUid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160, bottomClampX: 0, slotOffsets: [30, 79, 128], slotOccupants: [null, null, null], bottomSlotOccupant: null };
  }
  // Horizontal move
  const dx = e.clientX - bottomClampStartX.value;
  const newX = Math.max(-100, Math.min(35, bottomClampStartLeft.value + dx));
  const clampDeltaX = newX - bottomClampPrevX.value;
  bottomClampPrevX.value = newX;
  retortStandMap[props.itemUid].bottomClampX = newX;
  // Vertical move
  const dy = e.clientY - bottomClampStartY.value;
  const newY = Math.max(90, Math.min(300, bottomClampStartTop.value + dy));
  const clampDeltaY = newY - bottomClampPrevY.value;
  bottomClampPrevY.value = newY;
  retortStandMap[props.itemUid].bottomClampY = newY;
  // Sync attached beaker position
  const st = retortStandMap[props.itemUid];
  if (st.bottomSlotOccupant) {
    const beaker = items.value.find(i => i.uid === st.bottomSlotOccupant);
    if (beaker) {
      beaker.x += clampDeltaX;
      beaker.y += clampDeltaY;
    }
  }
}

function onBottomClampUp() {
  bottomClampDragging.value = false;
  window.removeEventListener('mousemove', onBottomClampMove);
  window.removeEventListener('mouseup', onBottomClampUp);
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onClampMove);
  window.removeEventListener('mouseup', onClampUp);
  window.removeEventListener('mousemove', onBottomClampMove);
  window.removeEventListener('mouseup', onBottomClampUp);
});
</script>

<template>
  <div class="retort-stand" :class="{ hovered: isHovered }" @mousedown="emit('mousedown', $event)">
    <!-- 1. القاعدة (Base) — bounding box خاص بها -->
    <svg class="stand-part" width="168" height="35" viewBox="0 0 168 35" style="left: 11px; top: 310px;" @mousedown.stop="emit('mousedown', $event)">
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
    <svg class="stand-part" width="7" height="298" viewBox="0 0 7 298" style="left: 47px; top: 15px;" @mousedown.stop="emit('mousedown', $event)">
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
    <svg class="stand-part clamp-part" width="172" height="28" viewBox="0 0 172 28" :style="{ left: '54px', top: clampY + 'px' }" @mousedown="onClampMouseDown">
      <rect x="0" y="10" width="158" height="8" rx="2" fill="#374151" stroke="#4b5563" stroke-width="0.5" />
      <rect x="0" y="15" width="158" height="3" rx="1" fill="rgba(0,0,0,0.25)" />
      <rect x="158" y="0" width="14" height="28" rx="3" fill="#1f2937" stroke="#4b5563" stroke-width="1" />
      <ellipse cx="165" cy="14" rx="4.5" ry="9" fill="#9ca3af" stroke="#6b7280" stroke-width="0.5" />
      <circle cx="30" cy="14" r="2.5" fill="#ef4444" stroke="#b91c1c" stroke-width="0.5" />
      <circle cx="79" cy="14" r="2.5" fill="#ef4444" stroke="#b91c1c" stroke-width="0.5" />
      <circle cx="128" cy="14" r="2.5" fill="#ef4444" stroke="#b91c1c" stroke-width="0.5" />
    </svg>

    <!-- 3b. المشبك السفلي (Bottom Ring Clamp) — bounding box خاص بها -->
    <svg class="stand-part clamp-part" :class="{ 'snap-target': isSnapTarget }" width="240" height="50" viewBox="0 0 240 50" :style="{ left: '45px', top: (bottomClampY - 10) + 'px', overflow: 'visible' }" @mousedown="onBottomClampMouseDown">
      <!-- Rod sleeve (ثابت على القضيب) -->
      <rect x="0" y="8" width="14" height="20" rx="3" fill="#374151" stroke="#4b5563" stroke-width="0.5" />
      <rect x="2" y="10" width="4" height="4" rx="1" fill="#6b7280" />
      <!-- Grip hint على السكينة -->
      <circle cx="7" cy="18" r="3" fill="#10b981" opacity="0.2" />
      <!-- الذراع الطويلة المتصلة بالقضيب -->
      <rect x="12" y="16" :width="Math.max(0, 120 + bottomClampX)" height="5" rx="2" fill="#4b5563" />
      <rect x="12" y="16" :width="Math.max(0, 120 + bottomClampX)" height="2" rx="1" fill="#6b7280" opacity="0.4" />
      <!-- الحلقة في نهاية الذراع (تتحرك أفقياً) -->
      <g :style="{ transform: 'translateX(' + bottomClampX + 'px)' }">
        <ellipse cx="132" cy="24" rx="18" ry="6" fill="none" stroke="#1f2937" stroke-width="2.5" />
        <ellipse cx="132" cy="24" rx="16" ry="4" fill="none" stroke="#6b7280" stroke-width="0.8" opacity="0.5" />
      </g>
    </svg>

    <!-- 4. الأدوات الملتصقة بالمشبك العلوي -->
    <div
      v-for="{ uid, slotOffset, slotIndex, item } in attachedItems"
      :key="uid"
      class="attached-item"
      :class="{ selected: props.selectedBuretteUid === uid }"
      :style="getAttachedStyle(item.id, slotOffset)"
    >
      <div class="attached-inner" @mousedown="onAttachedMouseDown($event, uid)">
        <LabBurette
          v-if="isBurette(item.id)"
          :volume="getBurette(uid).volume"
          :max-volume="getBurette(uid).maxVolume"
          :liquid-color="getBurette(uid).color"
          :liquid-opacity="getBurette(uid).opacity"
          :is-open="getBurette(uid).valveOpen"
          :is-hovered="false"
          :scale="0.67"
          :is-selected="props.selectedBuretteUid === uid"
        />
        <LabPipette
          v-else-if="isPipette(item.id)"
          :volume="getPipette(uid).volume"
          :max-volume="getPipette(uid).maxVolume"
          :liquid-color="getPipette(uid).color"
          :liquid-opacity="getPipette(uid).opacity"
          :is-hovered="false"
          :scale="0.67"
          :is-selected="props.selectedBuretteUid === uid"
        />
        <LabGradCylinder
          v-else-if="isGradCylinder(item.id)"
          :volume="getLiquid(uid).volume"
          :max-volume="getLiquid(uid).maxVolume"
          :liquid-color="getLiquid(uid).color"
          :liquid-opacity="getLiquid(uid).opacity"
          :is-hovered="false"
          :scale="0.67"
          :is-selected="props.selectedBuretteUid === uid"
        />
      </div>
    </div>

    <!-- 5. البيكر الملتصق بالمشبك السفلي -->
    <div
      v-if="st?.bottomSlotOccupant"
      class="attached-item"
      :style="{
        left: (45 + 132 - 35 + bottomClampX) + 'px',
        top: (bottomClampY + 14 - 50) + 'px',
        width: '70px',
        height: '100px'
      }"
    >
      <div class="attached-inner" @mousedown="onAttachedMouseDown($event, st.bottomSlotOccupant)">
        <LabBeaker
          v-if="isBeaker(items.find(i => i.uid === st.bottomSlotOccupant)?.id || '')"
          :volume="getLiquid(st.bottomSlotOccupant).volume"
          :max-volume="getLiquid(st.bottomSlotOccupant).maxVolume"
          :liquid-color="getLiquid(st.bottomSlotOccupant).color"
          :liquid-opacity="getLiquid(st.bottomSlotOccupant).opacity"
          :is-hovered="false"
          :scale="0.5"
          :item-uid="st.bottomSlotOccupant"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.retort-stand {
  position: relative;
  width: 190px;
  height: 350px;
}
.stand-part {
  position: absolute;
  pointer-events: visiblePainted;
  cursor: pointer;
}
.attached-item {
  position: absolute;
  pointer-events: none;
  overflow: visible;
}
.attached-inner {
  display: inline-block;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  cursor: grab;
}
.attached-inner:active {
  cursor: grabbing;
}
.clamp-part.snap-target {
  filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.6));
}
.clamp-part.snap-target ellipse[stroke="#1f2937"] {
  stroke: #10b981;
  stroke-width: 3;
}
</style>
