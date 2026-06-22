<script setup lang="ts">
import { useLeverCanvas } from '../../../composables/experiment/lever/useLeverCanvas'
import type { LeverParams, LeverState } from '../../../modules/physics/experiments/lever/useLeverPhysics'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  params: LeverParams
  simState: LeverState
}>()

const emit = defineEmits<{
  (e: 'removeBall', id: number): void
  (e: 'moveBall', id: number, x: number): void
  (e: 'setBallMass', id: number, mass: number): void
  (e: 'removeForce', id: number): void
  (e: 'moveForce', id: number, x: number): void
}>()

const {
  canvasRef,
  wrapRef,
  hoverTarget,
  hoverPx,
  hoverPy,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  deleteHover,
  onDblClick,
} = useLeverCanvas(
  () => props.params,
  () => props.simState,
  {
    removeBall: (id) => emit('removeBall', id),
    moveBall: (id, x) => emit('moveBall', id, x),
    setBallMass: (id, mass) => emit('setBallMass', id, mass),
    removeForce: (id) => emit('removeForce', id),
    moveForce: (id, x) => emit('moveForce', id, x),
  }
)
</script>

<template>
  <div class="lever-wrap" ref="wrapRef">
    <canvas
      ref="canvasRef"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @dblclick="onDblClick"
      @mouseleave="hoverTarget = null"
    />
    <button
      v-if="hoverTarget"
      class="hover-del"
      :style="{ left: (hoverPx - 10) + 'px', top: (hoverPy - 10) + 'px' }"
      @click="deleteHover"
      :title="t('experiments.deleteBtn')"
    >&#x2715;</button>
  </div>
</template>

<style scoped>
.lever-wrap { position:relative; flex:1; min-height:0; overflow:hidden; border-radius:12px; border:1px solid rgba(91,141,184,0.15); box-shadow:0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03); }
.lever-wrap canvas { position:absolute; inset:0; width:100%; height:100%; display:block; cursor:grab; }
.lever-wrap canvas:active { cursor:grabbing; }
.hover-del { position:fixed; z-index:200; width:22px; height:22px; border-radius:50%; background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; border:none; font-size:12px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; box-shadow:0 2px 8px rgba(239,68,68,0.4); transition:transform .15s, box-shadow .15s; }
.hover-del:hover { transform:scale(1.15); box-shadow:0 4px 12px rgba(239,68,68,0.5); }
</style>
