<script setup lang="ts">
interface Props {
  running: boolean
  paused: boolean
  prismAngle: number
  angleIncidence: number
  n: number
  totalInternalReflection: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="status-bar">
    <span class="status-item">{{ running ? (paused ? '⏸️ متوقف' : '▶️ يعمل') : '⏹️ متوقف' }}</span>
    <span class="status-item">A = {{ prismAngle }}°</span>
    <span class="status-item">θᵢ = {{ angleIncidence }}°</span>
    <span class="status-item">n = {{ n.toFixed(3) }}</span>
    <span v-if="totalInternalReflection" class="status-item warn">&#x26A0; TIR</span>
  </div>
</template>

<style scoped>
.status-bar { display: flex; gap: 1rem; padding: .25rem .6rem; background: #161B22; border-top: 1px solid #2D3645; font-size: .72rem; color: #8B95A5; flex-shrink: 0; }
.status-item { font-family: monospace; }
.warn { color: #fbbf24; font-weight: 700; }
</style>
