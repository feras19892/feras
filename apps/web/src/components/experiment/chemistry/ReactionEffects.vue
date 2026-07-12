<script setup lang="ts">
interface Props {
  gasEvolution?: boolean;
  gasType?: string;
  precipitate?: boolean;
  precipitateColor?: string;
  centerX: number;
  liquidY: number;
  width: number;
}

const props = withDefaults(defineProps<Props>(), {
  gasEvolution: false,
  gasType: '',
  precipitate: false,
  precipitateColor: '#c0c0c0',
  centerX: 70,
  liquidY: 100,
  width: 60,
});
</script>

<template>
  <!-- Gas bubbles rising from liquid surface -->
  <g v-if="gasEvolution" :clip-path="undefined">
    <!-- Bubble 1 -->
    <circle :cx="centerX - width * 0.25" :cy="liquidY + 2" r="2" fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5">
      <animate attributeName="cy" :from="liquidY + 2" :to="liquidY - 25" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;0.8;0" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="r" values="1.5;2.5;1" dur="1.2s" repeatCount="indefinite" />
    </circle>
    <!-- Bubble 2 -->
    <circle :cx="centerX" :cy="liquidY + 2" r="1.8" fill="rgba(255,255,255,0.6)" stroke="rgba(255,255,255,0.25)" stroke-width="0.4">
      <animate attributeName="cy" :from="liquidY + 5" :to="liquidY - 30" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;0.7;0" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
      <animate attributeName="r" values="1;2;0.8" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
    </circle>
    <!-- Bubble 3 -->
    <circle :cx="centerX + width * 0.25" :cy="liquidY + 2" r="2.2" fill="rgba(255,255,255,0.65)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5">
      <animate attributeName="cy" :from="liquidY + 3" :to="liquidY - 28" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;0.75;0" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
      <animate attributeName="r" values="1.2;2.8;1" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
    </circle>
    <!-- Bubble 4 (small, fast) -->
    <circle :cx="centerX - width * 0.1" :cy="liquidY + 2" r="1.2" fill="rgba(255,255,255,0.5)">
      <animate attributeName="cy" :from="liquidY + 8" :to="liquidY - 20" dur="0.9s" begin="0.15s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;0.6;0" dur="0.9s" begin="0.15s" repeatCount="indefinite" />
    </circle>
    <!-- Gas label above surface -->
    <text
      :x="centerX"
      :y="liquidY - 32"
      font-size="7"
      fill="#64748b"
      font-weight="700"
      text-anchor="middle"
      opacity="0.85"
    >{{ gasType }}↑</text>
  </g>

  <!-- Precipitate particles settling at bottom -->
  <g v-if="precipitate">
    <!-- Layer of precipitate at bottom -->
    <ellipse :cx="centerX" :cy="liquidY + 18" :rx="width * 0.4" ry="3" :fill="precipitateColor" opacity="0.5" />
    <!-- Floating particles -->
    <circle :cx="centerX - width * 0.2" :cy="liquidY + 10" r="1.5" :fill="precipitateColor" opacity="0.6">
      <animate attributeName="cy" :from="liquidY + 2" :to="liquidY + 16" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0.3;0" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle :cx="centerX + width * 0.15" :cy="liquidY + 12" r="1.2" :fill="precipitateColor" opacity="0.5">
      <animate attributeName="cy" :from="liquidY + 4" :to="liquidY + 18" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.5;0.25;0" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
    </circle>
    <circle :cx="centerX + width * 0.05" :cy="liquidY + 8" r="1" :fill="precipitateColor" opacity="0.45">
      <animate attributeName="cy" :from="liquidY + 2" :to="liquidY + 15" dur="1.8s" begin="0.8s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.5;0.2;0" dur="1.8s" begin="0.8s" repeatCount="indefinite" />
    </circle>
  </g>
</template>
