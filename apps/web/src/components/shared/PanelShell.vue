<script setup lang="ts">
import { ref, computed } from 'vue';
import AccountSettingsModal from './AccountSettingsModal.vue';
import NotificationBell from './NotificationBell.vue';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

export interface DockItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}

const props = defineProps<{
  dockItems: DockItem[];
  activeId: string;
  title: string;
  role: 'admin' | 'school' | 'teacher' | 'student';
  userName: string;
  stats?: { icon: string; value: number | string; label: string }[];
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'home'): void;
  (e: 'logout'): void;
}>();

const hovered = ref<string | null>(null);

const roleIcon: Record<string, string> = {
  admin: '🛡️',
  school: '🏫',
  teacher: '👨‍🏫',
  student: '🎓',
};

const roleColor: Record<string, string> = {
  admin: '#f87171',
  school: '#67e8f9',
  teacher: '#a5b4fc',
  student: '#4ade80',
};

const roleLabel = computed(() => ({
  admin: t('shared.roleAdmin'),
  school: t('shared.roleSchool'),
  teacher: t('shared.roleTeacher'),
  student: t('shared.roleStudent'),
}));
</script>

<template>
  <div class="panel-shell">
    <!-- Icon Dock -->
    <nav class="dock">
      <div class="dock-brand" @click="emit('home')">⚛</div>
      <div class="dock-divider"></div>
      <button
        v-for="item in dockItems"
        :key="item.id"
        :class="['dock-btn', { active: activeId === item.id }]"
        @click="emit('select', item.id)"
        @mouseenter="hovered = item.id"
        @mouseleave="hovered = null"
      >
        <span class="dock-icon">{{ item.icon }}</span>
        <span v-if="item.badge" class="dock-badge">{{ item.badge }}</span>
        <span v-if="hovered === item.id" class="dock-tooltip">{{ item.label }}</span>
        <span v-if="activeId === item.id" class="dock-bar"></span>
      </button>
      <div class="dock-spacer"></div>
      <button class="dock-btn" @click="emit('home')">
        <span class="dock-icon">🏠</span>
      </button>
    </nav>

    <!-- Main Area -->
    <div class="panel-main">
      <!-- Top Bar -->
      <header class="bar">
        <div class="bar-left">
          <h1 class="bar-title">{{ title }}</h1>
          <div class="bar-stats" v-if="stats && stats.length">
            <span v-for="(s, i) in stats" :key="i" class="bar-stat">
              {{ s.icon }} {{ s.value }} {{ s.label }}
            </span>
          </div>
        </div>
        <div class="bar-right">
          <AccountSettingsModal />
          <NotificationBell />
          <div class="bar-user" :style="{ color: roleColor[role] }">
            <span>{{ roleIcon[role] }}</span>
            <span class="bar-username">{{ userName }}</span>
            <span class="bar-role">{{ roleLabel[role] }}</span>
          </div>
          <button class="bar-logout" @click="emit('logout')">{{ t('shared.logout') }}</button>
        </div>
      </header>

      <!-- Content -->
      <div class="panel-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-shell {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
}

/* ═══ Dock ═══ */
.dock {
  width: 64px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.8rem 0;
  gap: 0.3rem;
  background: rgba(10, 15, 28, 0.8);
  border-inline-end: 1px solid rgba(255,255,255,0.04);
  position: sticky;
  top: 0;
  height: 100vh;
}
.dock-brand {
  width: 40px; height: 40px; border-radius: 0.6rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; font-weight: 900; color: #fff; cursor: pointer;
  margin-bottom: 0.3rem;
}
.dock-divider { width: 32px; height: 1px; background: rgba(255,255,255,0.06); margin: 0.3rem 0; }
.dock-btn {
  width: 44px; height: 44px; border-radius: 0.55rem;
  border: none; background: transparent;
  color: #64748b; cursor: pointer; font-size: 1.2rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; position: relative;
}
.dock-btn:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
.dock-btn.active { background: rgba(6,182,212,0.12); color: #67e8f9; }
.dock-bar {
  position: absolute; inset-inline-start: -0.5rem;
  width: 3px; height: 20px; border-radius: 0 2px 2px 0;
  background: #06b6d4;
}
.dock-badge {
  position: absolute; top: 2px; inset-inline-end: 2px;
  min-width: 16px; height: 16px; border-radius: 999px;
  background: #ef4444; color: #fff; font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
}
.dock-tooltip {
  position: absolute; inset-inline-start: 52px;
  background: #1e293b; color: #e2e8f0;
  padding: 0.3rem 0.6rem; border-radius: 0.4rem;
  font-size: 0.75rem; font-weight: 600; white-space: nowrap;
  border: 1px solid rgba(255,255,255,0.08); z-index: 200;
}
.dock-spacer { flex: 1; }

/* ═══ Main ═══ */
.panel-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.8rem 1.5rem; gap: 1rem; flex-wrap: wrap;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  background: rgba(10,15,28,0.5); backdrop-filter: blur(12px);
  position: sticky; top: 0; z-index: 50;
}
.bar-left { display: flex; align-items: center; gap: 1rem; }
.bar-title {
  margin: 0; font-size: 1.15rem; font-weight: 700; color: #f1f5f9;
}
.bar-stats { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.bar-stat {
  font-size: 0.72rem; color: #64748b;
  padding: 0.2rem 0.5rem; border-radius: 0.35rem;
  background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.04);
}
.bar-right { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
.bar-user {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.25rem 0.55rem; border-radius: 0.4rem;
  background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.05);
  font-size: 0.75rem;
}
.bar-username { color: #cbd5e1; font-weight: 600; }
.bar-role { font-size: 0.68rem; opacity: 0.7; }
.bar-logout {
  padding: 0.3rem 0.65rem; border-radius: 0.4rem;
  border: 1px solid rgba(239,68,68,0.15); background: transparent;
  color: #f87171; cursor: pointer; font-family: inherit;
  font-size: 0.72rem; font-weight: 600; transition: all 0.15s;
}
.bar-logout:hover { background: rgba(239,68,68,0.08); }

.panel-content { flex: 1; padding: 1.5rem; overflow-y: auto; }

@media (max-width: 600px) {
  .bar-username, .bar-role { display: none; }
  .bar-stats { display: none; }
}
</style>
