<script setup lang="ts">
import { computed } from 'vue';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import {
  getLiquid, getBurette, getPipette, getSepFunnelState, getBurnerState, getItemZoom, getBeakerClampState, getHotPlateState, beakerClampMap, pourFlowMap, tiltAngleMap, rackSlotsMap,
  isContainer, isBeaker, isTestTube, isTestTubeRack, isBurette, isPipette, isErlenmeyer, isVolumetricFlask, isRoundBottomFlask,
  isSeparatoryFunnel, isGradCylinder, isBunsenBurner, isHeatingMantle, isBalance, isPhMeter,
  isBeakerClamp, isWoodenBase, isHotPlate, isRetortStandAssembly
} from '../../../composables/chemistry/useChemistryLab';
import { getBalanceReading, getPhReading, isHeated } from '../../../composables/chemistry/useLabSimulation';
import LabTestTubeRack from './LabTestTubeRack.vue';
import ContainerRenderers from './ContainerRenderers.vue';
import LabBeaker from './LabBeaker.vue';
import LabBurette from './LabBurette.vue';
import LabPipette from './LabPipette.vue';
import LabVolumetricPipette from './LabVolumetricPipette.vue';
import LabSeparatoryFunnel from './LabSeparatoryFunnel.vue';
import LabBunsenBurner from './LabBunsenBurner.vue';
import LabHeatingMantle from './LabHeatingMantle.vue';
import LabBalance from './LabBalance.vue';
import LabPhMeter from './LabPhMeter.vue';
import LabDropper from './LabDropper.vue';
import LabSpatula from './LabSpatula.vue';
import LabWatchGlass from './LabWatchGlass.vue';
import LabFilterFunnel from './LabFilterFunnel.vue';
import LabRubberStopper from './LabRubberStopper.vue';
import LabWoodenBase from './LabWoodenBase.vue';
import LabBeakerClamp from './LabBeakerClamp.vue';
import LabHotPlate from './LabHotPlate.vue';
import LabRetortStandAssembly from './LabRetortStandAssembly.vue';


const props = defineProps<{
  item: LabItem;
  selectedUid: string | null;
  hoveredUid: string | null;
  receiving: boolean;
}>();

const emit = defineEmits<{
  mouseenter: [item: LabItem];
  mouseleave: [item: LabItem];
  mousedown: [e: MouseEvent, item: LabItem];
  mouthInteract: [item: LabItem];
  spill: [item: LabItem, amount: number];
  dropExited: [item: LabItem, wx: number, wy: number, color: string];
  toggleValve: [item: LabItem];
  tipInteract: [item: LabItem];
  toggleStopcock: [item: LabItem];
}>();

const liq = computed(() => getLiquid(props.item.uid));
const isSel = computed(() => props.selectedUid === props.item.uid);

const rackSlotData = computed(() => {
  const uids = rackSlotsMap[props.item.uid] || [];
  return uids.map(uid => {
    if (!uid) return null;
    const slotLiq = getLiquid(uid);
    return { uid, volume: slotLiq.volume, maxVolume: slotLiq.maxVolume, color: slotLiq.color, opacity: slotLiq.opacity };
  });
});

</script>

<template>
  <div
    class="lab-item"
    :class="{ selected: isSel, hover: hoveredUid === item.uid, heating: isHeated(item), 'pour-target': !!pourFlowMap[item.uid], tilted: !!pourFlowMap[item.uid] || !!(tiltAngleMap[item.uid]) }"
    :style="{ left: item.x + 'px', top: item.y + 'px', transform: `rotate(${tiltAngleMap[item.uid] || 0}deg) translateY(-5px) scale(${getItemZoom(item.uid)})`, transformOrigin: 'center center' }"
    @mouseenter="emit('mouseenter', item)"
    @mouseleave="emit('mouseleave', item)"
    @mousedown="emit('mousedown', $event, item)"
  >
  <div v-if="isContainer(item.id)" class="item-solution-label">
    {{ liq.label }}
  </div>

  <ContainerRenderers
    v-if="isTestTube(item.id) || isErlenmeyer(item.id) || isVolumetricFlask(item.id) || isRoundBottomFlask(item.id)"
    :item="item"
    :is-sel="isSel"
    @spill="emit('spill', item, $event)"
    @drop-exited="(wx: number, wy: number, color: string) => emit('dropExited', item, wx, wy, color)"
  />
  <LabSeparatoryFunnel
    v-else-if="isSeparatoryFunnel(item.id)"
    :volume="liq.volume"
    :max-volume="liq.maxVolume"
    :liquid-color="liq.color"
    :liquid-opacity="liq.opacity"
    :bottom-layer-color="getSepFunnelState(item.uid).bottomLayerColor"
    :bottom-layer-volume="getSepFunnelState(item.uid).bottomLayerVolume"
    :is-open="getSepFunnelState(item.uid).valveOpen"
    :is-hovered="isSel"
    :tilt-angle="tiltAngleMap[item.uid] || 0"
    :item-uid="item.uid"
    :item-x="item.x"
    :item-y="item.y"
    @toggle-stopcock="emit('toggleStopcock', item)"
    @spill="emit('spill', item, $event)"
    @drop-exited="(wx: number, wy: number, color: string) => emit('dropExited', item, wx, wy, color)"
  />
  <LabGradCylinder
    v-else-if="isGradCylinder(item.id)"
    :volume="liq.volume"
    :max-volume="liq.maxVolume"
    :liquid-color="liq.color"
    :liquid-opacity="liq.opacity"
    :is-hovered="isSel"
    :tilt-angle="tiltAngleMap[item.uid] || 0"
    :item-uid="item.uid"
    :item-x="item.x"
    :item-y="item.y"
    @spill="emit('spill', item, $event)"
    @drop-exited="(wx: number, wy: number, color: string) => emit('dropExited', item, wx, wy, color)"
  />
  <LabBeaker
    v-else-if="isBeaker(item.id)"
    :volume="liq.volume"
    :max-volume="liq.maxVolume"
    :liquid-color="liq.color"
    :liquid-opacity="liq.opacity"
    :is-hovered="isSel"
    :receiving="receiving"
    :stirred="liq.stirred"
    :tilt-angle="tiltAngleMap[item.uid] || 0"
    :item-uid="item.uid"
    :item-x="item.x"
    :item-y="item.y"
    @mouth-interact="emit('mouthInteract', item)"
    @spill="emit('spill', item, $event)"
    @drop-exited="(wx: number, wy: number, color: string) => emit('dropExited', item, wx, wy, color)"
  />
  <LabBurette
    v-else-if="isBurette(item.id)"
    :volume="getBurette(item.uid).volume"
    :max-volume="getBurette(item.uid).maxVolume"
    :liquid-color="getBurette(item.uid).color"
    :liquid-opacity="getBurette(item.uid).opacity"
    :is-open="getBurette(item.uid).valveOpen"
    :is-hovered="isSel"
    @toggle-valve="emit('toggleValve', item)"
    @tip-interact="emit('tipInteract', item)"
  />
  <LabVolumetricPipette
    v-else-if="item.id === 'volumetric-pipette'"
    :volume="getPipette(item.uid).volume"
    :max-volume="10"
    :liquid-color="getPipette(item.uid).color"
    :liquid-opacity="getPipette(item.uid).opacity"
    :is-hovered="isSel"
  />
  <LabPipette
    v-else-if="isPipette(item.id)"
    :volume="getPipette(item.uid).volume"
    :max-volume="getPipette(item.uid).maxVolume"
    :liquid-color="getPipette(item.uid).color"
    :liquid-opacity="getPipette(item.uid).opacity"
    :is-hovered="isSel"
    :is-active="false"
  />
  <LabBunsenBurner
    v-else-if="isBunsenBurner(item.id)"
    :is-on="getBurnerState(item.uid).on"
    :intensity="getBurnerState(item.uid).intensity"
    :is-hovered="isSel"
  />
  <LabHeatingMantle
    v-else-if="isHeatingMantle(item.id)"
    :is-on="getBurnerState(item.uid).on"
    :intensity="getBurnerState(item.uid).intensity"
    :is-hovered="isSel"
  />
  <LabBalance
    v-else-if="isBalance(item.id)"
    :reading="getBalanceReading(item.uid)"
    :is-hovered="isSel"
  />
  <LabPhMeter
    v-else-if="isPhMeter(item.id)"
    :uid="item.uid"
    :item-x="item.x"
    :item-y="item.y"
    :reading="getPhReading(item)"
    :is-hovered="isSel"
  />
  <LabDropper
    v-else-if="item.id === 'dropper'"
    :is-hovered="isSel"
  />
  <LabSpatula
    v-else-if="item.id === 'spatula'"
    :is-hovered="isSel"
  />
  <LabWatchGlass
    v-else-if="item.id === 'watch-glass'"
    :is-hovered="isSel"
  />
  <LabFilterFunnel
    v-else-if="item.id === 'filter-funnel'"
    :is-hovered="isSel"
  />
  <LabRubberStopper
    v-else-if="item.id === 'rubber-stopper'"
    :is-hovered="isSel"
  />
  <LabHotPlate
    v-else-if="isHotPlate(item.id)"
    :is-on="getHotPlateState(item.uid).on"
    :temperature="getHotPlateState(item.uid).temperature"
    :is-hovered="isSel"
    @toggle="emit('toggleValve', item)"
  />
  <LabWoodenBase
    v-else-if="isWoodenBase(item.id)"
    :is-hovered="isSel"
  />
  <LabBeakerClamp
    v-else-if="isBeakerClamp(item.id)"
    :clamp-angle="0"
    :held-container-uid="getBeakerClampState(item.uid).heldContainerUid"
    :is-hovered="isSel"
    @rotate-left="beakerClampMap[item.uid].clampAngle -= 45"
    @rotate-right="beakerClampMap[item.uid].clampAngle += 45"
  />
  <LabRetortStandAssembly
    v-else-if="isRetortStandAssembly(item.id)"
    :item-uid="item.uid"
    :is-hovered="hoveredUid === item.uid"
    @mousedown="emit('mousedown', $event, item)"
  />
  <LabTestTubeRack
    v-else-if="isTestTubeRack(item.id)"
    :is-hovered="isSel"
    :slots="rackSlotData"
  />
  <template v-else>
    <div class="item-icon" :class="{ heating: isHeated(item) }">{{ item.icon }}</div>
    <span class="item-label">{{ item.name }}</span>
  </template>
  </div>
</template>

<style scoped>
.lab-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: transform 0.1s, filter 0.2s;
}
.lab-item.hover {
  filter: drop-shadow(0 0 12px rgba(16,185,129,0.3));
  z-index: 10;
}
.lab-item.selected {
  filter: drop-shadow(0 0 8px rgba(16,185,129,0.4));
}
.lab-item.heating {
  filter: drop-shadow(0 0 15px rgba(239,68,68,0.5));
  animation: heatPulse 1.5s ease infinite;
}
@keyframes heatPulse {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(239,68,68,0.4)); }
  50% { filter: drop-shadow(0 0 20px rgba(239,68,68,0.65)); }
}
/* Pour mode visual cue on containers */
.lab-item.pour-target {
  animation: pourPulse 1s ease infinite;
}
@keyframes pourPulse {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(16,185,129,0.3)); }
  50% { filter: drop-shadow(0 0 16px rgba(16,185,129,0.6)); }
}
.item-solution-label {
  position: absolute;
  bottom: -18px;
  font-size: 0.6rem;
  font-weight: 700;
  color: #334155;
  background: rgba(255,255,255,0.9);
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.item-icon {
  font-size: 2.5rem;
  line-height: 1;
  transition: all 0.3s;
}
.item-icon.heating {
  animation: heatPulseIcon 1s ease infinite;
  filter: drop-shadow(0 0 8px #ef4444);
}
@keyframes heatPulseIcon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.lab-item.tilted {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
}
.item-label {
  font-size: 0.7rem;
  color: #64748b;
  white-space: nowrap;
}
/* Retort stand container sizing */
:deep(.retort-stand) {
  width: 190px;
  height: 350px;
  pointer-events: none;
}
:deep(.stand-part) {
  pointer-events: auto;
  cursor: pointer;
}
</style>
