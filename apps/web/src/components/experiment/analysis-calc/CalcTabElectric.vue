<script setup lang="ts">
import OhmsLawWorksheetPanel from '../electric-workshop/panels/OhmsLawWorksheetPanel.vue';
import OhmsLawReferencePanel from '../electric-workshop/panels/OhmsLawReferencePanel.vue';
import KirchhoffWorksheetPanel from '../electric-workshop/panels/KirchhoffWorksheetPanel.vue';
import KirchhoffReferencePanel from '../electric-workshop/panels/KirchhoffReferencePanel.vue';
import ParallelWorksheetPanel from '../electric-workshop/panels/ParallelWorksheetPanel.vue';
import ParallelReferencePanel from '../electric-workshop/panels/ParallelReferencePanel.vue';
import PowerWorksheetPanel from '../electric-workshop/panels/PowerWorksheetPanel.vue';
import PowerReferencePanel from '../electric-workshop/panels/PowerReferencePanel.vue';
import ResistivityWorksheetPanel from '../electric-workshop/panels/ResistivityWorksheetPanel.vue';
import ResistivityReferencePanel from '../electric-workshop/panels/ResistivityReferencePanel.vue';
import RCWorksheetPanel from '../electric-workshop/panels/RCWorksheetPanel.vue';
import RCReferencePanel from '../electric-workshop/panels/RCReferencePanel.vue';
import LampWorksheetPanel from '../electric-workshop/panels/LampWorksheetPanel.vue';
import LampReferencePanel from '../electric-workshop/panels/LampReferencePanel.vue';
import GalvanometerWorksheetPanel from '../electric-workshop/panels/GalvanometerWorksheetPanel.vue';
import GalvanometerReferencePanel from '../electric-workshop/panels/GalvanometerReferencePanel.vue';
import WheatstoneWorksheetPanel from '../electric-workshop/panels/WheatstoneWorksheetPanel.vue';
import WheatstoneReferencePanel from '../electric-workshop/panels/WheatstoneReferencePanel.vue';
import VoltageDividerWorksheetPanel from '../electric-workshop/panels/VoltageDividerWorksheetPanel.vue';
import VoltageDividerReferencePanel from '../electric-workshop/panels/VoltageDividerReferencePanel.vue';
import InternalResistanceWorksheetPanel from '../electric-workshop/panels/InternalResistanceWorksheetPanel.vue';
import InternalResistanceReferencePanel from '../electric-workshop/panels/InternalResistanceReferencePanel.vue';
import SeriesWorksheetPanel from '../electric-workshop/panels/SeriesWorksheetPanel.vue';
import SeriesReferencePanel from '../electric-workshop/panels/SeriesReferencePanel.vue';
import CapacitorsComboWorksheetPanel from '../electric-workshop/panels/CapacitorsComboWorksheetPanel.vue';
import CapacitorsComboReferencePanel from '../electric-workshop/panels/CapacitorsComboReferencePanel.vue';
import PotentiometerWorksheetPanel from '../electric-workshop/panels/PotentiometerWorksheetPanel.vue';
import PotentiometerReferencePanel from '../electric-workshop/panels/PotentiometerReferencePanel.vue';
import NonOhmicWorksheetPanel from '../electric-workshop/panels/NonOhmicWorksheetPanel.vue';
import NonOhmicReferencePanel from '../electric-workshop/panels/NonOhmicReferencePanel.vue';
import GenericWorksheetPanel from '../electric-workshop/panels/GenericWorksheetPanel.vue';
import GenericReferencePanel from '../electric-workshop/panels/GenericReferencePanel.vue';

defineProps<{
  sourceExperiment: string;
  firstReading: Record<string, number> | null;
}>();
</script>

<template>
  <template v-if="sourceExperiment === 'electric-lab'">
    <OhmsLawWorksheetPanel
      :voltage="firstReading?.V ?? 0"
      :current="firstReading?.I ?? 0"
      :resistance="firstReading?.R ?? 0"
    />
    <OhmsLawReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-kirchhoff'">
    <KirchhoffWorksheetPanel
      :V1="firstReading?.V1 ?? 0"
      :V2="firstReading?.V2 ?? 0"
      :R1="firstReading?.R1 ?? 0"
      :R2="firstReading?.R2 ?? 0"
      :R3="firstReading?.R3 ?? 0"
      :I1="firstReading?.I1 ?? 0"
      :I2="firstReading?.I2 ?? 0"
      :I3="firstReading?.I3 ?? 0"
    />
    <KirchhoffReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-parallel'">
    <ParallelWorksheetPanel
      :V="firstReading?.V ?? 0"
      :R1="firstReading?.R1 ?? 0"
      :R2="firstReading?.R2 ?? 0"
      :I1="firstReading?.I1 ?? 0"
      :I2="firstReading?.I2 ?? 0"
      :Itotal="firstReading?.Itotal ?? 0"
      :Req="firstReading?.Req ?? 0"
    />
    <ParallelReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-power'">
    <PowerWorksheetPanel
      :V="firstReading?.V ?? 0"
      :I="firstReading?.I ?? 0"
      :R="firstReading?.R ?? 0"
      :P="firstReading?.P ?? 0"
    />
    <PowerReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-resistivity'">
    <ResistivityWorksheetPanel
      :V="firstReading?.V ?? 0"
      :I="firstReading?.I ?? 0"
      :R="firstReading?.R ?? 0"
      :rho="firstReading?.rho ?? 0"
      :L="firstReading?.L ?? 1"
      :A="firstReading?.A ?? 1e-6"
    />
    <ResistivityReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-rc'">
    <RCWorksheetPanel
      :V0="firstReading?.V0 ?? 0"
      :R="firstReading?.R ?? 0"
      :C="firstReading?.C ?? 0"
      :tau="firstReading?.tau ?? 0"
      :Vc="firstReading?.V ?? 0"
      :I="firstReading?.I ?? 0"
      :t="firstReading?.t ?? 0"
      :charging="true"
    />
    <RCReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-lamp'">
    <LampWorksheetPanel
      :V="firstReading?.V ?? 0"
      :I="firstReading?.I ?? 0"
      :R="firstReading?.R ?? 0"
      :P="firstReading?.P ?? 0"
      :PLight="firstReading?.PLight ?? 0"
      :PHeat="firstReading?.PHeat ?? 0"
    />
    <LampReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-galvanometer'">
    <GalvanometerWorksheetPanel
      :N="firstReading?.N ?? 0"
      :speed="firstReading?.speed ?? 0"
      :emf="firstReading?.emf ?? 0"
      :IuA="firstReading?.IuA ?? 0"
    />
    <GalvanometerReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-wheatstone'">
    <WheatstoneWorksheetPanel
      :R1="200"
      :R2="200"
      :R3="firstReading?.R3 ?? 0"
      :Rx="150"
      :Vg="firstReading?.Vg ?? 0"
      :Ig="firstReading?.Ig ?? 0"
    />
    <WheatstoneReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-voltage-divider'">
    <VoltageDividerWorksheetPanel
      :V="9"
      :R1="200"
      :R2="firstReading?.R2 ?? 0"
      :V1="(9 * 200 / (200 + (firstReading?.R2 ?? 0)))"
      :V2="firstReading?.V2 ?? 0"
      :I="firstReading?.I ?? 0"
    />
    <VoltageDividerReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-internal-resistance'">
    <InternalResistanceWorksheetPanel
      :Vt="firstReading?.V ?? 0"
      :I="firstReading?.I ?? 0"
      :emf="12"
      :r="2"
    />
    <InternalResistanceReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-series'">
    <SeriesWorksheetPanel
      :V="firstReading?.V ?? 0"
      :I="firstReading?.I ?? 0"
      :Req="firstReading?.R ?? 0"
      :V1="0"
      :V2="0"
      :V3="0"
    />
    <SeriesReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-capacitors-combo'">
    <CapacitorsComboWorksheetPanel
      :Ceq="firstReading?.Ceq ?? 0"
      :tau="firstReading?.tau ?? 0"
      :C1="100"
      :C2="100"
    />
    <CapacitorsComboReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-potentiometer'">
    <PotentiometerWorksheetPanel
      :Vref="6"
      :Vx="3"
      :Vslide="firstReading?.V ?? 0"
      :Ig="firstReading?.I ?? 0"
      :balanced="false"
    />
    <PotentiometerReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'electric-lab-non-ohmic'">
    <NonOhmicWorksheetPanel
      :V="firstReading?.V ?? 0"
      :I_ohmic="firstReading?.I ?? 0"
      :I_lamp="firstReading?.I ?? 0"
      :R_dyn="firstReading?.R ?? 0"
    />
    <NonOhmicReferencePanel />
  </template>
  <template v-else>
    <GenericWorksheetPanel
      :source-experiment="sourceExperiment"
      :reading="firstReading ?? {}"
    />
    <GenericReferencePanel
      :source-experiment="sourceExperiment"
    />
  </template>
</template>
