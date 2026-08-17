<script setup lang="ts">
import type { SidebarItem } from '../shared/AppSidebar.vue';

defineProps<{
  title: string
  icon: string
  items: SidebarItem[]
  stats: Record<string, { count: number; sub: string }>
}>();

const emit = defineEmits<{
  (e: 'navigate', section: string): void
  (e: 'back'): void
}>();
</script>

<template>
  <div class="tab-content">

    <!-- Back -->
    <button class="go-back" @click="emit('back')">
      <span>⟵</span>
      <span>العودة للنظرة العامة</span>
    </button>

    <!-- Section Header -->
    <div class="section-header">
      <h2 class="section-title">{{ icon }} {{ title }}</h2>
    </div>

    <!-- Cards -->
    <div class="quick-links-grid">
      <button
        v-for="item in items"
        :key="item.id"
        class="quick-link-card"
        @click="emit('navigate', item.id)"
      >
        <span v-if="item.badge" class="go-badge">{{ item.badge }}</span>
        <span class="link-icon-lg">{{ item.icon }}</span>
        <span class="link-label-lg">{{ item.label }}</span>
        <template v-if="stats[item.id]?.count !== undefined">
          <span class="go-count">{{ stats[item.id].count }}</span>
          <span class="go-sub">{{ stats[item.id].sub }}</span>
        </template>
      </button>
    </div>

  </div>
</template>

<style scoped>
/* Back button */
.go-back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: #818cf8;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0;
  margin-bottom: 1rem;
  transition: color 0.15s;
}
.go-back:hover { color: #a5b4fc; }

/* ═══ Exact copies from TabOverview.vue ═══ */

/* Section Headers */
.section-header { margin-bottom: 1rem; margin-top: 1.5rem; }
.section-header:first-of-type { margin-top: 0; }
.section-title { font-size: 1.1rem; font-weight: 800; color: #e2e8f0; padding-bottom: 0.5rem; border-bottom: 2px solid rgba(99,102,241,0.2); }

/* Quick Links */
.quick-links-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.8rem; margin-bottom: 1.5rem; }
.quick-link-card { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem 0.8rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.8rem; color: #cbd5e1; cursor: pointer; transition: all 0.3s; position: relative; font-family: inherit; }
.quick-link-card:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.4); transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
.link-icon-lg { font-size: 2rem; line-height: 1; }
.link-label-lg { font-size: 0.82rem; font-weight: 600; text-align: center; }

/* Count + sub */
.go-count { font-size: 1.4rem; font-weight: 800; color: #818cf8; line-height: 1; }
.go-sub { font-size: 0.68rem; color: #64748b; text-align: center; }

/* Badge */
.go-badge { position: absolute; top: 0.4rem; inset-inline-end: 0.4rem; min-width: 18px; height: 18px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.62rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
</style>
