<template>
  <div>
    <h2 class="panel__title">📜 سجل التدقيق</h2>
    <SkeletonLoader v-if="loading" type="cards" :count="3" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <template v-else>
      <div class="charts-row">
        <div class="chart-panel wide">
          <h3 class="chart-title">تغييرات قاعدة البيانات</h3>
          <div v-if="audit.length" class="table-scroll">
            <table class="data-table">
              <thead><tr><th>التاريخ</th><th>الجدول</th><th>العملية</th><th>السجل</th><th>المستخدم</th></tr></thead>
              <tbody>
                <tr v-for="a in audit" :key="a.id">
                  <td>{{ formatDate(a.created_at) }}</td>
                  <td>{{ a.table_name }}</td>
                  <td>{{ a.action }}</td>
                  <td>{{ a.record_id }}</td>
                  <td>{{ a.actor_name || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty">لا توجد تغييرات مسجّلة</p>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel wide">
          <h3 class="chart-title">حركات المستخدمين</h3>
          <div v-if="activities.length" class="table-scroll">
            <table class="data-table">
              <thead><tr><th>التاريخ</th><th>المستخدم</th><th>الدور</th><th>العملية</th><th>الهدف</th></tr></thead>
              <tbody>
                <tr v-for="a in activities" :key="a.id">
                  <td>{{ formatDate(a.created_at) }}</td>
                  <td>{{ a.actor_name || '—' }}</td>
                  <td>{{ a.actor_role || '—' }}</td>
                  <td>{{ a.action }}</td>
                  <td>{{ a.target_type || '—' }} / {{ a.target_id || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty">لا توجد نشاطات</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminAuditLog, getAdminActivity, type AuditLogEntry, type AdminActivityItem } from '@/services/admin.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'

const loading = ref(true)
const error = ref('')
const audit = ref<AuditLogEntry[]>([])
const activities = ref<AdminActivityItem[]>([])

function formatDate(d?: string) { return d ? new Date(d).toLocaleString('ar') : '—' }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [a, ac] = await Promise.all([getAdminAuditLog(), getAdminActivity()])
    if (a.success) audit.value = a.audit
    if (ac.success) activities.value = ac.activities
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 1.2rem; }
.chart-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.7rem; padding: 1rem; }
.chart-panel.wide { grid-column: 1 / -1; }
.chart-title { margin: 0 0 0.8rem; font-size: 0.9rem; font-weight: 700; color: #e2e8f0; }
.empty { padding: 2rem; text-align: center; color: #64748b; font-size: 0.85rem; }
.table-scroll { max-height: 300px; overflow-y: auto; border-radius: 6px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1; }
.data-table th { position: sticky; top: 0; background: #0f172a; z-index: 1; text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; }
.data-table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.04); }
</style>
