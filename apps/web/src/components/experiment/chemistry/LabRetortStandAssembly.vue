<script setup lang="ts">
import { items, getBurette, getPipette, getLiquid, isBurette, isPipette, isGradCylinder } from '../../../composables/chemistry/useChemistryLab';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import { isBeaker } from '../../../composables/chemistry/chemLabIds';
import { useRetortStandAssembly } from '../../../composables/chemistry/useRetortStandAssembly';
import LabBurette from './LabBurette.vue';
import LabPipette from './LabPipette.vue';
import LabGradCylinder from './LabGradCylinder.vue';
import LabBeaker from './LabBeaker.vue';
import './LabRetortStandAssembly.css';

interface Props {
  isHovered: boolean;
  itemUid: string;
  selectedBuretteUid?: string;
  draggingUid?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ mousedown: [e: MouseEvent]; buretteClick: [e: MouseEvent, uid: string]; }>();

const {
  st, clampY, bottomClampX, bottomClampY, isSnapTarget, isTopSnapTarget,
  topClampLocked, bottomClampLocked, baseLocked, attachedItems,
  topAnalogDragging, topAnalogOffset, bottomAnalogDragging,
  bottomAnalogOffsetX, bottomAnalogOffsetY,
  onClampMouseDown, onBottomClampMouseDown,
  onTopAnalogDown, onBottomAnalogDown,
  onBaseOrRodMouseDown, onRetortStandMouseDown, onAttachedMouseDown,
  toggleTopClampLock, toggleBottomClampLock, toggleBaseLock,
  getAttachedStyle,
} = useRetortStandAssembly(
  props.itemUid,
  (e) => emit('mousedown', e),
  (e, uid) => emit('buretteClick', e, uid)
);
</script>

<template>
  <div class="retort-stand" :class="{ hovered: isHovered }" @mousedown="onRetortStandMouseDown">
    <!-- 1. القاعدة (Base) — bounding box خاص بها -->
    <svg class="stand-part" width="168" height="35" viewBox="0 0 168 35" style="left: 11px; top: 310px;" @mousedown.stop="onBaseOrRodMouseDown($event)">
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
    <svg class="stand-part" width="7" height="298" viewBox="0 0 7 298" style="left: 47px; top: 15px;" @mousedown.stop="onBaseOrRodMouseDown($event)">
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

    <!-- Top clamp controls (left side row) -->
    <div class="control-row" :style="{ left: '2px', top: (clampY + 4) + 'px' }">
      <div class="analog-wrapper" :class="{ 'analog-active': topAnalogDragging, 'analog-locked': topClampLocked }" @mousedown.stop="onTopAnalogDown($event)">
        <svg class="analog" width="20" height="20" viewBox="0 0 20 20">
          <defs>
            <radialGradient id="ajBase" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stop-color="#374151"/>
              <stop offset="100%" stop-color="#111827"/>
            </radialGradient>
            <radialGradient id="ajKnob" cx="0.3" cy="0.3" r="0.6">
              <stop offset="0%" stop-color="#d1d5db"/>
              <stop offset="60%" stop-color="#6b7280"/>
              <stop offset="100%" stop-color="#374151"/>
            </radialGradient>
          </defs>
          <circle cx="10" cy="10" r="9" fill="url(#ajBase)" stroke="#4b5563" stroke-width="0.5"/>
          <circle :cx="10" :cy="10 + (topAnalogOffset * 0.6)" r="3.5" fill="url(#ajKnob)"/>
        </svg>
      </div>
      <button class="lock-btn" :class="{ locked: topClampLocked }" @click.stop="toggleTopClampLock" title="قفل/فتح">
        <svg v-if="topClampLocked" width="10" height="10" viewBox="0 0 12 12"><rect x="1" y="5" width="10" height="6" rx="1" fill="#ef4444"/><path d="M3 5V3A3 3 0 0 1 9 3V5" fill="none" stroke="#ef4444" stroke-width="1.5"/></svg>
        <svg v-else width="10" height="10" viewBox="0 0 12 12"><rect x="1" y="5" width="10" height="6" rx="1" fill="#10b981"/><path d="M3 5V3A3 3 0 0 1 9 3" fill="none" stroke="#10b981" stroke-width="1.5"/></svg>
      </button>
    </div>

    <!-- 3. المشبك العلوي (Top Clamp) — bounding box خاص بها -->
    <svg class="stand-part clamp-part" :class="{ 'snap-target': isTopSnapTarget }" width="172" height="28" viewBox="0 0 172 28" :style="{ left: '54px', top: clampY + 'px' }" @mousedown="onClampMouseDown">
      <rect x="0" y="10" width="158" height="8" rx="2" fill="#374151" stroke="#4b5563" stroke-width="0.5" />
      <rect x="0" y="15" width="158" height="3" rx="1" fill="rgba(0,0,0,0.25)" />
      <rect x="158" y="0" width="14" height="28" rx="3" fill="#1f2937" stroke="#4b5563" stroke-width="1" />
      <ellipse cx="165" cy="14" rx="4.5" ry="9" fill="#9ca3af" stroke="#6b7280" stroke-width="0.5" />
      <circle cx="30" cy="14" r="2.5" fill="#ef4444" stroke="#b91c1c" stroke-width="0.5" />
      <circle cx="79" cy="14" r="2.5" fill="#ef4444" stroke="#b91c1c" stroke-width="0.5" />
      <circle cx="128" cy="14" r="2.5" fill="#ef4444" stroke="#b91c1c" stroke-width="0.5" />
      <text v-if="isTopSnapTarget" x="86" y="12" fill="#22c55e" font-size="9" font-weight="bold" text-anchor="middle" style="pointer-events:none">Snap!</text>
    </svg>

    <!-- Bottom clamp controls (left side row) -->
    <div class="control-row" :style="{ left: '2px', top: (bottomClampY + 4) + 'px' }">
      <div class="analog-wrapper" :class="{ 'analog-active': bottomAnalogDragging, 'analog-locked': bottomClampLocked }" @mousedown.stop="onBottomAnalogDown($event)">
        <svg class="analog" width="20" height="20" viewBox="0 0 20 20">
          <defs>
            <radialGradient id="ajBase2" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stop-color="#374151"/>
              <stop offset="100%" stop-color="#111827"/>
            </radialGradient>
            <radialGradient id="ajKnob2" cx="0.3" cy="0.3" r="0.6">
              <stop offset="0%" stop-color="#d1d5db"/>
              <stop offset="60%" stop-color="#6b7280"/>
              <stop offset="100%" stop-color="#374151"/>
            </radialGradient>
          </defs>
          <circle cx="10" cy="10" r="9" fill="url(#ajBase2)" stroke="#4b5563" stroke-width="0.5"/>
          <circle :cx="10 + (bottomAnalogOffsetX * 0.6)" :cy="10 + (bottomAnalogOffsetY * 0.6)" r="3.5" fill="url(#ajKnob2)"/>
        </svg>
      </div>
      <button class="lock-btn" :class="{ locked: bottomClampLocked }" @click.stop="toggleBottomClampLock" title="قفل/فتح">
        <svg v-if="bottomClampLocked" width="10" height="10" viewBox="0 0 12 12"><rect x="1" y="5" width="10" height="6" rx="1" fill="#ef4444"/><path d="M3 5V3A3 3 0 0 1 9 3V5" fill="none" stroke="#ef4444" stroke-width="1.5"/></svg>
        <svg v-else width="10" height="10" viewBox="0 0 12 12"><rect x="1" y="5" width="10" height="6" rx="1" fill="#10b981"/><path d="M3 5V3A3 3 0 0 1 9 3" fill="none" stroke="#10b981" stroke-width="1.5"/></svg>
      </button>
    </div>

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
      v-for="{ uid, slotOffset, slotIndex, item } in attachedItems.filter(({ uid }) => uid !== props.draggingUid)"
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

    <!-- Base controls (left side row) -->
    <div class="control-row" style="left: -2px; top: 320px;">
      <button class="lock-btn" :class="{ locked: baseLocked }" @click.stop="toggleBaseLock" title="قفل/فتح">
        <svg v-if="baseLocked" width="10" height="10" viewBox="0 0 12 12"><rect x="1" y="5" width="10" height="6" rx="1" fill="#ef4444"/><path d="M3 5V3A3 3 0 0 1 9 3V5" fill="none" stroke="#ef4444" stroke-width="1.5"/></svg>
        <svg v-else width="10" height="10" viewBox="0 0 12 12"><rect x="1" y="5" width="10" height="6" rx="1" fill="#10b981"/><path d="M3 5V3A3 3 0 0 1 9 3" fill="none" stroke="#10b981" stroke-width="1.5"/></svg>
      </button>
    </div>

    <!-- 5. البيكر الملتصق بالمشبك السفلي -->
    <div
      v-if="st?.bottomSlotOccupant && st.bottomSlotOccupant !== props.draggingUid"
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
          v-if="isBeaker(items.find((i: LabItem) => i.uid === st?.bottomSlotOccupant)?.id || '')"
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

