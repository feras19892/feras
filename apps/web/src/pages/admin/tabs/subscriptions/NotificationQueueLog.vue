<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, onMounted } from 'vue'
import { Inbox, Send, Trash2, Edit3, Filter, ArrowUpDown, CheckCircle, XCircle, Clock } from 'lucide-vue-next'
import {
  getNotificationQueue,
  sendNotificationQueueItem,
  deleteNotificationQueueItem,
  updateNotificationQueueItem,
  type QueueRecord,
} from '@/services/core/notification-queue.api'


const queue = ref<QueueRecord[]>([])
const total = ref(0)
const loading = ref(false)
const message = ref<string | null>(null)
const error = ref<string | null>(null)
const editing = ref<number | null>(null)

const filters = ref({
  status: '',
  event: '',
  user_id: '',
  sort: 'id',
  order: 'desc' as 'asc' | 'desc',
  page: 1,
  limit: 20,
})

const statusLabel = (s: string) => {
  const map: Record<string, string> = { pending: 'معلق', sent: 'مرسل', failed: 'فاشل', cancelled: 'ملغي' }
  return map[s] || s
}

const eventLabel = (e: string) => {
  const map: Record<string, string> = { trial_ends: 'انتهاء التجربة', yearly_renewal: 'تجديد سنوي', payment_due: 'استحقاق الدفع' }
  return map[e] || e
}

const formatDate = (d: string | null) => (d ? new Date(d).toLocaleString('ar-SA') : '-')

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await getNotificationQueue(filters.value)
    if (res.success) {
      queue.value = res.queue
      total.value = res.total
    }
  } catch (e: any) {
    error.value = e?.message || 'فشل تحميل الطابور'
  } finally {
    loading.value = false
  }
}

async function send(id: number) {
  try {
    await sendNotificationQueueItem(id)
    message.value = 'تم الإرسال'
    await load()
  } catch (e: any) {
    error.value = e?.message || 'فشل الإرسال'
  }
}

async function remove(id: number) {
  if (!confirm('هل تريد الحذف؟')) return
  try {
    await deleteNotificationQueueItem(id)
    await load()
  } catch (e: any) {
    error.value = e?.message || 'فشل الحذف'
  }
}

async function saveEdit(item: QueueRecord) {
  try {
    await updateNotificationQueueItem(item.id, { title: item.title, message: item.message, scheduled_at: item.scheduled_at, channel: item.channel })
    editing.value = null
    message.value = 'تم الحفظ'
    await load()
  } catch (e: any) {
    error.value = e?.message || 'فشل الحفظ'
  }
}

onMounted(load)
</script>

<template>
  <div class="queue-log">
    <div class="filters">
      <div class="filter-row">
        <div class="field">
          <label><Filter :size="12" /> الحالة</label>
          <select v-model="filters.status" class="input" @change="load">
            <option value="">الكل</option>
            <option value="pending">معلق</option>
            <option value="sent">مرسل</option>
            <option value="failed">فاشل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        <div class="field">
          <label>الحدث</label>
          <select v-model="filters.event" class="input" @change="load">
            <option value="">الكل</option>
            <option value="trial_ends">انتهاء التجربة</option>
            <option value="yearly_renewal">تجديد سنوي</option>
            <option value="payment_due">استحقاق الدفع</option>
          </select>
        </div>
        <div class="field">
          <label>رقم المستخدم</label>
          <input v-model="filters.user_id" type="number" class="input" @change="load" />
        </div>
        <div class="field">
          <label>الفرز</label>
          <select v-model="filters.sort" class="input" @change="load">
            <option value="id">ID</option>
            <option value="scheduled_at">موعد الإرسال</option>
            <option value="event">الحدث</option>
            <option value="status">الحالة</option>
          </select>
        </div>
        <button type="button" class="btn-order" @click="filters.order = filters.order === 'asc' ? 'desc' : 'asc'; load()">
          <ArrowUpDown :size="14" /> {{ filters.order === 'asc' ? 'تصاعدي' : 'تنازلي' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="state">جاري التحميل...</div>
    <div v-else-if="queue.length === 0" class="state">لا توجد إشعارات</div>
    <div v-else class="queue-list">
      <div v-for="item in queue" :key="item.id" class="queue-card" :class="item.status">
        <div class="queue-header">
          <span class="event">{{ eventLabel(item.event) }}</span>
          <span class="status" :class="item.status">{{ statusLabel(item.status) }}</span>
        </div>
        <div v-if="editing === item.id" class="edit-form">
          <input v-model="item.title" class="input" />
          <textarea v-model="item.message" rows="2" class="input"></textarea>
          <input v-model="item.scheduled_at" type="datetime-local" class="input" />
          <select v-model="item.channel" class="input">
            <option value="in_app">داخل التطبيق</option>
            <option value="email">بريد إلكتروني</option>
            <option value="sms">SMS</option>
          </select>
          <div class="edit-actions">
            <button class="btn-save" @click="saveEdit(item)">
              <CheckCircle :size="14" /> حفظ
            </button>
            <button class="btn-cancel" @click="editing = null">
              <XCircle :size="14" /> إلغاء
            </button>
          </div>
        </div>
        <div v-else>
          <div class="title">{{ item.title }}</div>
          <div class="body">{{ item.message }}</div>
          <div class="meta">
            <Clock :size="12" /> {{ formatDate(item.scheduled_at) }}
            <span v-if="item.sent_at" class="sent">— أرسل: {{ formatDate(item.sent_at) }}</span>
          </div>
        </div>
        <div class="actions">
          <button v-if="item.status === 'pending'" class="icon-btn" title="إرسال الآن" @click="send(item.id)">
            <Send :size="14" />
          </button>
          <button class="icon-btn" title="تعديل" @click="editing = item.id">
            <Edit3 :size="14" />
          </button>
          <button class="icon-btn danger" title="حذف" @click="remove(item.id)">
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>
    <div v-if="message" class="success">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<style scoped>
.queue-log { color: #e2e8f0; }
.filters { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 1rem; }
.filter-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: end; }
.field { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; min-width: 120px; }
.field label { font-size: 0.8rem; color: #94a3b8; }
.input { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); color: #e2e8f0; padding: 0.5rem; border-radius: 0.5rem; }
.btn-order { display: inline-flex; align-items: center; gap: 0.25rem; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.08); color: #e2e8f0; padding: 0.5rem; border-radius: 0.5rem; cursor: pointer; }
.state { text-align: center; padding: 1rem; color: #94a3b8; }
.queue-list { display: flex; flex-direction: column; gap: 0.75rem; }
.queue-card { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.5rem; padding: 0.75rem; }
.queue-card.sent { border-left: 3px solid #34d399; }
.queue-card.pending { border-left: 3px solid #facc15; }
.queue-card.failed { border-left: 3px solid #f87171; }
.queue-card.cancelled { border-left: 3px solid #94a3b8; }
.queue-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.event { color: #a5b4fc; font-weight: 600; }
.status { font-size: 0.8rem; padding: 0.2rem 0.4rem; border-radius: 0.25rem; background: #1e293b; }
.title { font-weight: 600; margin-bottom: 0.25rem; }
.body { color: #94a3b8; font-size: 0.9rem; margin-bottom: 0.5rem; }
.meta { font-size: 0.8rem; color: #64748b; }
.sent { color: #34d399; }
.actions { display: flex; gap: 0.4rem; margin-top: 0.5rem; }
.icon-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; }
.icon-btn:hover { color: #e2e8f0; }
.icon-btn.danger:hover { color: #f87171; }
.edit-form { display: flex; flex-direction: column; gap: 0.4rem; }
.edit-actions { display: flex; gap: 0.4rem; }
.btn-save, .btn-cancel { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.4rem; border: none; border-radius: 0.375rem; cursor: pointer; }
.btn-save { background: #34d399; color: #0f172a; }
.btn-cancel { background: #64748b; color: #fff; }
.success { color: #34d399; margin-top: 0.5rem; }
.error { color: #f87171; margin-top: 0.5rem; }
</style>
