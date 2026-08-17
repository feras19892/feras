<script setup lang="ts">
import type { SystemHealth, DetailedStats } from '../dashboard/useAdminDashboard';
import { formatTime } from '../dashboard/useAdminDashboard';

defineProps<{
  health: SystemHealth;
  detailed: DetailedStats | null;
  systemStatus: { ok: boolean; label: string; cls: string };
  recentActivityList: { actor_name: string; action: string; created_at?: string }[];
  healthTables: [string, number][];
}>();
</script>

<template>
  <div class="tab-content">
    <div class="kpi-bar">
      <div class="kpi-item"><span class="kpi-icon">📊</span><span class="kpi-num">{{ health.today.logins }}</span><span class="kpi-label">دخول اليوم</span></div>
      <div class="kpi-sep"></div>
      <div class="kpi-item"><span class="kpi-icon">✨</span><span class="kpi-num">{{ health.today.signups }}</span><span class="kpi-label">تسجيل جديد</span></div>
      <div class="kpi-sep"></div>
      <div class="kpi-item"><span class="kpi-icon">📝</span><span class="kpi-num">{{ health.today.reports }}</span><span class="kpi-label">تقارير اليوم</span></div>
      <div class="kpi-sep"></div>
      <div class="kpi-item" v-if="detailed"><span class="kpi-icon">⚡</span><span class="kpi-num">{{ detailed.totals.active_now }}</span><span class="kpi-label">نشط الآن</span></div>
      <div class="kpi-sep" v-if="detailed"></div>
      <div class="kpi-item" :class="systemStatus.cls"><span class="kpi-icon">🩺</span><span class="kpi-label">{{ systemStatus.label }}</span></div>
    </div>

    <div class="dual-row">
      <div class="dual-card">
        <h3 class="card-title">🩺 صحة النظام</h3>
        <div class="health-grid">
          <div class="health-item"><span class="health-label">المستخدمين</span><span class="health-value">{{ health.counts.users }}</span></div>
          <div class="health-item"><span class="health-label">الفصول</span><span class="health-value">{{ health.counts.classes }}</span></div>
          <div class="health-item"><span class="health-label">التقارير</span><span class="health-value">{{ health.counts.reports }}</span></div>
          <div class="health-item"><span class="health-label">الجلسات</span><span class="health-value success">{{ health.counts.sessions }}</span></div>
          <div class="health-item"><span class="health-label">الملاحظات</span><span class="health-value">{{ health.counts.feedback }}</span></div>
          <div class="health-item"><span class="health-label">سجل النشاط</span><span class="health-value">{{ health.counts.activity }}</span></div>
          <div class="health-item"><span class="health-label">حجم القاعدة</span><span class="health-value">{{ Math.round(health.dbSize / 1024) }} KB</span></div>
          <div class="health-item" v-if="detailed"><span class="health-label">نشط الآن</span><span class="health-value success">{{ detailed.totals.active_now }}</span></div>
        </div>
      </div>

      <div class="dual-card">
        <h3 class="card-title">🕐 آخر النشاطات</h3>
        <div class="activity-scroll">
          <div v-for="(act, i) in recentActivityList" :key="i" class="activity-row">
            <div class="activity-dot"></div>
            <div class="activity-info">
              <div class="activity-name">{{ act.actor_name }}</div>
              <div class="activity-action">{{ act.action === 'login' ? 'تسجيل دخول' : act.action }}</div>
            </div>
            <div class="activity-time">{{ formatTime(act.created_at) }}</div>
          </div>
          <div v-if="!recentActivityList.length" class="empty-state">لا يوجد نشاط حديث</div>
        </div>
      </div>
    </div>

    <div class="dual-card" v-if="healthTables.length">
      <h3 class="card-title">🗄️ جداول قاعدة البيانات</h3>
      <table class="db-table">
        <thead><tr><th>الجدول</th><th>السجلات</th></tr></thead>
        <tbody>
          <tr v-for="[name, count] in healthTables" :key="name">
            <td class="db-name">{{ name }}</td><td class="db-count">{{ count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.tab-content { display: flex; flex-direction: column; gap: 1.2rem; }
.kpi-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.8rem; padding: 1rem 1.2rem; background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; }
.kpi-item { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 0.6rem 0.4rem; min-height: 72px; justify-content: center; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); }
.kpi-icon { font-size: 1.1rem; }
.kpi-num { font-size: 1.2rem; font-weight: 800; color: #e2e8f0; line-height: 1; }
.kpi-label { font-size: 0.72rem; color: #64748b; font-weight: 600; text-align: center; }
.kpi-item.success .kpi-label { color: #34d399; }
.kpi-sep { display: none; }
.dual-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
@media (max-width: 768px) { .dual-row { grid-template-columns: 1fr; } }
.dual-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1.2rem; }
.card-title { margin: 0 0 0.8rem; font-size: 0.88rem; font-weight: 700; color: #e2e8f0; }
.health-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.health-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.7rem; background: rgba(255,255,255,0.02); border-radius: 4px; border: 1px solid rgba(255,255,255,0.03); }
.health-label { font-size: 0.75rem; color: #94a3b8; }
.health-value { font-size: 0.85rem; font-weight: 700; color: #e2e8f0; }
.health-value.success { color: #34d399; }
.activity-scroll { max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.3rem; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
.activity-scroll::-webkit-scrollbar { width: 4px; }
.activity-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
.activity-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); }
.activity-row:hover { background: rgba(99,102,241,0.04); }
.activity-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366f1; flex-shrink: 0; }
.activity-info { flex: 1; min-width: 0; }
.activity-name { font-size: 0.78rem; font-weight: 600; color: #e2e8f0; }
.activity-action { font-size: 0.7rem; color: #64748b; }
.activity-time { font-size: 0.7rem; color: #475569; flex-shrink: 0; }
.empty-state { text-align: center; color: #475569; padding: 1.5rem; font-size: 0.82rem; }
.db-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.db-table thead th { text-align: start; padding: 0.5rem 0.6rem; font-size: 0.68rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.db-table thead th:last-child { text-align: end; }
.db-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.12s; }
.db-table tbody tr:hover { background: rgba(99,102,241,0.03); }
.db-table tbody td { padding: 0.4rem 0.6rem; }
.db-name { color: #cbd5e1; font-family: monospace; font-size: 0.75rem; }
.db-count { color: #67e8f9; font-weight: 700; text-align: end; }
</style>
