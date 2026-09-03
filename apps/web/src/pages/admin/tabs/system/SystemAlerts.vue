<template>
  <div>
    <h2 class="panel__title">🚨 التنبيهات والحوادث</h2>
    <SkeletonLoader v-if="loading" type="cards" :count="3" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <template v-else>
      <div class="charts-row">
        <div class="chart-panel wide">
          <h3 class="chart-title">التنبيهات النظامية</h3>
          <div v-if="alerts.length" class="table-scroll">
            <table class="data-table">
              <thead><tr><th>التاريخ</th><th>النوع</th><th>الخطورة</th><th>العنوان</th><th>الرسالة</th><th>حالة</th><th>إجراء</th></tr></thead>
              <tbody>
                <tr v-for="a in alerts" :key="a.id">
                  <td>{{ formatDate(a.created_at) }}</td>
                  <td>{{ a.type }}</td>
                  <td>{{ a.severity }}</td>
                  <td>{{ a.title }}</td>
                  <td>{{ a.message }}</td>
                  <td>{{ a.is_resolved ? 'محلول' : 'مفتوح' }}</td>
                  <td><button v-if="!a.is_resolved" class="btn-small" @click="resolveAlert(a.id)">حل</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty">لا توجد تنبيهات</p>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel wide">
          <h3 class="chart-title">التقييمات والبلاغات</h3>
          <div v-if="feedback.length" class="table-scroll">
            <table class="data-table">
              <thead><tr><th>التاريخ</th><th>النوع</th><th>المستخدم</th><th>التقييم</th><th>الرسالة</th><th>الحالة</th><th>تحديث</th></tr></thead>
              <tbody>
                <tr v-for="f in feedback" :key="f.id">
                  <td>{{ formatDate(f.created_at) }}</td>
                  <td>{{ f.type }}</td>
                  <td>{{ f.user_name || '—' }}</td>
                  <td>{{ f.rating || '—' }}</td>
                  <td>{{ f.message }}</td>
                  <td>{{ f.status }}</td>
                  <td>
                    <select class="select-small" @change="setFeedbackStatus(f.id, ($event.target as HTMLSelectElement).value)">
                      <option value="" selected disabled>تغيير</option>
                      <option value="open">مفتوح</option>
                      <option value="resolved">محلول</option>
                      <option value="dismissed">مرفوض</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty">لا يوجد تقييمات</p>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel">
          <h3 class="chart-title">إرسال تنبيه يدوي</h3>
          <select v-model="alertForm.targetType" class="input">
            <option value="all">الكل</option>
            <option value="admin">أدمن</option>
            <option value="school">مدارس</option>
            <option value="teacher">مدرسون</option>
            <option value="student">طلاب</option>
          </select>
          <input v-model.number="alertForm.schoolId" type="number" class="input" placeholder="معرّف المدرسة (اختياري)" />
          <textarea v-model="alertForm.message" class="input" rows="3" placeholder="نص التنبيه" />
          <button class="btn" @click="sendAlert">إرسال</button>
        </div>

        <div class="chart-panel">
          <h3 class="chart-title">إرسال إعلان عام</h3>
          <input v-model="announcementForm.title" type="text" class="input" placeholder="العنوان (اختياري)" />
          <textarea v-model="announcementForm.message" class="input" rows="3" placeholder="نص الإعلان" />
          <button class="btn" @click="sendAnnouncement">إعلان</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { fetchJson } from '@/services/http'
import { getAdminFeedback, getAdminWarnings, type AdminFeedbackItem, type AdminUserWarning } from '@/services/admin.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'

interface Alert {
  id: number;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  is_resolved: number;
  created_at: string;
}

const toast = useToast()
const loading = ref(true)
const error = ref('')
const alerts = ref<Alert[]>([])
const feedback = ref<AdminFeedbackItem[]>([])
const warnings = ref<AdminUserWarning[]>([])
const alertForm = ref({ targetType: 'all', schoolId: '' as string | number, message: '' })
const announcementForm = ref({ title: '', message: '' })

function formatDate(d?: string) { return d ? new Date(d).toLocaleString('ar') : '—' }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [al, fb, wn] = await Promise.all([
      fetchJson<{ success: boolean; alerts: Alert[] }>('/api/admin/alerts'),
      getAdminFeedback(),
      getAdminWarnings(),
    ])
    if (al.success) alerts.value = al.alerts
    if (fb.success) feedback.value = fb.feedback
    if (wn.success) warnings.value = wn.warnings
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

async function resolveAlert(id: number) {
  try {
    const res = await fetchJson<{ success: boolean }>(`/api/admin/alerts/${id}/resolve`, { method: 'PATCH' })
    if (!res.success) throw new Error('فشل')
    toast.success('تم حل التنبيه')
    await load()
  } catch (e) {
    toast.error('فشل حل التنبيه')
  }
}

async function setFeedbackStatus(id: number, status: string) {
  if (!status) return
  try {
    const res = await fetchJson<{ success: boolean }>(`/api/admin/feedback/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.success) throw new Error('فشل')
    toast.success('تم تحديث الحالة')
    await load()
  } catch (e) {
    toast.error('فشل تحديث الحالة')
  }
}

async function sendAlert() {
  if (!alertForm.value.message.trim()) return toast.error('نص التنبيه مطلوب')
  try {
    const payload: any = { targetType: alertForm.value.targetType, message: alertForm.value.message.trim() }
    if (alertForm.value.schoolId) payload.schoolId = Number(alertForm.value.schoolId)
    const res = await fetchJson<{ success: boolean }>('/api/admin/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.success) throw new Error('فشل')
    toast.success('تم إرسال التنبيه')
    alertForm.value = { targetType: 'all', schoolId: '', message: '' }
  } catch (e) {
    toast.error('فشل إرسال التنبيه')
  }
}

async function sendAnnouncement() {
  if (!announcementForm.value.message.trim()) return toast.error('نص الإعلان مطلوب')
  try {
    const res = await fetchJson<{ success: boolean }>('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: announcementForm.value.title.trim() || undefined,
        message: announcementForm.value.message.trim(),
      }),
    })
    if (!res.success) throw new Error('فشل')
    toast.success('تم إرسال الإعلان')
    announcementForm.value = { title: '', message: '' }
  } catch (e) {
    toast.error('فشل إرسال الإعلان')
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
.table-scroll { max-height: 240px; overflow-y: auto; border-radius: 6px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1; }
.data-table th { position: sticky; top: 0; background: #0f172a; z-index: 1; text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; }
.data-table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.04); }

.input { width: 100%; margin-bottom: 0.6rem; padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-family: inherit; }
.btn { padding: 8px 14px; border: none; border-radius: 6px; background: #6366f1; color: #fff; cursor: pointer; font-family: inherit; }
.btn-small { padding: 4px 8px; border-radius: 4px; border: none; background: #10b981; color: #fff; cursor: pointer; font-size: 0.75rem; }
.select-small { padding: 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; }
</style>
