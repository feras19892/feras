<script setup lang="ts">
import { useAdminManageOverview } from '@/composables/admin/useAdminManageOverview';
import type { AdminUser, AdminClassItem, AdminReportItem, AdminStats } from '@/services/admin.service';

const props = defineProps<{
  users: AdminUser[]
  classes: AdminClassItem[]
  reports: AdminReportItem[]
  stats: AdminStats | null
}>()

const emit = defineEmits<{
  (e: 'navigate', section: string): void
  (e: 'back'): void
}>()

const {
  loading, error, pendingApprovals, pendingEmail, pendingCapacity, totalPending,
  usersByRole, pendingReports, gradedReports, blockedUsers,
  inactiveUsers, emptyClasses, ungradedCount, noReportsTeachers, totalAlerts,
  recentUsers, recentReports, roleLabel, statusLabel, manageSections,
} = useAdminManageOverview(props)
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

<style scoped src='./ManageOverview.css'></style>
