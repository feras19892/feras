<template>
  <ErrorState v-if="error" :error="error" show-retry @retry="load" />
  <div v-else class="sub-overview">
    <div class="page-header">
      <div>
        <h3 class="page-title">📊 نبذة عن الاشتراكات</h3>
        <p class="page-subtitle">ملاحظة فورية لحالة الاشتراكات والإيرادات والتحذيرات</p>
      </div>
    </div>

    <div class="metric-cards">
      <div v-for="c in cards" :key="c.label" class="metric-card" :class="cardClass(c.label)" :title="c.hint">
        <div class="metric-card__icon">{{ cardIcon(c.label) }}</div>
        <div>
          <div class="metric-card__value" :style="{ color: c.color }">{{ c.value }}</div>
          <div class="metric-card__label">{{ c.label }}</div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="panel status-panel">
        <h4 class="panel-title">📈 توزيع حالات الاشتراكات</h4>
        <div v-if="statusCounts.length" class="bar-list">
          <div v-for="s in statusCounts" :key="s.status" class="bar-row">
            <div class="bar-info">
              <span :class="['verify-badge', statusClass(s.status)]">{{ statusLabel(s.status) }}</span>
              <span class="bar-count">{{ s.count }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: s.percent + '%', background: s.color }"></div>
            </div>
          </div>
        </div>
        <p v-else class="empty">لا توجد بيانات</p>
      </div>

      <div class="panel">
        <h4 class="panel-title">🏷️ توزيع حسب الدور</h4>
        <div v-if="roleCounts.length" class="bar-list">
          <div v-for="r in roleCounts" :key="r.type" class="bar-row">
            <div class="bar-info">
              <span class="bar-label">{{ r.label }}</span>
              <span class="bar-count">{{ r.count }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: r.percent + '%', background: r.color }"></div>
            </div>
          </div>
        </div>
        <p v-else class="empty">لا يوجد</p>
      </div>

      <div class="panel highlight">
        <h4 class="panel-title">💰 الإيرادات المتكررة (MRR)</h4>
        <div class="mrr-card">{{ mrr.toFixed(2) }} € <small>/ شهر</small></div>
        <p class="mrr-hint">مجموع اشتراكات <strong>ACTIVE</strong> و <strong>TRIAL</strong> باليورو</p>
      </div>

      <div class="panel attention">
        <h4 class="panel-title">⚠️ تحتاج انتباه</h4>
        <div v-if="attention.length" class="attention-list">
          <div v-for="(a, i) in attention" :key="i" class="attention-row" :class="a.severity">
            <span class="attention-icon">{{ a.icon }}</span>
            <span class="attention-text">{{ a.text }}</span>
          </div>
        </div>
        <p v-else class="empty">لا توجد عناصر تتطلب انتباهك</p>
      </div>

      <div class="panel list-panel">
        <h4 class="panel-title">⏳ تنتهي قريباً <small>(خلال 30 يوم)</small></h4>
        <div v-if="expiring.length" class="data-list">
          <div v-for="s in expiring" :key="s.id" class="data-row">
            <span class="data-main">{{ ownerLabel(s) }}</span>
            <span class="data-meta">{{ formatDate(s.expires_at) }}</span>
            <span class="data-tag">{{ daysUntil(s.expires_at) }}</span>
          </div>
        </div>
        <p v-else class="empty">لا يوجد</p>
      </div>

      <div class="panel list-panel">
        <h4 class="panel-title">🆕 أحدث الاشتراكات</h4>
        <div v-if="recent.length" class="data-list">
          <div v-for="s in recent" :key="s.id" class="data-row">
            <span class="data-main">{{ ownerLabel(s) }}</span>
            <span :class="['verify-badge', statusClass(s.status)]">{{ statusLabel(s.status) }}</span>
            <span class="data-meta">{{ timeAgo(s.created_at) }}</span>
          </div>
        </div>
        <p v-else class="empty">لا يوجد</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed, onMounted } from 'vue'
import { getSubscriptions, type AdminSubscription } from '@/services/core/admin.api'
import ErrorState from '@/components/shared/ErrorState.vue'


const subs = ref<AdminSubscription[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const statusOrder = ['ACTIVE', 'TRIAL', 'PENDING', 'EXPIRED', 'CANCELLED']
const statusColors: Record<string, string> = { ACTIVE: '#22c55e', TRIAL: '#3b82f6', PENDING: '#f59e0b', EXPIRED: '#ef4444', CANCELLED: '#64748b' }
const roleColors: Record<string, string> = { school: '#8b5cf6', teacher: '#3b82f6', student: '#10b981' }

function statusLabel(status: string) {
  const map: Record<string, string> = { ACTIVE: 'نشط', TRIAL: 'تجريبي', EXPIRED: 'منتهي', CANCELLED: 'ملغى', PENDING: 'معلق' }
  return map[status] || status
}

function statusClass(status: string) {
  if (status === 'ACTIVE' || status === 'TRIAL') return ''
  if (status === 'PENDING') return 'unverified'
  return 'danger'
}

function formatDate(d?: string | null) { return d ? new Date(d).toLocaleDateString('ar-SY') : '—' }

function ownerLabel(s: AdminSubscription) {
  const name = s.owner_name || `${s.owner_type === 'school' ? 'مدرسة' : 'مستخدم'} #${s.owner_id}`
  return name
}

const active = computed(() => subs.value.filter(s => s.status === 'ACTIVE'))
const trial = computed(() => subs.value.filter(s => s.status === 'TRIAL'))
const pending = computed(() => subs.value.filter(s => s.status === 'PENDING'))
const expiredOrCancelled = computed(() => subs.value.filter(s => s.status === 'EXPIRED' || s.status === 'CANCELLED'))
const free = computed(() => subs.value.filter(s => !s.plan_id))

const mrr = computed(() =>
  [...active.value, ...trial.value].reduce((sum, s) => sum + ((s.price_cents ?? 0) / 100), 0))

const expiring = computed(() => {
  const now = Date.now()
  const days30 = now + 30 * 24 * 60 * 60 * 1000
  return subs.value
    .filter(s => s.expires_at && new Date(s.expires_at).getTime() <= days30 && new Date(s.expires_at).getTime() > now)
    .sort((a, b) => new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime())
    .slice(0, 5)
})

const recent = computed(() => [...subs.value].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5))

function cardIcon(label: string) {
  const icons: Record<string, string> = {
    'إجمالي الاشتراكات': '📦',
    'نشط': '✅',
    'تجريبي': '🧪',
    'معلق': '⏸️',
    'منتهي/ملغى': '⚠️',
    'مجاني': '🎁',
  }
  return icons[label] || '📊'
}
function cardClass(label: string) {
  const classes: Record<string, string> = {
    'إجمالي الاشتراكات': 'total',
    'نشط': 'active',
    'تجريبي': 'trial',
    'معلق': 'pending',
    'منتهي/ملغى': 'danger',
    'مجاني': 'free',
  }
  return classes[label] || ''
}
function daysUntil(d?: string | null) {
  if (!d) return ''
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  if (diff <= 0) return 'ينتهي اليوم'
  if (diff === 1) return 'بعد يوم واحد'
  return `بعد ${diff} يوم`
}
function timeAgo(d?: string | null) {
  if (!d) return ''
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / (60 * 1000))
  if (diff < 1) return 'الآن'
  if (diff < 60) return `منذ ${diff} دقيقة`
  const hours = Math.floor(diff / 60)
  if (hours < 24) return `منذ ${hours} ساعة`
  const days = Math.floor(hours / 24)
  if (days < 30) return `منذ ${days} يوم`
  return formatDate(d)
}

const cards = computed(() => [
  { label: 'إجمالي الاشتراكات', value: subs.value.length, color: '#3b82f6', hint: 'عدد جميع الاشتراكات المسجلة' },
  { label: 'نشط', value: active.value.length, color: '#22c55e', hint: 'اشتراكات مدفوعة تعمل حاليًا' },
  { label: 'تجريبي', value: trial.value.length, color: '#3b82f6', hint: 'اشتراكات في فترة التجربة' },
  { label: 'معلق', value: pending.value.length, color: '#f59e0b', hint: 'اشتراكات بانتظار الدفع أو التفعيل' },
  { label: 'منتهي/ملغى', value: expiredOrCancelled.value.length, color: '#ef4444', hint: 'اشتراكات منتهية أو أُلغيت' },
  { label: 'مجاني', value: free.value.length, color: '#f59e0b', hint: 'اشتراكات بدون خطة مدفوعة' },
])

const statusCounts = computed(() => {
  const counts = statusOrder.map(status => ({ status, count: subs.value.filter(s => s.status === status).length, color: statusColors[status] }))
  const max = Math.max(1, ...counts.map(c => c.count))
  return counts.map(c => ({ ...c, percent: Math.round((c.count / max) * 100) }))
})

const roleCounts = computed(() => {
  const types: Record<string, string> = { school: 'مدرسة', teacher: 'مدرس', student: 'طالب' }
  const counts = Object.entries(types).map(([type, label]) => ({
    type, label, count: subs.value.filter(s => s.plan_type === type || (s.owner_type === 'school' ? 'school' : s.plan_type) === type).length,
    color: roleColors[type],
  }))
  const max = Math.max(1, ...counts.map(c => c.count))
  return counts.map(c => ({ ...c, percent: Math.round((c.count / max) * 100) }))
})

const attention = computed(() => {
  const list: { icon: string; text: string; severity: string }[] = []
  if (expiring.value.length) list.push({ icon: '⏳', text: `${expiring.value.length} اشتراك ستنتهي خلال 30 يوم`, severity: 'warn' })
  if (pending.value.length) list.push({ icon: '⏸️', text: `${pending.value.length} اشتراك معلق يحتاج تفعيل`, severity: 'warn' })
  const cancelledThisWeek = subs.value.filter(s => s.status === 'CANCELLED' && s.cancelled_at && new Date(s.cancelled_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length
  if (cancelledThisWeek) list.push({ icon: '🚫', text: `${cancelledThisWeek} إلغاء هذا الأسبوع`, severity: 'danger' })
  if (active.value.length && !mrr.value) list.push({ icon: '⚠️', text: 'اشتراكات نشطة بدون إيرادات', severity: 'danger' })
  return list
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await getSubscriptions()
    if (res.success) subs.value = res.subscriptions
  } catch (e: any) { error.value = e.message || 'فشل التحميل' } finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
.sub-overview { display: flex; flex-direction: column; gap: 1.25rem; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }
.page-title { margin: 0; font-size: 1.25rem; color: #f1f5f9; }
.page-subtitle { margin: 0.3rem 0 0; color: #94a3b8; font-size: 0.85rem; }
.metric-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
.metric-card { display: flex; align-items: center; gap: 0.9rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 1rem; padding: 1.1rem; border-right: 4px solid transparent; transition: transform 0.12s, background 0.12s; }
.metric-card:hover { background: rgba(255,255,255,0.05); transform: translateY(-2px); }
.metric-card.total { border-right-color: #3b82f6; }
.metric-card.active { border-right-color: #22c55e; }
.metric-card.trial { border-right-color: #3b82f6; }
.metric-card.pending { border-right-color: #f59e0b; }
.metric-card.danger { border-right-color: #ef4444; }
.metric-card.free { border-right-color: #f59e0b; }
.metric-card__icon { font-size: 1.6rem; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border-radius: 12px; }
.metric-card__value { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.15rem; }
.metric-card__label { font-size: 0.78rem; color: #94a3b8; }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
.panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 1rem; padding: 1.1rem; }
.panel-title { margin: 0 0 0.9rem; font-size: 0.95rem; font-weight: 700; color: #e2e8f0; }
.panel-title small { color: #94a3b8; font-weight: 400; }
.panel.highlight { background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08)); border-color: rgba(99,102,241,0.15); }
.panel.attention { border-color: rgba(239,68,68,0.2); }
.bar-list { display: flex; flex-direction: column; gap: 0.8rem; }
.bar-row { display: flex; flex-direction: column; gap: 0.35rem; }
.bar-info { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #cbd5e1; }
.bar-label { color: #e2e8f0; }
.bar-count { font-weight: 700; color: #f1f5f9; }
.bar-track { height: 10px; background: rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 6px; transition: width 0.5s ease; }
.mrr-card { font-size: 2rem; font-weight: 800; color: #67e8f9; text-align: center; margin: 1rem 0 0.4rem; }
.mrr-card small { font-size: 0.85rem; color: #94a3b8; }
.mrr-hint { color: #94a3b8; font-size: 0.82rem; text-align: center; margin: 0; }
.attention-list { display: flex; flex-direction: column; gap: 0.55rem; }
.attention-row { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 0.9rem; border-radius: 0.6rem; background: rgba(255,255,255,0.03); color: #cbd5e1; font-size: 0.86rem; }
.attention-row.warn { border-right: 3px solid #f59e0b; }
.attention-row.danger { border-right: 3px solid #ef4444; }
.attention-icon { font-size: 1.1rem; }
.attention-text { flex: 1; }
.data-list { display: flex; flex-direction: column; gap: 0.45rem; }
.data-row { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; padding: 0.55rem 0.7rem; background: rgba(255,255,255,0.02); border-radius: 0.5rem; color: #cbd5e1; font-size: 0.85rem; }
.data-main { flex: 1; color: #f1f5f9; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.data-meta { color: #94a3b8; white-space: nowrap; }
.data-tag { color: #f59e0b; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.empty { color: #64748b; font-size: 0.85rem; text-align: center; padding: 1rem; margin: 0; }
.verify-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.65rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700; background: rgba(34,197,94,0.14); color: #4ade80; white-space: nowrap; }
.verify-badge.unverified { background: rgba(234,179,8,0.14); color: #facc15; }
.verify-badge.danger { background: rgba(239,68,68,0.14); color: #f87171; }
</style>
