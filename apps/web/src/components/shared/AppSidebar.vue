<script lang="ts">
export interface SidebarItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}
export interface SidebarGroup {
  id: string;
  title: string;
  icon: string;
  items: SidebarItem[];
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

const props = defineProps<{
  groups: SidebarGroup[];
  activeId: string;
  role: 'student' | 'teacher' | 'school' | 'admin';
  userName: string;
  collapsed?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'home'): void;
  (e: 'logout'): void;
  (e: 'toggle-collapse'): void;
  (e: 'group-select', id: string): void;
}>();

const roleColor = computed(() => ({
  student: '#4ade80',
  teacher: '#a5b4fc',
  school: '#67e8f9',
  admin: '#f87171',
}[props.role]));

const openGroups = ref<Set<string>>(new Set());

function toggleGroup(id: string) {
  if (openGroups.value.has(id)) openGroups.value.delete(id);
  else openGroups.value.add(id);
}

const navGroups = computed(() => props.groups.map(g => ({
  ...g,
  isOpen: openGroups.value.has(g.id) || g.items.some(i => i.id === props.activeId),
  hasActive: g.items.some(i => i.id === props.activeId),
  totalBadge: g.items.reduce((s, i) => s + (i.badge || 0), 0) || undefined,
})));
</script>

<template>
  <aside class="app-sidebar" :class="[role, { collapsed }]">
    <div class="sidebar-head">
      <button class="brand" @click="emit('home')">
        <span class="brand-dot" :style="{ background: roleColor }"></span>
        <span v-if="!collapsed" class="brand-text">PhysLab</span>
      </button>
      <button v-if="!collapsed" class="collapse-btn" @click="emit('toggle-collapse')">◀</button>
    </div>

    <button v-if="collapsed" class="expand-btn" @click="emit('toggle-collapse')">▶</button>

    <nav class="sidebar-nav">
      <div v-for="group in navGroups" :key="group.id" class="nav-group">
        <button class="group-header" :class="{ active: group.hasActive }" @click="toggleGroup(group.id)">
          <span class="group-icon">{{ group.icon }}</span>
          <span v-if="!collapsed" class="group-title">{{ group.title }}</span>
          <span v-if="!collapsed && group.totalBadge" class="group-badge">{{ group.totalBadge }}</span>
          <span v-if="!collapsed" class="group-arrow" :class="{ open: group.isOpen }">▾</span>
        </button>
        <div v-if="!collapsed && group.isOpen" class="group-items">
          <button
            v-for="item in group.items"
            :key="item.id"
            :class="['nav-item', { active: activeId === item.id }]"
            @click="emit('select', item.id)"
          >
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-label">{{ item.label }}</span>
            <span v-if="item.badge" class="item-badge">{{ item.badge }}</span>
          </button>
        </div>
      </div>
    </nav>

    <div class="sidebar-foot">
      <div v-if="!collapsed" class="user-info">
        <span class="user-avatar">👤</span>
        <span class="user-name">{{ userName }}</span>
      </div>
      <button class="logout-btn" @click="emit('logout')" :title="t('shared.logout')">
        <span>⏻</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 240px; flex-shrink: 0; display: flex; flex-direction: column;
  background: #0a0f1c; border-inline-end: 1px solid rgba(255,255,255,0.06);
  position: sticky; top: 0; height: 100vh; transition: width 0.18s ease; z-index: 100; overflow: hidden;
}
.app-sidebar.collapsed { width: 56px; }
.app-sidebar.student { border-top: 3px solid #22c55e; }
.app-sidebar.teacher { border-top: 3px solid #6366f1; }
.app-sidebar.school { border-top: 3px solid #06b6d4; }
.app-sidebar.admin { border-top: 3px solid #ef4444; }

.sidebar-head { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.brand { display: flex; align-items: center; gap: 0.5rem; border: none; background: transparent; cursor: pointer; font-family: inherit; }
.brand-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.brand-text { font-size: 1rem; font-weight: 800; color: #f1f5f9; letter-spacing: -0.5px; }
.collapse-btn { border: none; background: transparent; color: #475569; cursor: pointer; font-size: 0.7rem; padding: 0.2rem; border-radius: 4px; }
.collapse-btn:hover { color: #94a3b8; }
.expand-btn { border: none; background: transparent; color: #475569; cursor: pointer; font-size: 0.8rem; padding: 0.5rem; }
.expand-btn:hover { color: #94a3b8; }

.sidebar-nav { flex: 1; overflow-y: auto; padding: 0.5rem; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

.nav-group { margin-bottom: 0.3rem; }
.group-header { display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.5rem 0.6rem; border: none; background: transparent; border-radius: 6px; color: #64748b; font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: inherit; text-align: start; transition: background 0.12s, color 0.12s; }
.group-header:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
.group-header.active { color: #c7d2fe; }
.group-icon { font-size: 1rem; flex-shrink: 0; }
.group-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.group-badge { min-width: 18px; height: 18px; border-radius: 999px; background: rgba(239,68,68,0.15); color: #f87171; font-size: 0.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
.group-arrow { font-size: 0.6rem; transition: transform 0.15s; opacity: 0.5; }
.group-arrow.open { transform: rotate(180deg); }

.group-items { display: flex; flex-direction: column; gap: 0.1rem; padding-inline-start: 1.5rem; padding-top: 0.2rem; }
.nav-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; border: none; background: transparent; border-radius: 6px; color: #64748b; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; text-align: start; width: 100%; transition: background 0.12s, color 0.12s; }
.nav-item:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
.nav-item.active { background: rgba(99,102,241,0.12); color: #c7d2fe; }
.item-icon { font-size: 0.85rem; flex-shrink: 0; }
.item-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-badge { min-width: 16px; height: 16px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.58rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }

.sidebar-foot { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 1rem; border-top: 1px solid rgba(255,255,255,0.04); }
.user-info { display: flex; align-items: center; gap: 0.5rem; min-width: 0; }
.user-avatar { font-size: 0.9rem; }
.user-name { font-size: 0.75rem; font-weight: 600; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.logout-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); background: transparent; color: #64748b; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.15s, color 0.15s; }
.logout-btn:hover { border-color: rgba(239,68,68,0.3); color: #f87171; }

.app-sidebar.collapsed .sidebar-head { justify-content: center; }
.app-sidebar.collapsed .sidebar-foot { justify-content: center; padding: 0.6rem; }

@media (max-width: 768px) {
  .app-sidebar { width: 56px; }
  .app-sidebar:not(.collapsed) { width: 200px; }
}
</style>
