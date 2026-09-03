import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { usePermissions } from '@/composables/shared/usePermissions'
import type { DashboardConfig, SidebarItem } from '@/core/types/dashboard.types'

export function useDashboard(role: 'admin' | 'school' | 'teacher' | 'student', config?: DashboardConfig) {
  const auth = useAuthStore()
  const { isAllowed, isReady, hasPermission } = usePermissions(role, config?.permissions)
  const isSidebarCollapsed = ref(false)
  const sidebarWidth = computed(() => isSidebarCollapsed.value ? '72px' : '280px')

  // Filter sidebar items by their declared permissions, if any
  const sidebarItems = computed<SidebarItem[]>(() => {
    const items = config?.layout.sidebar.items ?? []
    return items.filter(item => !item.permissions || item.permissions.some(hasPermission))
  })

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed.value))
  }

  async function handleLogout() {
    try { await auth.logout() } catch { /* ignore */ }
    localStorage.removeItem('sidebarCollapsed')
    localStorage.removeItem('lastTab_student')
    localStorage.removeItem('lastTab_teacher')
    localStorage.removeItem('lastTab_admin')
    localStorage.removeItem('lastTab_school')
    window.location.href = '/'
  }

  onMounted(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) isSidebarCollapsed.value = saved === 'true'
  })

  return {
    user: auth.user,
    isSidebarCollapsed,
    sidebarWidth,
    sidebarItems,
    toggleSidebar,
    handleLogout,
    isAllowed,
    isReady,
  }
}
