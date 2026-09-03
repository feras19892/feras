import { ref, computed, shallowRef, triggerRef, watch } from 'vue'
import { usePermissions } from '@/composables/shared/usePermissions'
import type { DashboardConfig, TabConfig } from '@/core/types/dashboard.types'

export function useTabs(config: DashboardConfig) {
  const { hasPermission } = usePermissions(config.role, config.permissions)
  const tabs = computed<TabConfig[]>(() =>
    config.tabs.filter(t => !t.permissions || t.permissions.some(hasPermission))
  )
  const currentTabId = ref(tabs.value[0]?.id || '')
  const tabComponents = shallowRef<Record<string, any>>({})
  const tabError = ref('')
  let activeLoadId: string | null = null

  const currentTab = computed(() =>
    tabs.value.find(t => t.id === currentTabId.value)
  )

  const currentTabComponent = computed(() => {
    const tab = currentTab.value
    if (!tab) return null
    return tabComponents.value[tab.id] || null
  })

  async function loadTabComponent(tabId: string): Promise<boolean> {
    const tab = tabs.value.find(t => t.id === tabId)
    if (!tab) return false
    if (tabComponents.value[tabId]) return true
    activeLoadId = tabId
    try {
      const component = await tab.component()
      if (activeLoadId !== tabId) return false
      tabComponents.value[tabId] = component.default || component
      triggerRef(tabComponents)
      tabError.value = ''
      return true
    } catch (e: any) {
      if (activeLoadId === tabId) tabError.value = e?.message || 'فشل تحميل المحتوى'
      return false
    }
  }

  async function switchTab(tabId: string) {
    const tab = tabs.value.find(t => t.id === tabId)
    if (!tab) return
    const ok = await loadTabComponent(tabId)
    if (!ok) return
    currentTabId.value = tabId
  }

  // Load the first allowed tab component on init
  if (tabs.value[0]) {
    loadTabComponent(tabs.value[0].id).catch(() => {})
  }

  watch(tabs, (newTabs) => {
    if (!newTabs.find(t => t.id === currentTabId.value)) {
      const fallback = newTabs[0]
      if (fallback) {
        loadTabComponent(fallback.id)
          .then(ok => { if (ok) currentTabId.value = fallback.id })
          .catch(() => {})
      } else {
        currentTabId.value = ''
      }
    }
  })

  const breadcrumbs = computed(() => {
    const tab = currentTab.value
    return tab ? [
      { label: config.title, path: `/${config.role}` },
      { label: tab.label, path: `/${config.role}?tab=${tab.id}` }
    ] : []
  })

  return {
    tabs,
    currentTabId,
    currentTab,
    currentTabComponent,
    tabError,
    switchTab,
    breadcrumbs,
    tabComponents
  }
}
