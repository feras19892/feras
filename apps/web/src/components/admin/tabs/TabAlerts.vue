<script setup lang="ts">
import type { Insights } from '../dashboard/useAdminDashboard';
import { roleLabel, roleColor } from '../dashboard/useAdminDashboard';

defineProps<{
  insights: Insights | null;
  hasAlerts: boolean;
}>();
</script>

<template>
  <div class="tab-content">
    <h2 class="section-title">🚨 التنبيهات والمشاكل</h2>

    <div v-if="insights && !hasAlerts" class="empty-state">
      <div class="empty-icon">✅</div>
      <h3>لا توجد تنبيهات</h3>
      <p>كل شيء يعمل بشكل جيد، لا توجد مشاكل مكتشفة</p>
    </div>

    <div v-if="insights && hasAlerts" class="alerts-grid">
      <div v-if="insights.inactiveUsers?.length" class="alert-card warning">
        <h3>👥 مستخدمين غير نشطين</h3>
        <div class="alert-count">{{ insights.inactiveUsers.length }}</div>
        <div class="alert-list">
          <div v-for="u in insights.inactiveUsers.slice(0, 8)" :key="u.id" class="alert-item">
            <span class="alert-item-name">{{ u.name }}</span>
            <span class="alert-item-badge" :style="{ background: roleColor(u.role) }">{{ roleLabel(u.role) }}</span>
          </div>
        </div>
        <div class="alert-footer" v-if="insights.inactiveUsers.length > 8">+{{ insights.inactiveUsers.length - 8 }} آخرين</div>
      </div>

      <div v-if="insights.emptyClasses?.length" class="alert-card warning">
        <h3>📚 فصول فارغة</h3>
        <div class="alert-count">{{ insights.emptyClasses.length }}</div>
        <div class="alert-list">
          <div v-for="c in insights.emptyClasses.slice(0, 8)" :key="c.id" class="alert-item">
            <span class="alert-item-name">{{ c.name }}</span>
            <span class="alert-item-meta">{{ c.teacher_name }}</span>
          </div>
        </div>
        <div class="alert-footer" v-if="insights.emptyClasses.length > 8">+{{ insights.emptyClasses.length - 8 }} فصول أخرى</div>
      </div>

      <div v-if="insights.ungradedCount" class="alert-card danger">
        <h3>⏰ تقارير متأخرة</h3>
        <div class="alert-count">{{ insights.ungradedCount }}</div>
        <p class="alert-desc">تقارير معلقة منذ أكثر من 3 أيام</p>
      </div>

      <div v-if="insights.noReportsTeachers?.length" class="alert-card info">
        <h3>👨‍🏫 مدرسين بدون تقارير</h3>
        <div class="alert-count">{{ insights.noReportsTeachers.length }}</div>
        <div class="alert-list">
          <div v-for="tch in insights.noReportsTeachers.slice(0, 8)" :key="tch.id" class="alert-item">
            <span class="alert-item-name">{{ tch.name }}</span>
          </div>
        </div>
        <div class="alert-footer" v-if="insights.noReportsTeachers.length > 8">+{{ insights.noReportsTeachers.length - 8 }} مدرسين آخرين</div>
      </div>
    </div>

    <div v-if="insights?.topUsers?.length" class="modern-card full" style="margin-top: 1.5rem;">
      <h3>🏆 أكثر المستخدمين نشاطاً</h3>
      <div class="top-users-grid">
        <div v-for="(u, i) in insights.topUsers" :key="u.id" class="top-user-card" :class="{ gold: i === 0, silver: i === 1, bronze: i === 2 }">
          <div class="top-user-rank">{{ i + 1 }}</div>
          <div class="top-user-info">
            <div class="top-user-name">{{ u.name }}</div>
            <div class="top-user-role">{{ roleLabel(u.role) }}</div>
          </div>
          <div class="top-user-count">{{ u.report_count }} تقرير</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title { font-size: 1.3rem; font-weight: 800; color: #e2e8f0; margin-bottom: 1.2rem; }
.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-icon { font-size: 4rem; margin-bottom: 1rem; }
.empty-state h3 { font-size: 1.5rem; color: #e2e8f0; margin-bottom: 0.5rem; }
.empty-state p { color: #94a3b8; font-size: 0.95rem; }
.alerts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem; }
.alert-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; }
.alert-card.warning { border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.05); }
.alert-card.danger { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
.alert-card.info { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.05); }
.alert-card h3 { margin: 0 0 0.8rem; font-size: 0.95rem; font-weight: 700; color: #e2e8f0; }
.alert-count { font-size: 2.5rem; font-weight: 800; color: #fbbf24; margin-bottom: 0.8rem; }
.alert-card.danger .alert-count { color: #f87171; }
.alert-card.info .alert-count { color: #60a5fa; }
.alert-desc { font-size: 0.85rem; color: #94a3b8; margin: 0; }
.alert-list { display: flex; flex-direction: column; gap: 0.4rem; }
.alert-item { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.8rem; color: #cbd5e1; padding: 0.4rem 0.6rem; background: rgba(255,255,255,0.03); border-radius: 0.3rem; }
.alert-item-name { font-weight: 600; }
.alert-item-meta { color: #64748b; font-size: 0.75rem; }
.alert-item-badge { padding: 0.1rem 0.5rem; border-radius: 1rem; font-size: 0.7rem; font-weight: 700; color: #fff; }
.alert-footer { font-size: 0.75rem; color: #64748b; text-align: center; margin-top: 0.5rem; }
.modern-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; }
.modern-card.full { grid-column: 1 / -1; }
.modern-card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 700; color: #e2e8f0; }
.top-users-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.top-user-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; transition: all 0.3s; }
.top-user-card:hover { transform: translateY(-2px); background: rgba(255,255,255,0.04); }
.top-user-card.gold { border-color: rgba(251,191,36,0.4); background: rgba(251,191,36,0.05); }
.top-user-card.silver { border-color: rgba(203,213,225,0.4); background: rgba(203,213,225,0.05); }
.top-user-card.bronze { border-color: rgba(205,127,50,0.4); background: rgba(205,127,50,0.05); }
.top-user-rank { width: 36px; height: 36px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; color: #fff; flex-shrink: 0; }
.top-user-card.gold .top-user-rank { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.top-user-card.silver .top-user-rank { background: linear-gradient(135deg, #cbd5e1, #94a3b8); }
.top-user-card.bronze .top-user-rank { background: linear-gradient(135deg, #cd7f32, #b8732d); }
.top-user-info { flex: 1; min-width: 0; }
.top-user-name { font-size: 0.9rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top-user-role { font-size: 0.75rem; color: #64748b; margin-top: 0.15rem; }
.top-user-count { font-size: 0.85rem; font-weight: 700; color: #67e8f9; }
</style>
