<script setup lang="ts">
import { useCollisionCanvas } from '../../../composables/experiment/collision/useCollisionCanvas'
import type { CollisionParams, CollisionState } from '../../../modules/physics/experiments/collision/useCollisionPhysics'

const props = defineProps<{
  params: CollisionParams
  simState: CollisionState
}>()

const { canvasRef, captureSnapshot } = useCollisionCanvas(
  () => props.params,
  () => props.simState
)
defineExpose({ captureSnapshot })
</script>

<template>
  <div class="collision-canvas-wrap">
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped>
.collision-canvas-wrap { flex: 1; min-height: 0; position: relative; background: #0f172a; border-radius: 10px; border: 2px solid #2D3645; overflow: hidden; }
.collision-canvas-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
</style>
