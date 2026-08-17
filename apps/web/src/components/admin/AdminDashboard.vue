<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import type { AdminStats } from '../../services/admin.service';
import { useAdminDashboard } from './dashboard/useAdminDashboard';
import TabOverview from './tabs/TabOverview.vue';
import TabPerformance from './tabs/TabPerformance.vue';
import TabAlerts from './tabs/TabAlerts.vue';
import TabAnalytics from './tabs/TabAnalytics.vue';
import TabAcademic from './tabs/TabAcademic.vue';

const props = defineProps<{ stats: AdminStats | null }>();
const { t } = useI18n();
const stats = computed(() => props.stats);

const {
  activeTab, detailed, academic, health, insights, loading, error, load,
  usersByRole, topSchools, topClasses, maxHourly, maxDaily,
  completionRate, gradingRate, activityRate, systemStatus,
  totalAlerts, hasAlerts, recentActivityList, academicGlobal, classHealth, healthTables,
} = useAdminDashboard(stats);

const emit = defineEmits<{ (e: 'navigate', section: string): void }>();

onMounted(load);
</script>

<template>
  <div class="modern-dash">
    <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
    <div v-else-if="error" class="error">❌ {{ error }}</div>
    <template v-else-if="stats && health">

      <div class="tabs-nav">
        <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
          <span class="tab-icon">📊</span>
          <span class="tab-label">{{ t('admin.tabOverview') }}</span>
          <span class="tab-count">{{ stats?.users?.total ?? 0 }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'performance' }" @click="activeTab = 'performance'">
          <span class="tab-icon">📈</span>
          <span class="tab-label">{{ t('admin.tabPerformance') }}</span>
          <span class="tab-count">{{ stats?.reports?.total ?? 0 }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'alerts' }" @click="activeTab = 'alerts'">
          <span class="tab-icon">🚨</span>
          <span class="tab-label">{{ t('admin.tabAlerts') }}</span>
          <span class="tab-count" v-if="totalAlerts > 0">{{ totalAlerts }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'analytics' }" @click="activeTab = 'analytics'">
          <span class="tab-icon">📉</span>
          <span class="tab-label">{{ t('admin.tabAnalytics') }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'academic' }" @click="activeTab = 'academic'">
          <span class="tab-icon">🎓</span>
          <span class="tab-label">{{ t('admin.tabAcademic') }}</span>
          <span class="tab-count" v-if="academic">{{ academic.classes.length }}</span>
        </button>
      </div>

      <TabOverview v-show="activeTab === 'overview'"
        :stats="stats" :health="health" :detailed="detailed"
        :users-by-role="usersByRole" :system-status="systemStatus"
        :recent-activity-list="recentActivityList" :health-tables="healthTables"
        :top-schools="topSchools" :top-classes="topClasses"
        @navigate="emit('navigate', $event)"
      />

      <TabPerformance v-show="activeTab === 'performance'"
        :detailed="detailed" :completion-rate="completionRate"
        :grading-rate="gradingRate" :activity-rate="activityRate"
        :top-schools="topSchools" :top-classes="topClasses"
      />

      <TabAlerts v-show="activeTab === 'alerts'"
        :insights="insights" :has-alerts="hasAlerts"
      />

      <TabAnalytics v-show="activeTab === 'analytics'"
        :detailed="detailed" :completion-rate="completionRate"
        :grading-rate="gradingRate" :activity-rate="activityRate"
        :max-hourly="maxHourly" :max-daily="maxDaily"
      />

      <TabAcademic v-show="activeTab === 'academic'"
        :academic="academic" :academic-global="academicGlobal" :class-health="classHealth"
      />

    </template>
  </div>
</template>

<style scoped>
.modern-dash { color: #e2e8f0; }
.loading { text-align: center; padding: 2rem; color: #475569; }
.error { background: rgba(239,68,68,0.08); color: #f87171; padding: 0.8rem; border-radius: 4px; border: 1px solid rgba(239,68,68,0.15); text-align: center; font-size: 0.85rem; }
.tabs-nav { display: flex; gap: 0.3rem; margin-bottom: 1rem; padding: 0.3rem; background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; overflow-x: auto; }
.tab-btn { flex: 1; min-width: 120px; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; padding: 0.6rem 0.8rem; background: transparent; border: 1px solid transparent; border-radius: 4px; color: #64748b; cursor: pointer; transition: background 0.12s, color 0.12s; }
.tab-btn:hover { background: rgba(255,255,255,0.03); color: #e2e8f0; }
.tab-btn.active { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.15); color: #e2e8f0; }
.tab-icon { font-size: 1.1rem; }
.tab-label { font-size: 0.78rem; font-weight: 600; }
.tab-count { font-size: 0.7rem; padding: 0.1rem 0.4rem; background: rgba(99,102,241,0.15); border-radius: 999px; color: #a5b4fc; font-weight: 700; }
.tab-btn.active .tab-count { background: rgba(99,102,241,0.25); color: #c7d2fe; }
</style>
