<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { drawComponentIcon } from '../shared/drawComponent'
import type { ComponentType } from '../shared/types'

const props = defineProps<{
  type: ComponentType
  size?: number
  value?: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

function render() {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const s = props.size || 48
  c.width = s * 2 // for retina
  c.height = s * 2
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.scale(2, 2) // retina
  drawComponentIcon(ctx, props.type, s, props.value || 0)
}

onMounted(render)
watch(() => [props.type, props.size, props.value], render)
</script>

<template>
  <canvas ref="canvasRef" class="comp-icon-canvas" :style="{ width: (size || 48) + 'px', height: (size || 48) + 'px' }"></canvas>
</template>

<style scoped>
.comp-icon-canvas {
  display: block;
}
</style>
