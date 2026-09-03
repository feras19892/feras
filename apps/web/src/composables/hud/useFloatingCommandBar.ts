import { computed } from 'vue'
import type { DashboardConfig } from '@/core/types/dashboard.types'

export interface FloatingCommandItem {
  id: string
  label: string
  icon: string
}

export function useFloatingCommandBar(config: DashboardConfig, activeId: string) {
  const items = computed<FloatingCommandItem[]>(() =>
    config.tabs.map(t => ({ id: t.id, label: t.label, icon: t.icon }))
  )

  const activeIndex = computed(() =>
    items.value.findIndex(i => i.id === activeId)
  )

  return {
    items,
    activeIndex,
  }
}
