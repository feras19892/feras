<template>
  <div class="school-home">
    <SkeletonLoader v-if="loading" type="cards" :count="4" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <template v-else>
      <header class="sh-header">
        <div>
          <h1 class="sh-title">نظرة عامة</h1>
          <p class="sh-sub">{{ schoolName }} · كود: {{ schoolCode }} · {{ today }}</p>
        </div>
        <div class="sh-badges">
          <button class="sh-badge" title="تحديث" @click="load">🔄</button>
          <button class="sh-badge" title="الإعدادات" @click="goToTab('settings')">⚙️</button>
          <SchoolHelpButton :tab-id="`overview-${activeTab}`" />
        </div>
      </header>

      <div class="tabs-nav">
        <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
          <span class="tab-icon">📊</span>
          <span class="tab-label">نظرة عامة</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'analytics' }" @click="activeTab = 'analytics'">
          <span class="tab-icon">📈</span>
          <span class="tab-label">تحليلات</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'alerts' }" @click="activeTab = 'alerts'">
          <span class="tab-icon">🚨</span>
          <span class="tab-label">تنبيهات</span>
        </button>
      </div>

      <div v-show="activeTab === 'overview'">
        <SchoolOverviewKPIs :cards="cards" :goToTab="goToTab" />
      </div>

      <div v-show="activeTab === 'analytics'">
        <SchoolOverviewAnalytics :classBarData="classBarData" :lineData="lineData" :linePoints="linePoints" :gridLines="gridLines" :recentUsers="recentUsers" :teachers="teachers" :outstanding="outstanding" :formatDate="formatDate" />
      </div>

      <div v-show="activeTab === 'alerts'">
        <SchoolOverviewAlerts :capacityAlert="capacityAlert" :struggling="struggling" :outstanding="outstanding" :feedback="feedback" :goToTab="goToTab" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import SchoolHelpButton from '@/components/school/SchoolHelpButton.vue'
import { ref } from 'vue'
import { useSchoolOverview } from '@/composables/school/useSchoolOverview'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import SchoolOverviewKPIs from './SchoolOverviewKPIs.vue'
import SchoolOverviewAnalytics from './SchoolOverviewAnalytics.vue'
import SchoolOverviewAlerts from './SchoolOverviewAlerts.vue'


const {
  loading, error, dailyReport, outstanding, struggling, teachers, feedback,
  today, schoolName, schoolCode, capacityAlert, cards, classBarData, lineData, gridLines, linePoints, recentUsers,
  formatDate, goToTab, load,
} = useSchoolOverview()

type TabKey = 'overview' | 'analytics' | 'alerts'
const activeTab = ref<TabKey>('overview')
</script>

<style scoped>
.school-home { height: 100%; width: 100%; max-width: none !important; display: flex; flex-direction: column; gap: 18px; overflow: hidden; }
.sh-header { display: flex; justify-content: space-between; align-items: center; padding: 0 4px; flex-shrink: 0; }
.sh-title { margin: 0; font-size: 20px; font-weight: 800; color: var(--as-text); }
.sh-sub { margin: 4px 0 0; font-size: 13px; color: var(--as-text-muted); }
.sh-badges { display: flex; gap: 8px; }
.sh-badge { position: relative; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--as-border); background: var(--as-raised); color: var(--as-text); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.tabs-nav { display: flex; gap: 8px; margin: 0 4px; padding: 4px; background: var(--as-surface); border: 1px solid var(--as-border); border-radius: 12px; flex-shrink: 0; overflow-x: auto; }
.tab-btn { flex: 1; min-width: 120px; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 14px; background: transparent; border: 1px solid transparent; border-radius: 10px; color: var(--as-text-muted); cursor: pointer; transition: background 0.15s, color 0.15s; }
.tab-btn:hover { background: var(--as-raised); color: var(--as-text); }
.tab-btn.active { background: var(--as-raised); border-color: var(--as-accent); color: var(--as-text); }
.tab-icon { font-size: 1.1rem; }
.tab-label { font-size: 0.78rem; font-weight: 600; }
@media (max-width: 1000px) { .tabs-nav { gap: 4px; } .tab-btn { min-width: 100px; padding: 8px 10px; } }
</style>
