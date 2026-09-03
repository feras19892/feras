<template>
  <div>
    <h2 class="panel__title">🗄️ الصيانة والتخزين</h2>
    <SkeletonLoader v-if="loading" type="cards" :count="3" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <template v-else>
      <div v-if="health" class="metric-cards">
        <div class="metric-card" style="border-top-color: #3b82f6;">
          <div class="metric-card__value" style="color: #3b82f6;">{{ health.counts.users }}</div>
          <div class="metric-card__label">المستخدمون</div>
        </div>
        <div class="metric-card" style="border-top-color: #10b981;">
          <div class="metric-card__value" style="color: #10b981;">{{ formatBytes(health.dbSize) }}</div>
          <div class="metric-card__label">حجم قاعدة البيانات</div>
        </div>
        <div class="metric-card" style="border-top-color: #f59e0b;">
          <div class="metric-card__value" style="color: #f59e0b;">{{ health.counts.sessions }}</div>
          <div class="metric-card__label">الجلسات</div>
        </div>
        <div class="metric-card" style="border-top-color: #8b5cf6;">
          <div class="metric-card__value" style="color: #8b5cf6;">{{ health.counts.reports }}</div>
          <div class="metric-card__label">التقارير</div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel">
          <h3 class="chart-title">عمليات الصيانة</h3>
          <div class="btn-stack">
            <button class="btn" @click="doBackup">إنشاء نسخة احتياطية</button>
            <button class="btn btn-secondary" @click="doCleanup">تنظيف البيانات القديمة</button>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel wide">
          <h3 class="chart-title">النسخ الاحتياطية</h3>
          <div v-if="backups.length" class="table-scroll">
            <table class="data-table">
              <thead><tr><th>الاسم</th><th>الحجم</th><th>التاريخ</th><th>إجراء</th></tr></thead>
              <tbody>
                <tr v-for="b in backups" :key="b.name">
                  <td>{{ b.name }}</td>
                  <td>{{ formatBytes(b.size) }}</td>
                  <td>{{ formatDate(b.created) }}</td>
                  <td><button class="btn-small" @click="doRestore(b.name)">استعادة</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty">لا توجد نسخ احتياطية</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  getAdminSystemHealth, listBackups, triggerBackup, restoreBackup, cleanupDB,
  type AdminSystemHealth,
} from '@/services/admin.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'

const toast = useToast()
const loading = ref(true)
const error = ref('')
const health = ref<AdminSystemHealth | null>(null)
const backups = ref<{ name: string; size: number; created: string }[]>([])

function formatDate(d?: string) { return d ? new Date(d).toLocaleString('ar') : '—' }
function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [h, b] = await Promise.all([
      getAdminSystemHealth(),
      listBackups(),
    ])
    if (h.success) health.value = h.health
    if (b.success) backups.value = b.backups
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

async function doBackup() {
  try {
    const res = await triggerBackup()
    if (!res.success) throw new Error(res.message || 'فشل')
    toast.success(res.message || 'تم إنشاء النسخة')
    await load()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'فشل إنشاء النسخة')
  }
}

async function doRestore(name: string) {
  if (!confirm(`هل تريد استعادة النسخة ${name}؟`)) return
  try {
    const res = await restoreBackup(name)
    if (!res.success) throw new Error(res.message || 'فشل')
    toast.success(res.message || 'تمت الاستعادة')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'فشل استعادة النسخة')
  }
}

async function doCleanup() {
  if (!confirm('سيتم حذف الجلسات والأنشطة القديمة وضغط قاعدة البيانات. متابعة؟')) return
  try {
    const res = await cleanupDB()
    if (!res.success) throw new Error(res.message || 'فشل')
    toast.success(res.message || 'تم التنظيف')
    await load()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'فشل التنظيف')
  }
}

onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.metric-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 1.2rem; }
.metric-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.7rem; padding: 1rem; text-align: center; border-top: 3px solid transparent; }
.metric-card__value { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.3rem; }
.metric-card__label { font-size: 0.75rem; color: #94a3b8; }

.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 1.2rem; }
.chart-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.7rem; padding: 1rem; }
.chart-panel.wide { grid-column: 1 / -1; }
.chart-title { margin: 0 0 0.8rem; font-size: 0.9rem; font-weight: 700; color: #e2e8f0; }
.empty { padding: 2rem; text-align: center; color: #64748b; font-size: 0.85rem; }

.table-scroll { max-height: 240px; overflow-y: auto; border-radius: 6px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1; }
.data-table th { position: sticky; top: 0; background: #0f172a; z-index: 1; text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; }
.data-table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.04); }

.btn-stack { display: flex; flex-wrap: wrap; gap: 8px; }
.btn { padding: 8px 14px; border: none; border-radius: 6px; background: #6366f1; color: #fff; cursor: pointer; font-family: inherit; }
.btn-secondary { background: #475569; }
.btn-small { padding: 4px 8px; border-radius: 4px; border: none; background: #10b981; color: #fff; cursor: pointer; font-size: 0.75rem; }

</style>
