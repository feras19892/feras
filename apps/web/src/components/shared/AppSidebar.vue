<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

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
}>();

const collapsedGroups = ref<Set<string>>(new Set());

function toggleGroup(groupId: string) {
  const next = new Set(collapsedGroups.value);
  if (next.has(groupId)) next.delete(groupId);
  else next.add(groupId);
  collapsedGroups.value = next;
}

function isGroupCollapsed(groupId: string) {
  return collapsedGroups.value.has(groupId);
}

function groupHasActive(groupId: string) {
  const group = props.groups.find(g => g.id === groupId);
  return group?.items.some(item => item.id === props.activeId);
}

const roleConfig = computed(() => ({
  student: { icon: '🎓', label: t('shared.roleStudent'), color: '#4ade80', accent: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.25)' },
  teacher: { icon: '👨‍🏫', label: t('shared.roleTeacher'), color: '#a5b4fc', accent: 'rgba(165,180,252,0.12)', border: 'rgba(165,180,252,0.25)' },
  school: { icon: '🏫', label: t('shared.roleSchool'), color: '#67e8f9', accent: 'rgba(103,232,249,0.12)', border: 'rgba(103,232,249,0.25)' },
  admin: { icon: '🛡️', label: t('shared.roleAdmin'), color: '#f87171', accent: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
}));

const rc = computed(() => roleConfig.value[props.role]);
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: collapsed }">
    <!-- Brand -->
    <div class="sidebar-brand" @click="emit('home')">
      <span class="brand-icon">⚛</span>
      <span v-if="!collapsed" class="brand-text">PhysLab</span>
    </div>

    <!-- Role Badge -->
    <div class="sidebar-role" :style="{ background: rc.accent, borderColor: rc.border }">
      <span class="role-icon">{{ rc.icon }}</span>
      <div v-if="!collapsed" class="role-info">
        <span class="role-name">{{ userName }}</span>
        <span class="role-tag" :style="{ color: rc.color }">{{ rc.label }}</span>
      </div>
    </div>

    <!-- Groups -->
    <nav class="sidebar-nav">
      <div v-for="group in groups" :key="group.id" class="sidebar-group">
        <button
          class="group-header"
          :class="{ active: groupHasActive(group.id) }"
          @click="toggleGroup(group.id)"
        >
          <span class="group-icon">{{ group.icon }}</span>
          <span v-if="!collapsed" class="group-title">{{ group.title }}</span>
          <span v-if="!collapsed" class="group-chevron" :class="{ rotated: isGroupCollapsed(group.id) }">▾</span>
        </button>

        <div v-if="!isGroupCollapsed(group.id) && !collapsed" class="group-items">
          <button
            v-for="item in group.items"
            :key="item.id"
            :class="['item-btn', { active: activeId === item.id }]"
            @click="emit('select', item.id)"
          >
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-label">{{ item.label }}</span>
            <span v-if="item.badge" class="item-badge">{{ item.badge }}</span>
          </button>
        </div>

        <!-- Collapsed mode: show icons only -->
        <div v-if="!isGroupCollapsed(group.id) && collapsed" class="group-items collapsed">
          <button
            v-for="item in group.items"
            :key="item.id"
            :class="['item-btn-icon', { active: activeId === item.id }]"
            @click="emit('select', item.id)"
            :title="item.label"
          >
            <span class="item-icon">{{ item.icon }}</span>
            <span v-if="item.badge" class="item-badge">{{ item.badge }}</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <button class="footer-btn" @click="emit('toggle-collapse')" :title="collapsed ? t('shared.sidebarExpand') : t('shared.sidebarCollapse')">
        <span>{{ collapsed ? '▸' : '◂' }}</span>
      </button>
      <button class="footer-btn logout" @click="emit('logout')" :title="t('shared.logout')">
        <span>⏻</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(10, 15, 28, 0.95);
  border-inline-end: 1px solid rgba(255,255,255,0.06);
  position: sticky;
  top: 0;
  height: 100vh;
  transition: width 0.2s ease;
  z-index: 100;
}
.app-sidebar.collapsed {
  width: 64px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.2rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.brand-icon {
  width: 36px; height: 36px;
  border-radius: 0.6rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 900; color: #fff;
  flex-shrink: 0;
}
.brand-text {
  font-size: 1rem; font-weight: 800; color: #f1f5f9;
  white-space: nowrap;
}

.sidebar-role {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  margin: 0.6rem;
  border-radius: 0.6rem;
  border: 1px solid;
}
.role-icon { font-size: 1.3rem; flex-shrink: 0; }
.role-info { display: flex; flex-direction: column; min-width: 0; }
.role-name {
  font-size: 0.82rem; font-weight: 700; color: #e2e8f0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.role-tag { font-size: 0.68rem; font-weight: 600; }

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.4rem 0;
}
.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

.sidebar-group {
  margin-bottom: 0.2rem;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 1.2rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s;
}
.group-header:hover { color: #94a3b8; }
.group-header.active { color: #e2e8f0; }
.group-icon { font-size: 0.9rem; flex-shrink: 0; }
.group-title { flex: 1; text-align: start; white-space: nowrap; }
.group-chevron {
  font-size: 0.7rem;
  transition: transform 0.2s;
}
.group-chevron.rotated { transform: rotate(-90deg); }

.group-items {
  display: flex;
  flex-direction: column;
  padding: 0.1rem 0;
}
.group-items.collapsed {
  align-items: center;
}

.item-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 1.2rem 0.5rem 2.2rem;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  position: relative;
  white-space: nowrap;
}
.item-btn:hover {
  background: rgba(255,255,255,0.04);
  color: #e2e8f0;
}
.item-btn.active {
  background: rgba(99,102,241,0.1);
  color: #c7d2fe;
}
.item-btn.active::before {
  content: '';
  position: absolute;
  inset-inline-start: 0;
  width: 3px;
  height: 60%;
  background: #818cf8;
  border-radius: 0 2px 2px 0;
}
.item-icon { font-size: 0.95rem; flex-shrink: 0; width: 20px; text-align: center; }
.item-label { flex: 1; text-align: start; }
.item-badge {
  min-width: 18px; height: 18px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  flex-shrink: 0;
}

.item-btn-icon {
  width: 40px; height: 40px;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  position: relative;
  margin: 0.15rem 0;
}
.item-btn-icon:hover {
  background: rgba(255,255,255,0.04);
  color: #e2e8f0;
}
.item-btn-icon.active {
  background: rgba(99,102,241,0.12);
  color: #c7d2fe;
}

.sidebar-footer {
  display: flex;
  gap: 0.3rem;
  padding: 0.6rem;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.footer-btn {
  flex: 1;
  height: 36px;
  border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.06);
  background: transparent;
  color: #64748b;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.footer-btn:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
.footer-btn.logout:hover {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.2);
  color: #f87171;
}

@media (max-width: 768px) {
  .app-sidebar {
    width: 100%;
    height: auto;
    position: fixed;
    bottom: 0;
    top: auto;
    flex-direction: row;
    overflow-x: auto;
    border-inline-end: none;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 0.3rem;
    z-index: 200;
  }
  .app-sidebar.collapsed { width: 100%; }
  .sidebar-brand, .sidebar-role, .group-header, .sidebar-footer { display: none; }
  .sidebar-nav { flex-direction: row; padding: 0; }
  .sidebar-group { margin: 0; }
  .group-items { flex-direction: row; }
  .group-items:not(.collapsed) { display: none; }
  .group-items.collapsed { display: flex; flex-direction: row; }
  .item-btn-icon { width: 44px; height: 44px; }
}
</style>
