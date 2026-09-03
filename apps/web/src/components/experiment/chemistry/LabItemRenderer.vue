<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed } from 'vue';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import {
  items, getLiquid, getBurette, getPipette, getSepFunnelState, getBurnerState, getItemZoom, getBeakerClampState, getHotPlateState, pourFlowMap, tiltAngleMap, rackSlotsMap, retortStandMap,
  isContainer, isBeaker, isTestTube, isTestTubeRack, isBurette, isPipette, isErlenmeyer, isVolumetricFlask, isRoundBottomFlask, isClampAttachable,
  isSeparatoryFunnel, isGradCylinder, isBunsenBurner, isHeatingMantle, isBalance, isPhMeter,
  isBeakerClamp, isWoodenBase, isHotPlate, isRetortStandAssembly, isThermometer
} from '../../../composables/chemistry/useChemistryLab';
import { getBalanceReading, getPhReading, isHeated } from '../../../composables/chemistry/useLabSimulation';
import { useChemicalLocale } from '../../../composables/chemistry/useChemicalLocale';
import LabTestTubeRack from './LabTestTubeRack.vue';
import ContainerRenderers from './ContainerRenderers.vue';
import LabBeaker from './LabBeaker.vue';
import LabBurette from './LabBurette.vue';
import LabPipette from './LabPipette.vue';
import LabGradCylinder from './LabGradCylinder.vue';
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
import LabThermometer from './LabThermometer.vue';



const props = defineProps<{
  item: LabItem;
  selectedUid: string | null;
  hoveredUid: string | null;
  draggingUid: string | null;
  receiving: boolean;
}>();

const emit = defineEmits<{
  mouseenter: [item: LabItem];
  mouseleave: [item: LabItem];
  mousedown: [e: MouseEvent, item: LabItem];
  selectBurette: [e: MouseEvent, item: LabItem];
  mouthInteract: [item: LabItem];
  spill: [item: LabItem, amount: number];
  dropExited: [item: LabItem, wx: number, wy: number, color: string];
  toggleValve: [item: LabItem];
  tipInteract: [item: LabItem];
  toggleStopcock: [item: LabItem];
  toggleBurner: [item: LabItem];
}>();

const liq = computed(() => getLiquid(props.item.uid));
const isSel = computed(() => props.selectedUid === props.item.uid);


const isAttachedToStand = computed(() => {
  for (const st of Object.values(retortStandMap)) {
    if (isClampAttachable(props.item.id) && st.slotOccupants.includes(props.item.uid)) return true;
    if (st.bottomSlotOccupant === props.item.uid) return true;
  }
  return false;
});

const rackSlotData = computed(() => {
  const uids = rackSlotsMap[props.item.uid] || [];
  return uids.map(uid => {
    if (!uid) return null;
    const slotLiq = getLiquid(uid);
    return { uid, volume: slotLiq.volume, maxVolume: slotLiq.maxVolume, color: slotLiq.color, opacity: slotLiq.opacity };
  });
});

function onBuretteClick(e: MouseEvent, uid: string) {
  const burette = items.value.find(i => i.uid === uid);
  if (burette) {
    emit('selectBurette', e, burette);
  }
}

const { resolveLabel } = useChemicalLocale();
</script>

<template>
  <div
    v-if="!isAttachedToStand"
    class="lab-item"
    :class="{ selected: isSel, hover: hoveredUid === item.uid && !props.draggingUid, 'drag-blocked': !!props.draggingUid && props.draggingUid !== item.uid, dragging: props.draggingUid === item.uid, heating: isHeated(item), 'pour-target': !!pourFlowMap[item.uid], tilted: !!pourFlowMap[item.uid] || !!(tiltAngleMap[item.uid]) }"
    :style="props.draggingUid === item.uid
      ? { left: '0px', top: '0px', transform: `translate3d(${item.x}px, ${item.y}px, 0) rotate(${tiltAngleMap[item.uid] || 0}deg) translateY(-5px) scale(${getItemZoom(item.uid)})`, transformOrigin: 'center center' }
      : { left: item.x + 'px', top: item.y + 'px', transform: `rotate(${tiltAngleMap[item.uid] || 0}deg) translateY(-5px) scale(${getItemZoom(item.uid)})`, transformOrigin: 'center center' }"
    @mouseenter="emit('mouseenter', item)"
    @mouseleave="emit('mouseleave', item)"
    @mousedown="emit('mousedown', $event, item)"
  >
  <div v-if="isContainer(item.id)" class="item-solution-label">
    {{ resolveLabel(liq.label) }}
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
    :volume="liq.volume" :max-volume="liq.maxVolume"
    :liquid-color="liq.color" :liquid-opacity="liq.opacity"
    :bottom-layer-color="getSepFunnelState(item.uid).bottomLayerColor"
    :bottom-layer-volume="getSepFunnelState(item.uid).bottomLayerVolume"
    :is-open="getSepFunnelState(item.uid).valveOpen" :is-hovered="isSel"
    :tilt-angle="tiltAngleMap[item.uid] || 0"
    :item-uid="item.uid" :item-x="item.x" :item-y="item.y"
    :gas-evolution="liq.gasEvolution" :gas-type="liq.gasType || ''"
    :precipitate="liq.precipitate" :precipitate-color="liq.precipitateColor || '#c0c0c0'"
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
    :scale="getItemZoom(item.uid)"
    :is-selected="isSel"
    :gas-evolution="liq.gasEvolution"
    :gas-type="liq.gasType || ''"
    :precipitate="liq.precipitate"
    :precipitate-color="liq.precipitateColor || '#c0c0c0'"
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
    :gas-evolution="liq.gasEvolution"
    :gas-type="liq.gasType || ''"
    :precipitate="liq.precipitate"
    :precipitate-color="liq.precipitateColor || '#c0c0c0'"
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
    :scale="getItemZoom(item.uid)"
    :is-selected="isSel"
    @toggle-valve="emit('toggleValve', item)"
    @tip-interact="emit('tipInteract', item)"
  />
  <LabVolumetricPipette
    v-else-if="item.id === 'volumetric-pipette'"
    :volume="getPipette(item.uid).volume"
    :max-volume="getPipette(item.uid).maxVolume"
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
    :scale="getItemZoom(item.uid)"
    :is-selected="isSel"
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
    @toggle="emit('toggleBurner', item)"
  />
  <LabWoodenBase
    v-else-if="isWoodenBase(item.id)"
    :is-hovered="isSel"
  />
  <LabBeakerClamp
    v-else-if="isBeakerClamp(item.id)"
    :clamp-angle="getBeakerClampState(item.uid).clampAngle"
    :held-container-uid="getBeakerClampState(item.uid).heldContainerUid"
    :is-hovered="isSel"
    @rotate-left="getBeakerClampState(item.uid).clampAngle -= 45"
    @rotate-right="getBeakerClampState(item.uid).clampAngle += 45"
  />
  <LabRetortStandAssembly
    v-else-if="isRetortStandAssembly(item.id)"
    :item-uid="item.uid"
    :dragging-uid="props.draggingUid"
    :is-hovered="hoveredUid === item.uid && props.draggingUid === null"
    :selected-burette-uid="props.selectedUid || undefined"
    @mousedown="emit('mousedown', $event, item)"
    @burette-click="onBuretteClick"
  />
  <LabTestTubeRack
    v-else-if="isTestTubeRack(item.id)"
    :is-hovered="isSel"
    :slots="rackSlotData"
  />
  <LabThermometer
    v-else-if="isThermometer(item.id)"
    :variant="item.id === 'thermometer-digital' ? 'digital' : 'mercury'"
    :uid="item.uid"
    :is-hovered="isSel"
  />
  <template v-else>
    <div class="item-icon" :class="{ heating: isHeated(item) }">{{ item.icon }}</div>
    <span class="item-label">{{ t(item.name) }}</span>
  </template>
  </div>
</template>

<style src="./LabItemRenderer.css" scoped></style>
