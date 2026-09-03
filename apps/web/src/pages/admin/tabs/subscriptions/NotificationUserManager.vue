<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, onMounted } from 'vue'
import { Search, Filter, ChevronRight, Clock, Send, CheckCircle, XCircle, AlertCircle, RefreshCcw } from 'lucide-vue-next'
import {
  getNotificationOwners,
  getOwnerNotifications,
  sendNotificationQueueItem,
  updateNotificationQueueItem,
  deleteNotificationQueueItem,
} from '@/services/core/notification-queue.api'
import { extendAdminUserTrial, changeAdminUserSubscription } from '@/services/admin.service'
import type { NotificationOwner, QueueRecord, UserNotification } from '@/services/core/notification-queue.api'


const owners = ref<NotificationOwner[]>([])
const total = ref(0)
const loading = ref(false)
const message = ref<string | null>(null)
const error = ref<string | null>(null)
const selectedOwner = ref<NotificationOwner | null>(null)
const queue = ref<QueueRecord[]>([])
const notifications = ref<UserNotification[]>([])
const queueLoading = ref(false)
const editingQueue = ref<number | null>(null)
const activeTab = ref<'upcoming' | 'sent'>('upcoming')
const extendDays = ref(7)
const newStatus = ref('')

const filters = ref({
  search: '',
  role: '',
  status: '',
  page: 1,
  limit: 20,
})

const roleLabel = (r: string) => ({ admin: 'مشرف', teacher: 'معلم', student: 'طالب', school: 'مدرسة' }[r] || r)
const statusLabel = (s: string | null) => s ?? '—'
const formatDate = (d: string | null) => d ? new Date(d).toLocaleString('ar-SA') : '—'

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await getNotificationOwners(filters.value)
    if (res.success) {
      owners.value = res.owners
      total.value = res.total
    }
  } catch (e: any) {
    error.value = e?.message || 'فشل التحميل'
  } finally { loading.value = false }
}

async function selectOwner(o: NotificationOwner) {
  selectedOwner.value = o
  queueLoading.value = true
  try {
    const res = await getOwnerNotifications(o.owner_type, o.owner_id)
    if (res.success) {
      queue.value = res.queue
      notifications.value = res.notifications
    }
  } catch (e: any) { message.value = e?.message || 'فشل تحميل التنبيهات' }
  finally { queueLoading.value = false }
}

async function sendQueue(id: number) {
  try {
    await sendNotificationQueueItem(id)
    message.value = 'تم الإرسال'
    if (selectedOwner.value) await selectOwner(selectedOwner.value)
    await load()
  } catch (e: any) { error.value = e?.message || 'فشل الإرسال' }
}

async function removeQueue(id: number) {
  if (!confirm('هل تريد الحذف؟')) return
  try {
    await deleteNotificationQueueItem(id)
    if (selectedOwner.value) await selectOwner(selectedOwner.value)
    await load()
  } catch (e: any) { error.value = e?.message || 'فشل الحذف' }
}

async function saveQueue(q: QueueRecord) {
  try {
    await updateNotificationQueueItem(q.id, { title: q.title, message: q.message, scheduled_at: q.scheduled_at, channel: q.channel })
    editingQueue.value = null
    message.value = 'تم الحفظ'
    if (selectedOwner.value) await selectOwner(selectedOwner.value)
  } catch (e: any) { error.value = e?.message || 'فشل الحفظ' }
}

async function extend() {
  if (!selectedOwner.value || selectedOwner.value.owner_type !== 'user') return
  try {
    await extendAdminUserTrial(selectedOwner.value.owner_id, extendDays.value)
    message.value = `تم التمديد ${extendDays.value} أيام`
    await load()
    if (selectedOwner.value) await selectOwner(selectedOwner.value)
  } catch (e: any) { error.value = e?.message || 'فشل التمديد' }
}

async function changeStatus() {
  if (!selectedOwner.value || selectedOwner.value.owner_type !== 'user' || !newStatus.value) return
  try {
    await changeAdminUserSubscription(selectedOwner.value.owner_id, { status: newStatus.value })
    message.value = 'تم تغيير الحالة'
    await load()
    if (selectedOwner.value) await selectOwner(selectedOwner.value)
  } catch (e: any) { error.value = e?.message || 'فشل التغيير' }
}

onMounted(load)
</script>

<template>
  <div class="user-manager">
    <div class="filters">
      <div class="filter-row">
        <div class="field">
          <label><Search :size="12" /> بحث</label>
          <input v-model="filters.search" class="input" placeholder="اسم أو بريد" @change="load" />
        </div>
        <div class="field">
          <label>الدور</label>
          <select v-model="filters.role" class="input" @change="load">
            <option value="">الكل</option>
            <option value="student">طالب</option>
            <option value="teacher">معلم</option>
            <option value="school">مدرسة</option>
          </select>
        </div>
        <div class="field">
          <label>حالة الاشتراك</label>
          <select v-model="filters.status" class="input" @change="load">
            <option value="">الكل</option>
            <option value="TRIAL">TRIAL</option>
            <option value="ACTIVE">ACTIVE</option>
          </select>
        </div>
        <button class="btn-refresh" @click="load"><RefreshCcw :size="14" /> تحديث</button>
      </div>
    </div>

    <div class="split">
      <div class="user-list">
        <div v-if="loading" class="state">جاري التحميل...</div>
        <div v-else-if="!owners?.length" class="state">لا يوجد ملاك</div>
        <div
          v-for="o in owners"
          :key="o.owner_type + '-' + o.owner_id"
          class="user-row"
          :class="{ active: selectedOwner?.owner_id === o.owner_id && selectedOwner?.owner_type === o.owner_type }"
          @click="selectOwner(o)"
        >
          <div class="user-main">
            <span class="user-name">{{ o.name }}</span>
            <span class="user-email">{{ o.email }}</span>
            <span class="role-pill">{{ roleLabel(o.role) }}</span>
          </div>
          <div class="user-meta">
            <span class="sub-status" :class="o.subscription_status ?? 'none'">{{ statusLabel(o.subscription_status) }}</span>
            <span class="counts"><Clock :size="12" /> {{ o.pending_count }} / <Send :size="12" /> {{ o.sent_count }}</span>
            <span class="last">{{ o.last_title || '—' }}</span>
          </div>
          <ChevronRight :size="16" class="arrow" />
        </div>
      </div>

      <div v-if="selectedOwner" class="detail-panel">
        <button class="btn" @click="selectedOwner = null">← رجوع</button>
        <h3>{{ selectedOwner.name }}</h3>
        <div class="detail-sub">
          <h4>الاشتراك</h4>
          <div class="sub-row"><span>الحالة</span><strong>{{ statusLabel(selectedOwner.subscription_status) }}</strong></div>
          <div class="sub-row"><span>الخطة</span><strong>{{ selectedOwner.plan_name || '—' }}</strong></div>
          <div class="sub-row"><span>ينتهي</span><strong>{{ formatDate(selectedOwner.expires_at) }}</strong></div>
          <div v-if="selectedOwner.owner_type === 'user'" class="sub-actions">
            <input v-model.number="extendDays" type="number" min="1" class="input" style="width:70px" />
            <button class="btn" @click="extend">تمديد</button>
            <select v-model="newStatus" class="input" style="min-width:100px">
              <option value="">تغيير الحالة</option>
              <option value="TRIAL">TRIAL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
            <button class="btn" :disabled="!newStatus" @click="changeStatus">حفظ</button>
          </div>
        </div>

        <div class="detail-queue">
          <h4>تفاصيل التنبيهات</h4>
          <div class="tabs">
            <button class="tab" :class="{ active: activeTab === 'upcoming' }" @click="activeTab = 'upcoming'">
              القادمة ({{ queue.filter(q => q.status === 'pending').length }})
            </button>
            <button class="tab" :class="{ active: activeTab === 'sent' }" @click="activeTab = 'sent'">
              المرسلة ({{ notifications.length }})
            </button>
          </div>

          <div v-if="queueLoading" class="state">جاري التحميل...</div>

          <div v-else-if="activeTab === 'upcoming'" class="queue-list">
            <div v-if="queue.filter(q => q.status === 'pending').length === 0" class="state">لا توجد تنبيهات قادمة</div>
            <div v-for="q in queue.filter(q => q.status === 'pending').slice(0, 10)" :key="q.id" class="queue-row" :class="q.status">
              <div v-if="editingQueue === q.id" class="edit-form">
                <input v-model="q.title" class="input" />
                <textarea v-model="q.message" rows="2" class="input"></textarea>
                <input v-model="q.scheduled_at" type="datetime-local" class="input" />
                <select v-model="q.channel" class="input">
                  <option value="in_app">داخل التطبيق</option>
                  <option value="email">بريد</option>
                  <option value="sms">SMS</option>
                </select>
                <div class="edit-actions">
                  <button class="btn" @click="saveQueue(q)"><CheckCircle :size="12" /> حفظ</button>
                  <button class="btn" @click="editingQueue = null"><XCircle :size="12" /> إلغاء</button>
                </div>
              </div>
              <div v-else>
                <div class="queue-title">{{ q.title }}</div>
                <div class="queue-message">{{ q.message }}</div>
                <div class="queue-meta">
                  <span :class="['pill', q.status]">{{ q.status }}</span>
                  <span>{{ q.event }}</span>
                  <span>{{ formatDate(q.scheduled_at) }}</span>
                </div>
              </div>
              <div class="queue-actions">
                <button class="icon-btn" title="إرسال الآن" @click="sendQueue(q.id)"><Send :size="14" /></button>
                <button class="icon-btn" title="تعديل" @click="editingQueue = q.id"><AlertCircle :size="14" /></button>
                <button class="icon-btn danger" title="حذف" @click="removeQueue(q.id)"><XCircle :size="14" /></button>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'sent'" class="queue-list">
            <div v-if="notifications.length === 0" class="state">لا توجد تنبيهات مرسلة</div>
            <div v-for="n in notifications" :key="n.id" class="queue-row sent">
              <div class="queue-title">{{ n.title }}</div>
              <div class="queue-message">{{ n.message }}</div>
              <div class="queue-meta">
                <span class="pill">{{ n.is_read ? '✓ مقروء' : '● غير مقروء' }}</span>
                <span>{{ formatDate(n.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="message" class="success">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<style scoped>
.user-manager { color: #e2e8f0; }
.filters { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 1rem; }
.filter-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: end; }
.field { display: flex; flex-direction: column; gap: 0.25rem; min-width: 140px; }
.field label { font-size: 0.8rem; color: #94a3b8; }
.input { background: #0f172a; border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; padding: 0.5rem; border-radius: 0.375rem; }
.btn-refresh { display: inline-flex; align-items: center; gap: 0.25rem; background: #1e293b; border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer; }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
.user-list { display: flex; flex-direction: column; gap: 0.5rem; }
.user-row { display: flex; align-items: center; gap: 0.75rem; background: #0f172a; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 0.75rem; cursor: pointer; }
.user-row.active { border-color: #34d399; }
.user-main { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
.user-name { font-weight: 600; }
.user-email { font-size: 0.8rem; color: #94a3b8; }
.role-pill { font-size: 0.75rem; background: #1e293b; padding: 0.1rem 0.4rem; border-radius: 999px; width: fit-content; }
.user-meta { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.8rem; color: #94a3b8; }
.sub-status { padding: 0.1rem 0.4rem; border-radius: 0.25rem; width: fit-content; }
.sub-status.TRIAL { background: #facc15; color: #0f172a; }
.sub-status.ACTIVE { background: #34d399; color: #0f172a; }
.arrow { color: #64748b; }
.detail-panel { background: #0f172a; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 1rem; }
.detail-sub, .detail-queue { margin-bottom: 1rem; }
h3, h4 { color: #a5b4fc; margin-bottom: 0.75rem; }
.sub-row { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.sub-actions { display: flex; gap: 0.5rem; padding-top: 0.5rem; flex-wrap: wrap; }
.btn { background: #34d399; color: #0f172a; border: none; padding: 0.4rem 0.75rem; border-radius: 0.375rem; cursor: pointer; font-weight: 600; }
.queue-row { border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0.5rem 0; }
.queue-row.sent { border-left: 3px solid #34d399; padding-left: 0.5rem; }
.queue-row.pending { border-left: 3px solid #facc15; padding-left: 0.5rem; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
.tab { background: #1e293b; border: 1px solid rgba(255,255,255,0.08); color: #94a3b8; padding: 0.4rem 0.75rem; border-radius: 0.375rem; cursor: pointer; }
.tab.active { background: #6366f1; color: #fff; }
.queue-title { font-weight: 600; margin-bottom: 0.25rem; }
.queue-message { color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.35rem; }
.queue-meta { font-size: 0.8rem; color: #64748b; display: flex; gap: 0.5rem; align-items: center; }
.pill { padding: 0.1rem 0.35rem; border-radius: 0.25rem; background: #1e293b; }
.sent { color: #34d399; }
.queue-actions { display: flex; gap: 0.3rem; margin-top: 0.4rem; }
.icon-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; }
.icon-btn.danger:hover { color: #f87171; }
.edit-form { display: flex; flex-direction: column; gap: 0.4rem; }
.edit-actions { display: flex; gap: 0.4rem; }
.state { text-align: center; padding: 1rem; color: #94a3b8; }
.success { color: #34d399; margin-top: 0.5rem; }
.error { color: #f87171; margin-top: 0.5rem; }
</style>
