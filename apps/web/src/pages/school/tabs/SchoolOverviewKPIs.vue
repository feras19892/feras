<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { SchoolCard } from '@/composables/school/useSchoolOverview'


defineProps<{
  cards: SchoolCard[]
  goToTab: (tabId: string) => void
}>()
</script>

<template>
  <div class="kpi-wrap">
    <section class="sh-stats">
      <div v-for="c in cards" :key="c.label" class="sh-card" :style="{ borderInlineStartColor: c.color }">
        <div class="sh-card__top">
          <div class="sh-card__icon" :style="{ background: c.color + '22', color: c.color }">{{ c.icon }}</div>
          <span class="sh-card__total">{{ c.totalLabel }}</span>
        </div>
        <div class="sh-card__bottom">
          <div>
            <div class="sh-card__value" :style="{ color: c.color }">{{ c.value }}</div>
            <div class="sh-card__label">{{ c.label }}</div>
          </div>
          <button v-if="c.tab" class="sh-card__view" :style="{ color: c.color }" @click="goToTab(c.tab)">عرض</button>
        </div>
      </div>
    </section>

    <section class="sh-quick">
      <h3 class="sh-panel__title">وصول سريع</h3>
      <div class="sh-quick-grid">
        <button class="sh-quick-btn" @click="goToTab('warnings')">⚠️ التحذيرات</button>
        <button class="sh-quick-btn" @click="goToTab('notifications')">🔔 الإشعارات</button>
        <button class="sh-quick-btn" @click="goToTab('feedback')">💬 الشكاوى</button>
        <button class="sh-quick-btn" @click="goToTab('activity')">⏱️ سجل النشاط</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.kpi-wrap { display: flex; flex-direction: column; gap: 18px; }
.sh-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 16px; flex-shrink: 0; }
.sh-card { background: var(--as-surface); border: 1px solid var(--as-border); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; border-inline-start: 4px solid var(--as-accent); overflow: hidden; }
.sh-card__top { display: flex; justify-content: space-between; align-items: flex-start; }
.sh-card__icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.sh-card__total { font-size: 11px; color: var(--as-text-muted); }
.sh-card__bottom { display: flex; justify-content: space-between; align-items: flex-end; gap: 8px; }
.sh-card__value { font-size: 24px; font-weight: 800; line-height: 1; }
.sh-card__label { font-size: 12px; color: var(--as-text-muted); }
.sh-card__view { background: transparent; border: none; font-size: 11px; cursor: pointer; padding: 0; }
.sh-card__view:hover { text-decoration: underline; }
.sh-quick { margin-top: 8px; }
.sh-panel__title { margin: 0 0 12px; font-size: 13px; font-weight: 700; color: var(--as-text); }
.sh-quick-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
.sh-quick-btn { padding: 14px; border: 1px solid var(--as-border); border-radius: 12px; background: var(--as-surface); color: var(--as-text); cursor: pointer; font-size: 14px; transition: background 0.2s; }
.sh-quick-btn:hover { background: var(--as-raised); }
@media (max-width: 1000px) { .sh-stats { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(4, minmax(0, 1fr)); } .sh-quick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
