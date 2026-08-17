<script setup lang="ts">
import CalorimetryWorksheetPanel from '../calorimetry/panels/CalorimetryWorksheetPanel.vue';
import CalorimetryReferencePanel from '../calorimetry/panels/CalorimetryReferencePanel.vue';
import IdealGasWorksheetPanel from '../ideal-gas/panels/IdealGasWorksheetPanel.vue';
import IdealGasReferencePanel from '../ideal-gas/panels/IdealGasReferencePanel.vue';
import BoylesLawWorksheetPanel from '../boyles-law/panels/BoylesLawWorksheetPanel.vue';
import BoylesLawReferencePanel from '../boyles-law/panels/BoylesLawReferencePanel.vue';
import ThermalExpansionWorksheetPanel from '../thermal-expansion/panels/ThermalExpansionWorksheetPanel.vue';
import ThermalExpansionReferencePanel from '../thermal-expansion/panels/ThermalExpansionReferencePanel.vue';
import LatentHeatWorksheetPanel from '../latent-heat/panels/LatentHeatWorksheetPanel.vue';
import LatentHeatReferencePanel from '../latent-heat/panels/LatentHeatReferencePanel.vue';
import SpeedOfSoundWorksheetPanel from '../speed-of-sound/panels/SpeedOfSoundWorksheetPanel.vue';
import SpeedOfSoundReferencePanel from '../speed-of-sound/panels/SpeedOfSoundReferencePanel.vue';
import ResonanceWorksheetPanel from '../resonance/panels/ResonanceWorksheetPanel.vue';
import ResonanceReferencePanel from '../resonance/panels/ResonanceReferencePanel.vue';
import WaveInterferenceWorksheetPanel from '../wave-interference/panels/WaveInterferenceWorksheetPanel.vue';
import WaveInterferenceReferencePanel from '../wave-interference/panels/WaveInterferenceReferencePanel.vue';

defineProps<{
  sourceExperiment: string;
  firstReading: Record<string, number> | null;
}>();
</script>

<template>
  <template v-if="sourceExperiment === 'calorimetry'">
    <CalorimetryWorksheetPanel
      :m-water="firstReading?.mWater ?? 0.2"
      :t-water="firstReading?.tWater ?? 25"
      :m-metal="firstReading?.mMetal ?? 0.05"
      :t-metal="firstReading?.tMetal ?? 100"
      :c-metal="firstReading?.cMetal ?? 385"
      :tf="firstReading?.tf ?? 30"
    />
    <CalorimetryReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'ideal-gas'">
    <IdealGasWorksheetPanel
      :n="firstReading?.n ?? 1"
      :T="firstReading?.T ?? 300"
      :V="firstReading?.V ?? 0.0224"
    />
    <IdealGasReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'boyles-law'">
    <BoylesLawWorksheetPanel
      :p="firstReading?.p ?? 1"
      :v="firstReading?.v ?? 1"
    />
    <BoylesLawReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'thermal-expansion'">
    <ThermalExpansionWorksheetPanel
      :L0="firstReading?.L0 ?? 1"
      :t0="firstReading?.t0 ?? 20"
      :t1="firstReading?.t1 ?? 100"
      :alpha="firstReading?.alpha ?? 16.5"
    />
    <ThermalExpansionReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'latent-heat'">
    <LatentHeatWorksheetPanel
      :mass="firstReading?.mass ?? 0.5"
      :L="firstReading?.L ?? 334000"
      :Q="firstReading?.Q ?? 0"
    />
    <LatentHeatReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'speed-of-sound'">
    <SpeedOfSoundWorksheetPanel
      :tube-length="firstReading?.L ?? 0.25"
      :frequency="firstReading?.f ?? 343"
      :temperature="firstReading?.T ?? 20"
      :v-measured="firstReading?.v ?? 0"
    />
    <SpeedOfSoundReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'resonance'">
    <ResonanceWorksheetPanel
      :string-length="firstReading?.L ?? 1"
      :tension="firstReading?.T ?? 10"
      :harmonic="firstReading?.n ?? 1"
      :frequency="firstReading?.f ?? 0"
    />
    <ResonanceReferencePanel />
  </template>
  <template v-else-if="sourceExperiment === 'wave-interference'">
    <WaveInterferenceWorksheetPanel
      :source-distance="firstReading?.d ?? 0.05"
      :wavelength="firstReading?.lambda ?? 0.02"
      :frequency="firstReading?.f ?? 20"
      :screen-distance="firstReading?.D ?? 1"
    />
    <WaveInterferenceReferencePanel />
  </template>
</template>
