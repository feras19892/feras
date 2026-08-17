<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, useSlots } from 'vue'
import { useVirtualScroll } from '../../composables/useVirtualScroll'

const props = withDefaults(defineProps<{
  items: T[]
  itemHeight?: number
  height?: number
  overscan?: number
  keyField?: string
}>(), {
  itemHeight: 48,
  height: 400,
  overscan: 5,
  keyField: 'id',
})

const slots = useSlots()
const containerRef = ref<HTMLElement | null>(null)
const visibleHeight = ref(props.height)

const itemsRef = computed(() => props.items)
const { totalHeight, visibleItems, onScroll } = useVirtualScroll(
  itemsRef,
  props.itemHeight,
  visibleHeight,
  props.overscan
)

function getKey(item: T, index: number): string | number {
  return item[props.keyField] ?? index
}
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-table-container"
    :style="{ height: height + 'px' }"
    @scroll="onScroll"
  >
    <div class="virtual-table-spacer" :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div
        v-for="{ item, index, offsetY } in visibleItems"
        :key="getKey(item, index)"
        class="virtual-table-row"
        :style="{ height: itemHeight + 'px', transform: `translateY(${offsetY}px)` }"
      >
        <slot name="row" :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-table-container {
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  border-radius: 0.5rem;
}
.virtual-table-spacer {
  width: 100%;
}
.virtual-table-row {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
}
</style>
