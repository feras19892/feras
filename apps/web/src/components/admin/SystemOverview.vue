<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { ref, onMounted, computed } from 'vue';
import { getAdminSystemHealth, getAdminActivity, getAdminActivityStats, getAdminAuditLog, type AdminSystemHealth, type AdminActivityItem, type AdminActivityStats, type AuditLogEntry } from '../../services/admin.service';
const emit = defineEmits<{
  (e: 'navigate', section: string): void
  (e: 'back'): void
}>();


const loading = ref(true);
const error = ref('');

const health = ref<AdminSystemHealth | null>(null);
const activities = ref<AdminActivityItem[]>([]);
const activityStats = ref<AdminActivityStats | null>(null);
const auditLog = ref<AuditLogEntry[]>([]);

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [h, a, s, aud] = await Promise.all([
      getAdminSystemHealth(),
      getAdminActivity(),
      getAdminActivityStats(),
      getAdminAuditLog(),
    ]);
    if (h.success) health.value = h.health;
    if (a.success) activities.value = a.activities;
    if (s.success) activityStats.value = s.stats;
    if (aud.success) auditLog.value = aud.audit;
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || 'فشل تحميل البيانات';
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);

// System health
const dbSizeKb = computed(() => health.value ? Math.round(health.value.dbSize / 1024) : 0);
const healthTables = computed(() => {
  if (!health.value?.tables) return [];
  return Object.entries(health.value.tables)
    .filter(([name]) => !name.startsWith('sqlite_'))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
});

// Recent activity
const recentActivity = computed(() => activities.value.slice(0, 8));

// Recent audit
const recentAudit = computed(() => auditLog.value.slice(0, 6));

// System status
const systemOk = computed(() => {
  if (!health.value) return true;
  return true;
});

const systemSections = [
  { id: 'smart', icon: '🧠', label: 'التقارير الذكية' },
  { id: 'detailed', icon: '📈', label: 'التقارير المفصلة' },
  { id: 'enhancements', icon: '✨', label: 'أدوات متقدمة' },
  { id: 'health', icon: '🩺', label: 'صحة النظام' },
  { id: 'emergency', icon: '🚨', label: 'الطوارئ' },
  { id: 'audit', icon: '📜', label: 'سجل التدقيق' },
  { id: 'export', icon: '📤', label: 'تصدير البيانات' },
  { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
];

function actionLabel(action: string) {
  const map: Record<string, string> = {
    login: 'تسجيل دخول',
    signup: 'تسجيل جديد',
    create_user: 'إنشاء مستخدم',
    delete_user: 'حذف مستخدم',
    submit_report: 'إرسال تقرير',
    grade_report: 'تصحيح تقرير',
    create_class: 'إنشاء فصل',
    delete_class: 'حذف فصل',
  };
  return map[action] || action;
}

function auditActionLabel(action: string) {
  const map: Record<string, string> = { INSERT: 'إنشاء', UPDATE: 'تعديل', DELETE: 'حذف' };
  return map[action] || action;
}

function formatTime(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return t('shared.justNow');
  if (diffMin < 60) return t('shared.minutesAgo').replace('{n}', String(diffMin));
  if (diffHr < 24) return t('shared.hoursAgo').replace('{n}', String(diffHr));
  if (diffDay < 7) return t('shared.daysAgo').replace('{n}', String(diffDay));
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : locale.value);
}
</script>

<template>
  <div class="tab-content">

    <!-- Back -->
    <button class="go-back" @click="emit('back')">
      <span>⟵</span>
      <span>العودة للنظرة العامة</span>
    </button>

    <div v-if="loading" class="loading-inline">جاري تحميل بيانات النظام...</div>
    <div v-else-if="error" class="error-inline">❌ {{ error }}</div>

    <template v-else>
      <!-- ═══ Section 0: الأقسام ═══ -->
      <div class="section-header">
        <h2 class="section-title">⚡ الأقسام</h2>
      </div>
      <div class="quick-links-grid">
        <button
          v-for="item in systemSections"
          :key="item.id"
          class="quick-link-card"
          @click="emit('navigate', item.id)"
        >
          <span class="link-icon-lg">{{ item.icon }}</span>
          <span class="link-label-lg">{{ item.label }}</span>
        </button>
      </div>

      <!-- ═══ Section 1: ملخص النظام ═══ -->
      <div class="section-header">
        <h2 class="section-title">📊 ملخص النظام</h2>
      </div>
      <div class="hero-stats">
        <div class="hero-card primary">
          <div class="hero-icon">🩺</div>
          <div class="hero-body">
            <div class="hero-label">حالة النظام</div>
            <div class="hero-value" style="font-size: 1.4rem;">{{ systemOk ? '✅ يعمل' : '⚠️ تحقق' }}</div>
            <div class="hero-sub">{{ health?.counts.sessions ?? 0 }} جلسة نشطة</div>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-icon">📊</div>
          <div class="hero-body">
            <div class="hero-label">نشاط اليوم</div>
            <div class="hero-value">{{ activityStats?.today ?? 0 }}</div>
            <div class="hero-sub">{{ activityStats?.logins ?? 0 }} دخول • {{ activityStats?.signups ?? 0 }} تسجيل</div>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-icon">🗄️</div>
          <div class="hero-body">
            <div class="hero-label">حجم قاعدة البيانات</div>
            <div class="hero-value">{{ dbSizeKb }}<span style="font-size: 1rem; color: #64748b;"> KB</span></div>
            <div class="hero-sub">{{ healthTables.length }} جدول</div>
          </div>
        </div>
        <div class="hero-card accent">
          <div class="hero-icon">📝</div>
          <div class="hero-body">
            <div class="hero-label">تقارير اليوم</div>
            <div class="hero-value">{{ health?.today.reports ?? 0 }}</div>
            <div class="hero-sub">{{ health?.today.logins ?? 0 }} دخول اليوم</div>
          </div>
        </div>
      </div>

      <!-- ═══ Section 2: صحة الجداول ═══ -->
      <div v-if="healthTables.length > 0" class="section-header">
        <h2 class="section-title">🗄️ جداول قاعدة البيانات</h2>
      </div>
      <div v-if="healthTables.length > 0" class="dual-col">
        <div class="dual-left">
          <div class="modern-card">
            <h3>📊 أكبر الجداول</h3>
            <div class="table-health-list">
              <div v-for="[name, count] in healthTables.slice(0, 4)" :key="name" class="table-health-item">
                <span class="table-name">{{ name }}</span>
                <div class="table-bar-track">
                  <div class="table-bar-fill" :style="{ width: Math.min((count / (healthTables[0]?.[1] || 1)) * 100, 100) + '%' }"></div>
                </div>
                <span class="table-count">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="dual-right">
          <div class="modern-card">
            <h3>📋 باقي الجداول</h3>
            <div class="table-health-list">
              <div v-for="[name, count] in healthTables.slice(4)" :key="name" class="table-health-item">
                <span class="table-name">{{ name }}</span>
                <span class="table-count">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Section 3: النشاط الحديث ═══ -->
      <div class="section-header">
        <h2 class="section-title">⚡ النشاط الحديث</h2>
      </div>
      <div class="modern-card">
        <div v-if="recentActivity.length === 0" class="empty-inline">لا يوجد نشاط حديث</div>
        <div v-else class="recent-list">
          <div v-for="a in recentActivity" :key="a.id" class="recent-item" @click="emit('navigate', 'audit')">
            <span class="recent-icon">{{ a.action === 'login' ? '🔑' : a.action === 'signup' ? '✨' : a.action.includes('delete') ? '🗑️' : a.action.includes('create') ? '➕' : '📋' }}</span>
            <div class="recent-info">
              <span class="recent-name">{{ a.actor_name }}</span>
              <span class="recent-meta">{{ actionLabel(a.action) }}{{ a.target_type ? ' → ' + a.target_type : '' }}</span>
            </div>
            <span class="recent-badge">{{ a.actor_role }}</span>
            <span class="recent-date">{{ formatTime(a.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- ═══ Section 4: سجل التدقيق ═══ -->
      <div class="section-header">
        <h2 class="section-title">📜 سجل التدقيق</h2>
      </div>
      <div class="modern-card">
        <div v-if="recentAudit.length === 0" class="empty-inline">لا توجد سجلات</div>
        <div v-else class="recent-list">
          <div v-for="log in recentAudit" :key="log.id" class="recent-item" @click="emit('navigate', 'audit')">
            <span class="recent-icon">{{ log.action === 'DELETE' ? '🗑️' : log.action === 'INSERT' ? '➕' : '✏️' }}</span>
            <div class="recent-info">
              <span class="recent-name">{{ auditActionLabel(log.action) }} → {{ log.table_name }}</span>
              <span class="recent-meta">{{ log.actor_name || 'غير معروف' }} • #{{ log.record_id }}</span>
            </div>
            <span class="recent-badge" :class="log.action === 'DELETE' ? 'danger' : log.action === 'INSERT' ? 'success' : 'warn'">{{ auditActionLabel(log.action) }}</span>
            <span class="recent-date">{{ formatTime(log.created_at) }}</span>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.go-back {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: none; border: none; color: #818cf8; cursor: pointer;
  font-family: inherit; font-size: 0.85rem; font-weight: 600;
  padding: 0; margin-bottom: 1rem; transition: color 0.15s;
}
.go-back:hover { color: #a5b4fc; }

.loading-inline { text-align: center; color: #64748b; padding: 2rem; }
.error-inline { text-align: center; color: #f87171; padding: 1rem; }
.empty-inline { text-align: center; color: #64748b; padding: 1rem; font-size: 0.85rem; }

.section-header { margin-bottom: 1rem; margin-top: 1.5rem; }
.section-header:first-of-type { margin-top: 0; }
.section-title { font-size: 1.1rem; font-weight: 800; color: #e2e8f0; padding-bottom: 0.5rem; border-bottom: 2px solid rgba(99,102,241,0.2); }

.hero-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-bottom: 1.5rem; }
.hero-card { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; transition: all 0.3s; }
.hero-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
.hero-card.primary { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border-color: rgba(99,102,241,0.3); }
.hero-card.accent { background: linear-gradient(135deg, rgba(34,211,238,0.1), rgba(59,130,246,0.1)); border-color: rgba(34,211,238,0.3); }
.hero-icon { font-size: 2rem; flex-shrink: 0; }
.hero-body { flex: 1; min-width: 0; }
.hero-label { font-size: 0.8rem; color: #94a3b8; font-weight: 500; margin-bottom: 0.5rem; }
.hero-value { font-size: 2.2rem; font-weight: 800; color: #e2e8f0; line-height: 1; margin-bottom: 0.5rem; }
.hero-sub { font-size: 0.75rem; color: #64748b; }

.quick-links-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.8rem; margin-bottom: 1.5rem; }
.quick-link-card { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem 0.8rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.8rem; color: #cbd5e1; cursor: pointer; transition: all 0.3s; position: relative; font-family: inherit; }
.quick-link-card:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.4); transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
.link-icon-lg { font-size: 2rem; line-height: 1; }
.link-label-lg { font-size: 0.82rem; font-weight: 600; text-align: center; }

.dual-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.5rem; }
.dual-left, .dual-right { display: flex; flex-direction: column; gap: 1.2rem; }
@media (max-width: 768px) { .dual-col { grid-template-columns: 1fr; } }

.modern-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; }
.modern-card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 700; color: #e2e8f0; }

.table-health-list { display: flex; flex-direction: column; gap: 0.5rem; }
.table-health-item { display: flex; align-items: center; gap: 0.6rem; }
.table-name { font-size: 0.78rem; color: #cbd5e1; min-width: 80px; }
.table-bar-track { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.table-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #818cf8); border-radius: 3px; transition: width 0.5s; }
.table-count { font-size: 0.78rem; font-weight: 700; color: #818cf8; min-width: 40px; text-align: end; }

.recent-list { display: flex; flex-direction: column; gap: 0.4rem; }
.recent-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.6rem 0.75rem; background: rgba(255,255,255,0.02); border-radius: 0.5rem; cursor: pointer; transition: background 0.15s; }
.recent-item:hover { background: rgba(255,255,255,0.05); }
.recent-icon { font-size: 1.2rem; flex-shrink: 0; }
.recent-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.recent-name { font-size: 0.85rem; font-weight: 600; color: #e2e8f0; }
.recent-meta { font-size: 0.72rem; color: #64748b; }
.recent-badge { font-size: 0.68rem; padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-weight: 600; background: rgba(99,102,241,0.15); color: #a5b4fc; }
.recent-badge.success { background: rgba(34,197,94,0.15); color: #86efac; }
.recent-badge.warn { background: rgba(245,158,11,0.15); color: #fcd34d; }
.recent-badge.danger { background: rgba(239,68,68,0.15); color: #fca5a5; }
.recent-date { font-size: 0.72rem; color: #475569; flex-shrink: 0; }
</style>
