<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAdminSystemHealth } from '../../services/admin.service';

interface HealthCounts { users: number; classes: number; reports: number; sessions: number }
interface HealthToday { logins: number; signups: number; reports: number }
interface HealthData { counts: HealthCounts; today: HealthToday; dbSize: number; tables: Record<string, number> }

const health = ref<HealthData | null>(null);
const loading = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getAdminSystemHealth();
    if (res.success) health.value = res.health;
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || 'فشل التحميل';
  } finally {
    loading.value = false;
  }
}

function formatBytes(b: number) {
  if (!b) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(2)} ${units[i]}`;
}

onMounted(load);
</script>

<template>
  <div class="health-section">
    <div class="section-header">
      <h3>🖥️ حالة النظام</h3>
      <button class="btn-primary" @click="load">🔄 تحديث</button>
    </div>

    <div v-if="loading" class="loading">جاري التحميل...</div>
    <div v-else-if="error" class="error">❌ {{ error }}</div>
    <template v-else-if="health">
      <div class="stats-row">
        <div class="mini-card"><div class="mini-value">{{ health.counts.users }}</div><div class="mini-label">مستخدمين</div></div>
        <div class="mini-card"><div class="mini-value">{{ health.counts.classes }}</div><div class="mini-label">فصول</div></div>
        <div class="mini-card"><div class="mini-value">{{ health.counts.reports }}</div><div class="mini-label">تقارير</div></div>
        <div class="mini-card"><div class="mini-value">{{ health.counts.sessions }}</div><div class="mini-label">جلسات نشطة</div></div>
        <div class="mini-card"><div class="mini-value">{{ formatBytes(health.dbSize) }}</div><div class="mini-label">حجم DB</div></div>
      </div>

      <div class="today-row">
        <div class="mini-card"><div class="mini-value">{{ health.today.logins }}</div><div class="mini-label">دخول اليوم</div></div>
        <div class="mini-card"><div class="mini-value">{{ health.today.signups }}</div><div class="mini-label">تسجيلات اليوم</div></div>
        <div class="mini-card"><div class="mini-value">{{ health.today.reports }}</div><div class="mini-label">تقارير اليوم</div></div>
      </div>

      <div class="table-card">
        <h4>📊 إحصائيات الجداول</h4>
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>الجدول</th><th>الصفوف</th></tr></thead>
            <tbody>
              <tr v-for="(count, name) in health.tables" :key="name">
                <td>{{ name }}</td>
                <td>{{ count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.health-section { color: #e2e8f0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section-header h3 { margin: 0; font-size: 1.1rem; }
.loading { text-align: center; color: #64748b; padding: 2rem; }
.error { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }
.btn-primary { padding: 0.45rem 0.9rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.85rem; }

.stats-row, .today-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
.mini-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.8rem; text-align: center; }
.mini-value { font-size: 1.4rem; font-weight: 800; color: #67e8f9; }
.mini-label { font-size: 0.75rem; color: #94a3b8; }

.table-card { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; }
.table-card h4 { margin: 0 0 0.75rem; font-size: 1rem; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: right; padding: 0.6rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
</style>
