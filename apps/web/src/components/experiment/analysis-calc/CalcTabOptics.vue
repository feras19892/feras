<script setup lang="ts">
import LightRayWorksheetPanel from '../lightray/panels/LightRayWorksheetPanel.vue';
import LightRayReferencePanel from '../lightray/panels/LightRayReferencePanel.vue';
import PrismWorksheetPanel from '../prism/panels/PrismWorksheetPanel.vue';
import PrismReferencePanel from '../prism/panels/PrismReferencePanel.vue';
import InterferenceWorksheetPanel from '../interference/panels/InterferenceWorksheetPanel.vue';
import InterferenceReferencePanel from '../interference/panels/InterferenceReferencePanel.vue';
import DiffractionWorksheetPanel from '../diffraction/panels/DiffractionWorksheetPanel.vue';
import DiffractionReferencePanel from '../diffraction/panels/DiffractionReferencePanel.vue';
import PolarizationWorksheetPanel from '../polarization/panels/PolarizationWorksheetPanel.vue';
import PolarizationReferencePanel from '../polarization/panels/PolarizationReferencePanel.vue';
import ThinLensWorksheetPanel from '../thinlens/panels/ThinLensWorksheetPanel.vue';
import ThinLensReferencePanel from '../thinlens/panels/ThinLensReferencePanel.vue';
import MirrorWorksheetPanel from '../mirror/panels/MirrorWorksheetPanel.vue';
import MirrorReferencePanel from '../mirror/panels/MirrorReferencePanel.vue';

defineProps<{
  sourceExperiment: string;
  firstReading: Record<string, number> | null;
}>();
</script>

<template>
  <template v-if="sourceExperiment === 'light-ray'">
    <LightRayWorksheetPanel
      :angle-incidence="firstReading?.theta_i ?? 0"
      :angle-refraction="firstReading?.theta_t ?? 0"
      :n1="firstReading?.n1 ?? 1"
      :n2="firstReading?.n2 ?? 1.5"
    />
    <LightRayReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'prism'">
    <PrismWorksheetPanel
      :angle-incidence="firstReading?.angleIncidence ?? 0"
      :prism-angle="firstReading?.prismAngle ?? 60"
      :n="firstReading?.n ?? 1.5"
      :deviation="firstReading?.deviation ?? 0"
    />
    <PrismReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'interference'">
    <InterferenceWorksheetPanel
      :slit-distance="firstReading?.d ?? 0.1"
      :screen-distance="firstReading?.D ?? 1.5"
      :wavelength="firstReading?.lambda ?? 580"
      :fringe-spacing="firstReading?.delta_y ?? 0"
    />
    <InterferenceReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'diffraction'">
    <DiffractionWorksheetPanel
      :slit-width="firstReading?.a ?? 0.1"
      :screen-distance="firstReading?.D ?? 1"
      :wavelength="firstReading?.lambda ?? 580"
      :central-width="firstReading?.w ?? 0"
    />
    <DiffractionReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'polarization'">
    <PolarizationWorksheetPanel
      :polarizer-angle="firstReading?.theta1 ?? 0"
      :analyzer-angle="firstReading?.theta2 ?? 45"
      :I0="firstReading?.I0 ?? 100"
      :output-intensity="firstReading?.Iout ?? 0"
    />
    <PolarizationReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'thin-lens'">
    <ThinLensWorksheetPanel
      :focal-length="firstReading?.f ?? 10"
      :object-distance="firstReading?.do ?? 30"
      :object-height="firstReading?.ho ?? 5"
      :image-distance="firstReading?.di ?? null"
      :image-height="firstReading?.hi ?? null"
    />
    <ThinLensReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'mirrors'">
    <MirrorWorksheetPanel
      :focal-length="firstReading?.f ?? 10"
      :object-distance="firstReading?.do ?? 30"
      :object-height="firstReading?.ho ?? 5"
      :image-distance="firstReading?.di ?? null"
      :image-height="firstReading?.hi ?? null"
    />
    <MirrorReferencePanel />
  </template>
</template>
