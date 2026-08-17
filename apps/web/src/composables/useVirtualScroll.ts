import { ref, computed, type Ref } from 'vue'

export function useVirtualScroll<T>(
  items: Ref<T[]>,
  itemHeight: number,
  visibleHeight: Ref<number>,
  overscan = 5
) {
  const scrollTop = ref(0)

  const totalHeight = computed(() => items.value.length * itemHeight)

  const startIndex = computed(() => {
    const idx = Math.floor(scrollTop.value / itemHeight) - overscan
    return Math.max(0, idx)
  })

  const endIndex = computed(() => {
    const visibleCount = Math.ceil(visibleHeight.value / itemHeight)
    const idx = startIndex.value + visibleCount + overscan * 2
    return Math.min(items.value.length, idx)
  })

  const visibleItems = computed(() => {
    return items.value.slice(startIndex.value, endIndex.value).map((item, i) => ({
      item,
      index: startIndex.value + i,
      offsetY: (startIndex.value + i) * itemHeight,
    }))
  })

  function onScroll(e: Event) {
    const target = e.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  return {
    totalHeight,
    startIndex,
    endIndex,
    visibleItems,
    onScroll,
  }
}
