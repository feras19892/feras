<script setup lang="ts">
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import { getLiquid, tiltAngleMap, isTestTube, isErlenmeyer, isVolumetricFlask, isRoundBottomFlask, isGradCylinder } from '../../../composables/chemistry/useChemistryLab';
import LabTestTube from './LabTestTube.vue';
import LabErlenmeyer from './LabErlenmeyer.vue';
import LabVolumetricFlask from './LabVolumetricFlask.vue';
import LabRoundBottomFlask from './LabRoundBottomFlask.vue';
import LabGradCylinder from './LabGradCylinder.vue';

const props = defineProps<{
  item: LabItem;
  isSel: boolean;
}>();

const emit = defineEmits<{
  spill: [amount: number];
  dropExited: [wx: number, wy: number, color: string];
}>();

const liq = getLiquid(props.item.uid);
const tilt = tiltAngleMap[props.item.uid] || 0;
</script>

<template>
  <LabTestTube
    v-if="isTestTube(item.id)"
    :volume="liq.volume"
    :max-volume="liq.maxVolume"
    :liquid-color="liq.color"
    :liquid-opacity="liq.opacity"
    :is-hovered="isSel"
    :size="item.id === 'test-tube-sm' ? 'sm' : item.id === 'test-tube-lg' ? 'lg' : 'md'"
    :tilt-angle="tilt"
    :item-uid="item.uid"
    :item-x="item.x"
    :item-y="item.y"
    @spill="emit('spill', $event)"
    @drop-exited="(wx: number, wy: number, color: string) => emit('dropExited', wx, wy, color)"
  />
  <LabErlenmeyer
    v-else-if="isErlenmeyer(item.id)"
    :volume="liq.volume"
    :max-volume="liq.maxVolume"
    :liquid-color="liq.color"
    :liquid-opacity="liq.opacity"
    :is-hovered="isSel"
    :tilt-angle="tilt"
    :item-uid="item.uid"
    :item-x="item.x"
    :item-y="item.y"
    @spill="emit('spill', $event)"
    @drop-exited="(wx: number, wy: number, color: string) => emit('dropExited', wx, wy, color)"
  />
  <LabVolumetricFlask
    v-else-if="isVolumetricFlask(item.id)"
    :volume="liq.volume"
    :max-volume="liq.maxVolume"
    :liquid-color="liq.color"
    :liquid-opacity="liq.opacity"
    :is-hovered="isSel"
    :tilt-angle="tilt"
    :item-uid="item.uid"
    :item-x="item.x"
    :item-y="item.y"
    @spill="emit('spill', $event)"
    @drop-exited="(wx: number, wy: number, color: string) => emit('dropExited', wx, wy, color)"
  />
  <LabRoundBottomFlask
    v-else-if="isRoundBottomFlask(item.id)"
    :volume="liq.volume"
    :max-volume="liq.maxVolume"
    :liquid-color="liq.color"
    :liquid-opacity="liq.opacity"
    :is-hovered="isSel"
    :tilt-angle="tilt"
    :item-uid="item.uid"
    :item-x="item.x"
    :item-y="item.y"
    @spill="emit('spill', $event)"
    @drop-exited="(wx: number, wy: number, color: string) => emit('dropExited', wx, wy, color)"
  />
  <LabGradCylinder
    v-else-if="isGradCylinder(item.id)"
    :volume="liq.volume"
    :max-volume="liq.maxVolume"
    :liquid-color="liq.color"
    :liquid-opacity="liq.opacity"
    :is-hovered="isSel"
    :tilt-angle="tilt"
    :item-uid="item.uid"
    :item-x="item.x"
    :item-y="item.y"
    @spill="emit('spill', $event)"
    @drop-exited="(wx: number, wy: number, color: string) => emit('dropExited', wx, wy, color)"
  />
</template>
