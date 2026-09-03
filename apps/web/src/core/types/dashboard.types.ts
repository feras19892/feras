export interface DashboardConfig {
  id: string
  role: 'admin' | 'school' | 'teacher' | 'student'
  title: string
  icon: string
  tabs: TabConfig[]
  layout: LayoutConfig
  permissions: string[]
}

export interface TabConfig {
  id: string
  label: string
  icon: string
  component: () => Promise<any>
  permissions?: string[]
  badge?: () => Promise<number>
  lazy: boolean
}

export interface HeaderConfig {
  showBreadcrumbs: boolean
  showSearch: boolean
  showNotifications: boolean
}

export interface LayoutConfig {
  sidebar: SidebarConfig
  header: HeaderConfig
  showChat?: boolean
  showNotifications: boolean
}

export interface SidebarConfig {
  collapsible: boolean
  width: string
  items: SidebarItem[]
}

export interface SidebarItem {
  id: string
  label: string
  icon: string
  tabId: string
  badge?: number | (() => number)
  permissions?: string[]
  children?: SidebarItem[]
}

export interface StoreState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface CacheConfig {
  ttl: number
  staleWhileRevalidate: boolean
}
