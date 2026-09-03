<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { Insights } from '../dashboard/useAdminDashboard';
import { roleLabel, roleColor } from '../dashboard/useAdminDashboard';


defineProps<{
  insights: Insights | null;
  hasAlerts: boolean;
  totalAlerts: number;
}>();
</script>

<template>
  <div class="tab-content">
    <div class="alert-bar">
      <div class="ab-item"><span class="ab-icon">🚨</span><span class="ab-num">{{ totalAlerts }}</span><span class="ab-label">إجمالي التنبيهات</span></div>
      <div class="ab-sep"></div>
      <div class="ab-item"><span class="ab-icon">👥</span><span class="ab-num">{{ insights?.inactiveUsers?.length ?? 0 }}</span><span class="ab-label">غير نشطين</span></div>
      <div class="ab-sep"></div>
      <div class="ab-item"><span class="ab-icon">📚</span><span class="ab-num">{{ insights?.emptyClasses?.length ?? 0 }}</span><span class="ab-label">فصول فارغة</span></div>
      <div class="ab-sep"></div>
      <div class="ab-item"><span class="ab-icon">⏰</span><span class="ab-num">{{ insights?.ungradedCount ?? 0 }}</span><span class="ab-label">تقارير متأخرة</span></div>
    </div>

    <div v-if="insights && !hasAlerts" class="empty-state">
      <div class="empty-icon">✅</div>
      <h3>لا توجد تنبيهات</h3>
      <p>كل شيء يعمل بشكل جيد، لا توجد مشاكل مكتشفة</p>
    </div>

    <div v-if="insights && hasAlerts" class="alerts-grid">
      <div v-if="insights.inactiveUsers?.length" class="alert-card warning">
        <h3>👥 مستخدمين غير نشطين</h3>
        <div class="alert-count">{{ insights.inactiveUsers.length }}</div>
        <div class="alert-scroll">
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
        <div class="alert-scroll">
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
        <div class="alert-scroll">
          <div v-for="tch in insights.noReportsTeachers.slice(0, 8)" :key="tch.id" class="alert-item">
            <span class="alert-item-name">{{ tch.name }}</span>
          </div>
        </div>
        <div class="alert-footer" v-if="insights.noReportsTeachers.length > 8">+{{ insights.noReportsTeachers.length - 8 }} مدرسين آخرين</div>
      </div>
    </div>

    <div v-if="insights?.topUsers?.length" class="dual-card">
      <h3 class="card-title">🏆 أكثر المستخدمين نشاطاً</h3>
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
.tab-content { display: flex; flex-direction: column; gap: 1.2rem; }
.alert-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.8rem; padding: 1rem 1.2rem; background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; }
.ab-item { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 0.6rem 0.4rem; min-height: 72px; justify-content: center; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); }
.ab-icon { font-size: 1.1rem; }
.ab-num { font-size: 1.2rem; font-weight: 800; color: #e2e8f0; line-height: 1; }
.ab-label { font-size: 0.72rem; color: #64748b; font-weight: 600; text-align: center; }
.ab-sep { display: none; }
.empty-state { text-align: center; padding: 3rem 2rem; }
.empty-icon { font-size: 3rem; margin-bottom: 0.8rem; }
.empty-state h3 { font-size: 1.2rem; color: #e2e8f0; margin: 0 0 0.3rem; }
.empty-state p { color: #94a3b8; font-size: 0.85rem; margin: 0; }
.alerts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem; }
.alert-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.2rem; }
.alert-card.warning { border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.05); }
.alert-card.danger { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
.alert-card.info { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.05); }
.alert-card h3 { margin: 0 0 0.6rem; font-size: 0.88rem; font-weight: 700; color: #e2e8f0; }
.alert-count { font-size: 2rem; font-weight: 800; color: #fbbf24; margin-bottom: 0.6rem; }
.alert-card.danger .alert-count { color: #f87171; }
.alert-card.info .alert-count { color: #60a5fa; }
.alert-desc { font-size: 0.82rem; color: #94a3b8; margin: 0; }
.alert-scroll { max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.3rem; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
.alert-scroll::-webkit-scrollbar { width: 4px; }
.alert-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
.alert-item { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.78rem; color: #cbd5e1; padding: 0.4rem 0.6rem; background: rgba(255,255,255,0.03); border-radius: 4px; }
.alert-item-name { font-weight: 600; }
.alert-item-meta { color: #64748b; font-size: 0.72rem; }
.alert-item-badge { padding: 0.1rem 0.5rem; border-radius: 999px; font-size: 0.68rem; font-weight: 700; color: #fff; }
.alert-footer { font-size: 0.72rem; color: #64748b; text-align: center; margin-top: 0.4rem; }
.dual-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1.2rem; }
.card-title { margin: 0 0 0.8rem; font-size: 0.88rem; font-weight: 700; color: #e2e8f0; }
.top-users-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.8rem; }
.top-user-card { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; }
.top-user-card.gold { border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.04); }
.top-user-card.silver { border-color: rgba(203,213,225,0.3); background: rgba(203,213,225,0.04); }
.top-user-card.bronze { border-color: rgba(205,127,50,0.3); background: rgba(205,127,50,0.04); }
.top-user-rank { width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; color: #fff; flex-shrink: 0; }
.top-user-card.gold .top-user-rank { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.top-user-card.silver .top-user-rank { background: linear-gradient(135deg, #cbd5e1, #94a3b8); }
.top-user-card.bronze .top-user-rank { background: linear-gradient(135deg, #cd7f32, #b8732d); }
.top-user-info { flex: 1; min-width: 0; }
.top-user-name { font-size: 0.85rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top-user-role { font-size: 0.72rem; color: #64748b; }
.top-user-count { font-size: 0.82rem; font-weight: 700; color: #67e8f9; }
</style>
