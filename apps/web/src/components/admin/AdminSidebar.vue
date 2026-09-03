<template>
  <nav class="admin-sidebar__nav" :aria-label="t('admin.aria.mainNav')">
    <div v-for="group in groups" :key="group.title" class="admin-sidebar__section">
      <div class="admin-sidebar__title">{{ t(group.title, group.title) }}</div>
      <button
        v-for="item in groupItems(group)"
        :key="item.id"
        class="admin-sidebar__item"
        :class="{ active: item.tabId === activeId }"
        :aria-current="item.tabId === activeId ? 'page' : undefined"
        @click="emits('select', item.tabId)"
      >
        <span class="admin-sidebar__icon" aria-hidden="true">{{ item.icon }}</span>
        <span>{{ t(item.label, item.label) }}</span>
        <span v-if="item.badge && item.badge > 0" class="admin-sidebar__badge">{{ item.badge > 99 ? '99+' : item.badge }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'

export interface AdminNavItem {
  id: string
  label: string
  icon: string
  tabId: string
  badge?: number
}

interface SidebarGroup { title: string; ids: string[] }

interface Props {
  items: AdminNavItem[]
  activeId: string
  groups?: SidebarGroup[]
}

const props = defineProps<Props>()
const emits = defineEmits<{ select: [tabId: string] }>()

const groups = computed(() => props.groups?.length ? props.groups : [])

function groupItems(group: SidebarGroup) {
  return props.items.filter(item => group.ids.includes(item.id))
}
</script>

<style scoped>
.admin-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100vh;
  overflow-y: auto;
  padding: 12px;
  box-sizing: border-box;
  background: var(--as-sidebar-bg, #0b1121);
}

.admin-sidebar__section {
  margin-bottom: 16px;
}

.admin-sidebar__title {
  padding: 0 10px 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.admin-sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #cbd5e1;
  font-family: inherit;
  font-size: 13px;
  text-align: start;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.admin-sidebar__item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.admin-sidebar__item.active {
  background: #fff;
  color: #111827;
  font-weight: 700;
}

.admin-sidebar__icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.admin-sidebar__badge {
  margin-inline-start: auto;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  flex-shrink: 0;
}
</style>
