<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getAdminInsights, type AdminInsights } from '../../services/admin.service';
import { adminGetAllApprovals, type ApprovalRequest } from '../../services/approval.service';
import { adminGetEmailRequests, adminGetCapacityRequests, type EmailChangeRequest, type CapacityRequest } from '../../services/school.service';
import type { AdminUser, AdminClassItem, AdminReportItem, AdminStats } from '../../services/admin.service';

const props = defineProps<{
  users: AdminUser[]
  classes: AdminClassItem[]
  reports: AdminReportItem[]
  stats: AdminStats | null
}>();

const emit = defineEmits<{
  (e: 'navigate', section: string): void
  (e: 'back'): void
}>();

const insights = ref<AdminInsights | null>(null);
const approvals = ref<ApprovalRequest[]>([]);
const emailRequests = ref<EmailChangeRequest[]>([]);
const capacityRequests = ref<CapacityRequest[]>([]);
const loading = ref(true);
const error = ref('');

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [i, a, er, cr] = await Promise.all([
      getAdminInsights(),
      adminGetAllApprovals(),
      adminGetEmailRequests(),
      adminGetCapacityRequests(),
    ]);
    if (i.success) insights.value = i.insights;
    if (a.success) approvals.value = a.approvals;
    if (er.success) emailRequests.value = er.requests;
    if (cr.success) capacityRequests.value = cr.requests;
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || 'فشل تحميل البيانات';
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);

// Pending counts
const pendingApprovals = computed(() => approvals.value.filter(a => a.status === 'pending').length);
const pendingEmail = computed(() => emailRequests.value.filter(r => r.status === 'pending').length);
const pendingCapacity = computed(() => capacityRequests.value.filter(r => r.status === 'pending').length);
const totalPending = computed(() => pendingApprovals.value + pendingEmail.value + pendingCapacity.value);

// Stats
const usersByRole = computed(() => {
  if (!props.stats?.users?.byRole) return { admin: 0, teacher: 0, student: 0 };
  const roles = props.stats.users.byRole.reduce((acc, r) => ({ ...acc, [r.role]: r.count }), {} as Record<string, number>);
  return { admin: roles.admin || 0, teacher: roles.teacher || 0, student: roles.student || 0 };
});

const pendingReports = computed(() => props.stats?.reports?.pending ?? 0);
const gradedReports = computed(() => props.stats?.reports?.graded ?? 0);
const blockedUsers = computed(() => props.users.filter(u => u.blocked_at).length);

// Alert items
const inactiveUsers = computed(() => insights.value?.inactiveUsers ?? []);
const emptyClasses = computed(() => insights.value?.emptyClasses ?? []);
const ungradedCount = computed(() => insights.value?.ungradedCount ?? 0);
const noReportsTeachers = computed(() => insights.value?.noReportsTeachers ?? []);

const totalAlerts = computed(() => inactiveUsers.value.length + emptyClasses.value.length + ungradedCount.value + noReportsTeachers.value.length);

// Recent users (last 5)
const recentUsers = computed(() =>
  [...props.users]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5)
);

// Recent reports (last 5)
const recentReports = computed(() =>
  [...props.reports]
    .sort((a, b) => (b.submitted_at || '').localeCompare(a.submitted_at || ''))
    .slice(0, 5)
);

function roleLabel(role: string) {
  const labels: Record<string, string> = { admin: 'أدمن', teacher: 'مدرس', student: 'طالب', school: 'مدرسة', parent: 'ولي أمر' };
  return labels[role] || role;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = { graded: 'مصحح', submitted: 'معلق', resubmitted: 'معاد', draft: 'مسودة' };
  return labels[status] || status;
}

const manageSections = [
  { id: 'users', icon: '👥', label: 'المستخدمون' },
  { id: 'classes', icon: '📚', label: 'الفصول' },
  { id: 'reports', icon: '📄', label: 'التقارير' },
  { id: 'schools', icon: '🏫', label: 'المدارس' },
  { id: 'requests', icon: '📋', label: 'الطلبات' },
  { id: 'approvals', icon: '✅', label: 'الموافقات' },
];
</script>

<template>
  <div class="tab-content">

    <!-- Back -->
    <button class="go-back" @click="emit('back')">
      <span>⟵</span>
      <span>العودة للنظرة العامة</span>
    </button>

    <div v-if="loading" class="loading-inline">جاري تحميل بيانات الإدارة...</div>
    <div v-else-if="error" class="error-inline">❌ {{ error }}</div>

    <template v-else>
      <!-- ═══ Section 0: الأقسام ═══ -->
      <div class="section-header">
        <h2 class="section-title">⚡ الأقسام</h2>
      </div>
      <div class="quick-links-grid">
        <button
          v-for="item in manageSections"
          :key="item.id"
          class="quick-link-card"
          @click="emit('navigate', item.id)"
        >
          <span v-if="item.id === 'approvals' && pendingApprovals > 0" class="go-badge">{{ pendingApprovals }}</span>
          <span v-if="item.id === 'requests' && (pendingEmail + pendingCapacity) > 0" class="go-badge">{{ pendingEmail + pendingCapacity }}</span>
          <span class="link-icon-lg">{{ item.icon }}</span>
          <span class="link-label-lg">{{ item.label }}</span>
          <template v-if="item.id === 'users'">
            <span class="go-count">{{ props.stats?.users?.total ?? 0 }}</span>
            <span class="go-sub">مستخدم</span>
          </template>
          <template v-else-if="item.id === 'classes'">
            <span class="go-count">{{ props.stats?.classes?.total ?? 0 }}</span>
            <span class="go-sub">فصل</span>
          </template>
          <template v-else-if="item.id === 'reports'">
            <span class="go-count">{{ props.stats?.reports?.total ?? 0 }}</span>
            <span class="go-sub">تقرير</span>
          </template>
        </button>
      </div>

      <!-- ═══ Section 1: ملخص الإدارة ═══ -->
      <div class="section-header">
        <h2 class="section-title">📊 ملخص الإدارة</h2>
      </div>
      <div class="hero-stats">
        <div class="hero-card primary">
          <div class="hero-icon">👥</div>
          <div class="hero-body">
            <div class="hero-label">إجمالي المستخدمين</div>
            <div class="hero-value">{{ props.stats?.users?.total ?? 0 }}</div>
            <div class="hero-sub">{{ usersByRole.student }} طالب • {{ usersByRole.teacher }} مدرس • {{ usersByRole.admin }} أدمن</div>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-icon">📚</div>
          <div class="hero-body">
            <div class="hero-label">الفصول</div>
            <div class="hero-value">{{ props.stats?.classes?.total ?? 0 }}</div>
            <div class="hero-sub">{{ emptyClasses.length }} فارغ • {{ blockedUsers }} مستخدم محظور</div>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-icon">📄</div>
          <div class="hero-body">
            <div class="hero-label">التقارير</div>
            <div class="hero-value">{{ props.stats?.reports?.total ?? 0 }}</div>
            <div class="hero-sub">{{ gradedReports }} مصحح • {{ pendingReports }} معلق</div>
          </div>
        </div>
        <div class="hero-card accent">
          <div class="hero-icon">⏳</div>
          <div class="hero-body">
            <div class="hero-label">إجراءات معلّقة</div>
            <div class="hero-value">{{ totalPending }}</div>
            <div class="hero-sub">{{ pendingApprovals }} موافقة • {{ pendingEmail + pendingCapacity }} طلب</div>
          </div>
        </div>
      </div>

      <!-- ═══ Section 2: إجراءات معلّقة ═══ -->
      <div v-if="totalPending > 0" class="section-header">
        <h2 class="section-title">⏳ إجراءات بانتظارك</h2>
      </div>
      <div v-if="totalPending > 0" class="pending-grid">
        <button v-if="pendingApprovals > 0" class="pending-card warning" @click="emit('navigate', 'approvals')">
          <span class="pending-icon">✅</span>
          <div class="pending-body">
            <span class="pending-label">موافقات معلّقة</span>
            <span class="pending-count">{{ pendingApprovals }}</span>
          </div>
          <span class="pending-arrow">←</span>
        </button>
        <button v-if="pendingEmail > 0" class="pending-card info" @click="emit('navigate', 'requests')">
          <span class="pending-icon">📧</span>
          <div class="pending-body">
            <span class="pending-label">طلبات تغيير بريد</span>
            <span class="pending-count">{{ pendingEmail }}</span>
          </div>
          <span class="pending-arrow">←</span>
        </button>
        <button v-if="pendingCapacity > 0" class="pending-card info" @click="emit('navigate', 'requests')">
          <span class="pending-icon">📦</span>
          <div class="pending-body">
            <span class="pending-label">طلبات سعة</span>
            <span class="pending-count">{{ pendingCapacity }}</span>
          </div>
          <span class="pending-arrow">←</span>
        </button>
        <button v-if="ungradedCount > 0" class="pending-card danger" @click="emit('navigate', 'reports')">
          <span class="pending-icon">⏰</span>
          <div class="pending-body">
            <span class="pending-label">تقارير متأخرة غير مصححة</span>
            <span class="pending-count">{{ ungradedCount }}</span>
          </div>
          <span class="pending-arrow">←</span>
        </button>
      </div>

      <!-- ═══ Section 3: تنبيهات إدارية ═══ -->
      <div v-if="totalAlerts > 0" class="section-header">
        <h2 class="section-title">🚨 تنبيهات إدارية</h2>
      </div>
      <div v-if="totalAlerts > 0" class="dual-col">
        <div class="dual-left">
          <div v-if="inactiveUsers.length > 0" class="modern-card">
            <h3>👥 مستخدمون غير نشطين ({{ inactiveUsers.length }})</h3>
            <div class="alert-list">
              <div v-for="u in inactiveUsers.slice(0, 6)" :key="u.id" class="alert-item">
                <span class="alert-item-name">{{ u.name }}</span>
                <span class="alert-item-badge">{{ roleLabel(u.role) }}</span>
              </div>
              <div v-if="inactiveUsers.length > 6" class="alert-more">+{{ inactiveUsers.length - 6 }} آخرين</div>
            </div>
          </div>
          <div v-if="noReportsTeachers.length > 0" class="modern-card">
            <h3>👨‍🏫 مدرسون بلا تقارير ({{ noReportsTeachers.length }})</h3>
            <div class="alert-list">
              <div v-for="tch in noReportsTeachers.slice(0, 6)" :key="tch.id" class="alert-item">
                <span class="alert-item-name">{{ tch.name }}</span>
              </div>
              <div v-if="noReportsTeachers.length > 6" class="alert-more">+{{ noReportsTeachers.length - 6 }} آخرين</div>
            </div>
          </div>
        </div>
        <div class="dual-right">
          <div v-if="emptyClasses.length > 0" class="modern-card">
            <h3>📚 فصول فارغة ({{ emptyClasses.length }})</h3>
            <div class="alert-list">
              <div v-for="c in emptyClasses.slice(0, 6)" :key="c.id" class="alert-item">
                <span class="alert-item-name">{{ c.name }}</span>
                <span class="alert-item-meta">{{ c.teacher_name }}</span>
              </div>
              <div v-if="emptyClasses.length > 6" class="alert-more">+{{ emptyClasses.length - 6 }} فصول أخرى</div>
            </div>
          </div>
          <div v-if="blockedUsers > 0" class="modern-card">
            <h3>🚫 مستخدمون محظورون ({{ blockedUsers }})</h3>
            <div class="alert-list">
              <div v-for="u in props.users.filter(u => u.blocked_at).slice(0, 6)" :key="u.id" class="alert-item">
                <span class="alert-item-name">{{ u.name }}</span>
                <span class="alert-item-meta">{{ u.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Section 4: أحدث المستخدمين ═══ -->
      <div class="section-header">
        <h2 class="section-title">🆕 أحدث المستخدمين</h2>
      </div>
      <div class="modern-card">
        <div class="recent-list">
          <div v-for="u in recentUsers" :key="u.id" class="recent-item" @click="emit('navigate', 'users')">
            <span class="recent-icon">{{ u.role === 'admin' ? '🛡️' : u.role === 'teacher' ? '👨‍🏫' : '🎓' }}</span>
            <div class="recent-info">
              <span class="recent-name">{{ u.name }}</span>
              <span class="recent-meta">{{ u.email }}</span>
            </div>
            <span class="recent-badge">{{ roleLabel(u.role) }}</span>
            <span class="recent-date">{{ u.created_at?.slice(0, 10) }}</span>
          </div>
        </div>
      </div>

      <!-- ═══ Section 5: أحدث التقارير ═══ -->
      <div class="section-header">
        <h2 class="section-title">📄 أحدث التقارير</h2>
      </div>
      <div class="modern-card">
        <div class="recent-list">
          <div v-for="r in recentReports" :key="r.id" class="recent-item" @click="emit('navigate', 'reports')">
            <span class="recent-icon">📄</span>
            <div class="recent-info">
              <span class="recent-name">{{ r.student_name }}</span>
              <span class="recent-meta">{{ r.experiment_name }} • {{ r.class_name }}</span>
            </div>
            <span class="recent-badge" :class="r.status">{{ statusLabel(r.status) }}</span>
            <span class="recent-date">{{ r.submitted_at?.slice(0, 10) }}</span>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
/* Back button */
.go-back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: #818cf8;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0;
  margin-bottom: 1rem;
  transition: color 0.15s;
}
.go-back:hover { color: #a5b4fc; }

.loading-inline { text-align: center; color: #64748b; padding: 2rem; }
.error-inline { text-align: center; color: #f87171; padding: 1rem; }

/* Section Headers — identical to TabOverview */
.section-header { margin-bottom: 1rem; margin-top: 1.5rem; }
.section-header:first-of-type { margin-top: 0; }
.section-title { font-size: 1.1rem; font-weight: 800; color: #e2e8f0; padding-bottom: 0.5rem; border-bottom: 2px solid rgba(99,102,241,0.2); }

/* Hero Stats — identical to TabOverview */
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

/* Pending Actions */
.pending-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.8rem; margin-bottom: 1.5rem; }
.pending-card { display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.2rem; border-radius: 0.8rem; border: 1px solid; cursor: pointer; transition: all 0.2s; font-family: inherit; text-align: start; }
.pending-card:hover { transform: translateY(-2px); }
.pending-card.warning { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); }
.pending-card.warning:hover { background: rgba(245,158,11,0.15); }
.pending-card.info { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.2); }
.pending-card.info:hover { background: rgba(59,130,246,0.15); }
.pending-card.danger { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); }
.pending-card.danger:hover { background: rgba(239,68,68,0.15); }
.pending-icon { font-size: 1.5rem; flex-shrink: 0; }
.pending-body { flex: 1; display: flex; flex-direction: column; }
.pending-label { font-size: 0.82rem; font-weight: 600; color: #cbd5e1; }
.pending-count { font-size: 1.3rem; font-weight: 800; color: #e2e8f0; }
.pending-arrow { font-size: 1rem; color: #64748b; }

/* Dual Column — identical to TabOverview */
.dual-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.5rem; }
.dual-left, .dual-right { display: flex; flex-direction: column; gap: 1.2rem; }
@media (max-width: 768px) { .dual-col { grid-template-columns: 1fr; } }

/* Modern Card — identical to TabOverview */
.modern-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; }
.modern-card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 700; color: #e2e8f0; }

/* Alert List */
.alert-list { display: flex; flex-direction: column; gap: 0.4rem; }
.alert-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.02); border-radius: 0.4rem; }
.alert-item-name { font-size: 0.82rem; color: #e2e8f0; font-weight: 600; }
.alert-item-badge { font-size: 0.68rem; padding: 0.1rem 0.4rem; border-radius: 999px; background: rgba(99,102,241,0.15); color: #a5b4fc; }
.alert-item-meta { font-size: 0.72rem; color: #64748b; }
.alert-more { font-size: 0.72rem; color: #64748b; text-align: center; padding: 0.4rem; }

/* Recent List */
.recent-list { display: flex; flex-direction: column; gap: 0.4rem; }
.recent-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.6rem 0.75rem; background: rgba(255,255,255,0.02); border-radius: 0.5rem; cursor: pointer; transition: background 0.15s; }
.recent-item:hover { background: rgba(255,255,255,0.05); }
.recent-icon { font-size: 1.2rem; flex-shrink: 0; }
.recent-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.recent-name { font-size: 0.85rem; font-weight: 600; color: #e2e8f0; }
.recent-meta { font-size: 0.72rem; color: #64748b; }
.recent-badge { font-size: 0.68rem; padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-weight: 600; background: rgba(99,102,241,0.15); color: #a5b4fc; }
.recent-badge.graded { background: rgba(34,197,94,0.15); color: #86efac; }
.recent-badge.submitted { background: rgba(245,158,11,0.15); color: #fcd34d; }
.recent-badge.resubmitted { background: rgba(239,68,68,0.15); color: #fca5a5; }
.recent-badge.draft { background: rgba(100,116,139,0.15); color: #94a3b8; }
.recent-date { font-size: 0.72rem; color: #475569; flex-shrink: 0; }

/* Quick Links — identical to TabOverview */
.quick-links-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.8rem; margin-bottom: 1.5rem; }
.quick-link-card { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem 0.8rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.8rem; color: #cbd5e1; cursor: pointer; transition: all 0.3s; position: relative; font-family: inherit; }
.quick-link-card:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.4); transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
.link-icon-lg { font-size: 2rem; line-height: 1; }
.link-label-lg { font-size: 0.82rem; font-weight: 600; text-align: center; }
.go-count { font-size: 1.4rem; font-weight: 800; color: #818cf8; line-height: 1; }
.go-sub { font-size: 0.68rem; color: #64748b; text-align: center; }
.go-badge { position: absolute; top: 0.4rem; inset-inline-end: 0.4rem; min-width: 18px; height: 18px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.62rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
</style>
