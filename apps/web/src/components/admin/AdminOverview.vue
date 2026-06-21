<script setup lang="ts">
import { computed } from 'vue';

interface RoleStat { role: string; count: number }
interface UserStats { total: number; byRole: RoleStat[] }
interface ClassStats { total: number }
interface ReportStats { total: number; graded: number }
interface StatsData { users: UserStats; classes: ClassStats; reports: ReportStats }

const props = defineProps<{
  stats: StatsData;
}>();

function roleColor(role: string) {
  switch (role) {
    case 'admin': return '#f87171';
    case 'teacher': return '#60a5fa';
    case 'student': return '#34d399';
    default: return '#94a3b8';
  }
}

const roleLabels: Record<string, string> = {
  admin: 'أدمن',
  teacher: 'مدرس',
  student: 'طالب',
};

const totalUsers = computed(() => props.stats?.users?.total || 1);
</script>

<template>
  <div class="section">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-value">{{ stats.users.total }}</div>
        <div class="stat-label">إجمالي المستخدمين</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏫</div>
        <div class="stat-value">{{ stats.classes.total }}</div>
        <div class="stat-label">الفصول</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-value">{{ stats.reports.total }}</div>
        <div class="stat-label">التقارير</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value">{{ stats.reports.graded }}</div>
        <div class="stat-label">مصحح</div>
      </div>
    </div>

    <div class="role-chart">
      <h3>توزيع المستخدمين</h3>
      <div class="role-bars">
        <div v-for="r in stats.users.byRole" :key="r.role" class="role-bar">
          <span class="role-name" :style="{ color: roleColor(r.role) }">{{ roleLabels[r.role] || r.role }}</span>
          <div class="role-track">
            <div class="role-fill" :style="{ width: (r.count / Math.max(totalUsers, 1) * 100) + '%', background: roleColor(r.role) }"></div>
          </div>
          <span class="role-count">{{ r.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: rgba(15,23,42,0.6);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 0.75rem;
  padding: 1.2rem;
  text-align: center;
}
.stat-icon { font-size: 1.5rem; margin-bottom: 0.3rem; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: #67e8f9; }
.stat-label { font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem; }

.role-chart { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; }
.role-chart h3 { margin: 0 0 1rem; font-size: 1rem; color: #e2e8f0; }
.role-bars { display: flex; flex-direction: column; gap: 0.6rem; }
.role-bar { display: flex; align-items: center; gap: 0.8rem; }
.role-name { width: 80px; font-weight: 700; font-size: 0.85rem; text-align: right; }
.role-track { flex: 1; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
.role-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.role-count { width: 30px; text-align: left; font-size: 0.85rem; color: #e2e8f0; font-weight: 700; }
</style>
