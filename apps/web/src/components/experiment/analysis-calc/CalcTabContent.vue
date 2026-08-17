<script setup lang="ts">
import { computed } from 'vue';
import CalcTabMechanics from './CalcTabMechanics.vue';
import CalcTabOptics from './CalcTabOptics.vue';
import CalcTabThermal from './CalcTabThermal.vue';
import CalcTabElectric from './CalcTabElectric.vue';

const props = defineProps<{
  sourceExperiment: string;
  firstReading: Record<string, number> | null;
}>();

const MECHANICS_EXPERIMENTS = new Set([
  'specific-heat', 'spring', 'pendulum', 'freefall', 'projectile',
  'inclined', 'collision', 'lever',
]);

const OPTICS_EXPERIMENTS = new Set([
  'light-ray', 'prism', 'interference', 'diffraction',
  'polarization', 'thin-lens', 'mirrors',
]);

const THERMAL_EXPERIMENTS = new Set([
  'calorimetry', 'ideal-gas', 'boyles-law', 'thermal-expansion',
  'latent-heat', 'speed-of-sound', 'resonance', 'wave-interference',
]);

const category = computed(() => {
  const s = props.sourceExperiment;
  if (MECHANICS_EXPERIMENTS.has(s)) return 'mechanics';
  if (OPTICS_EXPERIMENTS.has(s)) return 'optics';
  if (THERMAL_EXPERIMENTS.has(s)) return 'thermal';
  return 'electric';
});
</script>

<template>
  <div class="calc-tab">
    <CalcTabMechanics
      v-if="category === 'mechanics'"
      :source-experiment="sourceExperiment"
      :first-reading="firstReading"
    />
    <CalcTabOptics
      v-else-if="category === 'optics'"
      :source-experiment="sourceExperiment"
      :first-reading="firstReading"
    />
    <CalcTabThermal
      v-else-if="category === 'thermal'"
      :source-experiment="sourceExperiment"
      :first-reading="firstReading"
    />
    <CalcTabElectric
      v-else
      :source-experiment="sourceExperiment"
      :first-reading="firstReading"
    />
  </div>
</template>

<style scoped>
.calc-tab {
  flex: 1;
  overflow: auto;
  padding: 1rem;
  display: flex;
  gap: 1.5rem;
}
.calc-tab > :first-child {
  flex: 2;
  min-width: 0;
}
.calc-tab > :last-child {
  flex: 1;
  min-width: 280px;
  max-width: 360px;
}
@media (max-width: 900px) {
  .calc-tab { flex-direction: column; }
  .calc-tab > :last-child { max-width: none; }
}
</style>
