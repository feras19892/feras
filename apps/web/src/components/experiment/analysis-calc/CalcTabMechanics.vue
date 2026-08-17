<script setup lang="ts">
import SpecificHeatWorksheetPanel from '../specific-heat/panels/SpecificHeatWorksheetPanel.vue';
import SpecificHeatReferencePanel from '../specific-heat/panels/SpecificHeatReferencePanel.vue';
import SpringWorksheetPanel from '../spring/panels/SpringWorksheetPanel.vue';
import SpringReferencePanel from '../spring/panels/SpringReferencePanel.vue';
import PendulumWorksheetPanel from '../pendulum/panels/PendulumWorksheetPanel.vue';
import PendulumReferencePanel from '../pendulum/panels/PendulumReferencePanel.vue';
import FreeFallWorksheetPanel from '../freefall/panels/FreeFallWorksheetPanel.vue';
import FreeFallReferencePanel from '../freefall/panels/FreeFallReferencePanel.vue';
import ProjectileWorksheetPanel from '../projectile/panels/ProjectileWorksheetPanel.vue';
import ProjectileReferencePanel from '../projectile/panels/ProjectileReferencePanel.vue';
import InclinedWorksheetPanel from '../inclined/panels/InclinedWorksheetPanel.vue';
import InclinedReferencePanel from '../inclined/panels/InclinedReferencePanel.vue';
import CollisionWorksheetPanel from '../collision/panels/CollisionWorksheetPanel.vue';
import CollisionReferencePanel from '../collision/panels/CollisionReferencePanel.vue';

defineProps<{
  sourceExperiment: string;
  firstReading: Record<string, number> | null;
}>();
</script>

<template>
  <template v-if="sourceExperiment === 'specific-heat'">
    <SpecificHeatWorksheetPanel
      :metal-mass="firstReading?.metalMass ?? 0"
      :water-mass="firstReading?.waterMass ?? 0"
      :water-temp="firstReading?.waterTemp ?? 0"
      :metal-temp="100"
      :display-t="firstReading?.finalTemp ?? 0"
    />
    <SpecificHeatReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'spring'">
    <SpringWorksheetPanel
      :mass="firstReading?.mass ?? 0"
      :period="firstReading?.T ?? 0"
      :k-actual="firstReading?.kCalc ?? 0"
    />
    <SpringReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'pendulum'">
    <PendulumWorksheetPanel
      :length="firstReading?.length ?? 0"
      :period="firstReading?.T ?? 0"
      :g-actual="firstReading?.gCalc ?? 0"
    />
    <PendulumReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'freefall'">
    <FreeFallWorksheetPanel
      :height="firstReading?.h ?? 0"
      :time="firstReading?.t ?? 0"
      :g-actual="firstReading?.gCalc ?? 0"
    />
    <FreeFallReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'projectile'">
    <ProjectileWorksheetPanel
      :v0="firstReading?.initialVelocity ?? 0"
      :angle-deg="firstReading?.angleDegrees ?? 0"
      :g="9.81"
      :range="firstReading?.rangeMeters ?? 0"
      :max-height="firstReading?.maxHeightMeters ?? 0"
    />
    <ProjectileReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'inclined'">
    <InclinedWorksheetPanel
      :theta-deg="firstReading?.thetaDeg ?? 0"
      :length="firstReading?.length ?? 0"
      :g="9.81"
      :mu="0"
      :acceleration="firstReading?.acceleration ?? 0"
    />
    <InclinedReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'collision'">
    <CollisionWorksheetPanel
      :m1="firstReading?.m1 ?? 0"
      :m2="firstReading?.m2 ?? 0"
      :v1i="firstReading?.v1i ?? 0"
      :v2i="firstReading?.v2i ?? 0"
      :v1f="firstReading?.v1f ?? 0"
      :v2f="firstReading?.v2f ?? 0"
    />
    <CollisionReferencePanel />
  </template>
</template>
