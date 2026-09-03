import { ref, computed, onActivated, onDeactivated, onMounted, onUnmounted, type ComputedRef } from 'vue';
import { useI18n } from '../../../composables/useI18n';
import { eventBus } from '../../../composables/shared/useEventBus';
import {
  getDetailedStats, getAcademicTracking, getAdminSystemHealth, getAdminInsights,
  type AdminStats,
} from '../../../services/admin.service';

export interface DetailedStats {
  period: string;
  totals: {
    users: number; students: number; teachers: number; schools: number;
    classes: number; reports: number; graded: number; pending: number;
    overdue: number; sessions: number; active_now: number; active_users: number;
    today_logins: number; avg_grade: number;
  };
  hourly_activity: { hour: string; count: number }[];
  daily_activity: { date: string; count: number }[];
  reports_by_status: { status: string; count: number }[];
  users_by_role: { role: string; count: number }[];
  top_schools: { id: number; name: string; user_count: number; class_count: number; report_count: number }[];
  top_classes: { id: string; name: string; teacher_name: string; report_count: number; student_count: number }[];
}

export interface AcademicClass {
  id: string; name: string; is_frozen: number; is_active: number;
  student_count: number; report_count: number; avg_grade: number;
  teacher_name: string; school_name: string; pending_count: number;
  graded_count: number; overdue_count: number; quiz_count: number;
  health_status: string; code: string;
}

export interface AcademicTracking {
  global: {
    total_students: number; total_teachers: number; total_classes: number;
    total_reports: number; total_graded: number; total_pending: number;
    total_overdue: number; global_avg: number;
  };
  class_health: { healthy: number; warning: number; critical: number; inactive: number };
  classes: AcademicClass[];
}

export interface SystemHealth {
  counts: { users: number; classes: number; reports: number; sessions: number; feedback: number; activity: number };
  today: { logins: number; signups: number; reports: number };
  dbSize: number;
  tables: Record<string, number>;
}

export interface Insights {
  inactiveUsers?: { id: number; name: string; role: string }[];
  emptyClasses?: { id: number; name: string; teacher_name: string }[];
  ungradedCount?: number;
  noReportsTeachers?: { id: number; name: string }[];
  topUsers?: { id: number; name: string; role: string; report_count: number }[];
  recentActivity?: { actor_name: string; actor_role?: string; action: string; created_at?: string; details?: string }[];
}

export type TabKey = 'overview' | 'performance' | 'alerts' | 'analytics' | 'academic';

export function safeDivide(a: number, b: number): number {
  if (!b || b === 0) return 0;
  return Math.round((a / b) * 100);
}

export function roleLabel(role: string): string {
  const labels: Record<string, string> = { admin: 'أدمن', teacher: 'مدرس', student: 'طالب', school: 'مدرسة', parent: 'ولي أمر' };
  return labels[role] || role;
}

export function roleColor(role: string): string {
  const colors: Record<string, string> = { admin: '#f87171', teacher: '#60a5fa', student: '#34d399', school: '#67e8f9', parent: '#fbbf24' };
  return colors[role] || '#94a3b8';
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = { graded: 'مصحح', submitted: 'معلق', resubmitted: 'معاد' };
  return labels[status] || status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = { graded: '#34d399', submitted: '#fbbf24', resubmitted: '#f87171' };
  return colors[status] || '#94a3b8';
}

export function healthLabel(status: string): string {
  const labels: Record<string, string> = { healthy: 'سليم', warning: 'تحذير', critical: 'حرج', inactive: 'غير نشط' };
  return labels[status] || status;
}

export function healthClass(status: string): string {
  const classes: Record<string, string> = { healthy: 'success', warning: 'warn', critical: 'danger', inactive: 'inactive' };
  return classes[status] || '';
}

export function formatTime(dateStr?: string, locale = 'ar-SA'): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export function useAdminDashboard(stats: ComputedRef<AdminStats | null>) {
  const { t } = useI18n();

  const activeTab = ref<TabKey>('overview');
  const detailed = ref<DetailedStats | null>(null);
  const academic = ref<AcademicTracking | null>(null);
  const health = ref<SystemHealth | null>(null);
  const insights = ref<Insights | null>(null);
  const loading = ref(false);
  const error = ref('');

  let isMounted = true;
  let loadController: AbortController | null = null;

  async function load() {
    if (!isMounted) return;
    if (loadController) { loadController.abort(); loadController = null; }
    loadController = new AbortController();
    loading.value = true;
    error.value = '';
    try {
      const [d, a, h, i] = await Promise.all([
        getDetailedStats('all', loadController.signal),
        getAcademicTracking(loadController.signal),
        getAdminSystemHealth(loadController.signal),
        getAdminInsights(loadController.signal),
      ]);
      if (!isMounted) return;
      if (d.success) detailed.value = d.stats as unknown as DetailedStats;
      if (a.success) academic.value = a.tracking as unknown as AcademicTracking;
      if (h.success) health.value = h.health as unknown as SystemHealth;
      if (i.success) insights.value = i.insights as unknown as Insights;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (isMounted) error.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
    } finally {
      loadController = null;
      if (isMounted) loading.value = false;
    }
  }

  const usersByRole = computed(() => {
    if (!stats.value?.users?.byRole) return { admin: 0, teacher: 0, student: 0 };
    const roles = stats.value.users.byRole.reduce((acc, r) => ({ ...acc, [r.role]: r.count }), {} as Record<string, number>);
    return { admin: roles.admin || 0, teacher: roles.teacher || 0, student: roles.student || 0 };
  });

  const topSchools = computed(() => {
    if (!detailed.value?.top_schools) return [];
    return detailed.value.top_schools.slice(0, 5).map(s => ({
      id: s.id, name: s.name, meta: `${s.report_count} تقرير • ${s.user_count} مستخدم`,
    }));
  });

  const topClasses = computed(() => {
    if (!detailed.value?.top_classes) return [];
    return detailed.value.top_classes.slice(0, 5).map(c => ({
      id: c.id, name: c.name, meta: `${c.teacher_name} • ${c.report_count} تقرير`,
    }));
  });

  const maxHourly = computed(() => {
    if (!detailed.value?.hourly_activity?.length) return 1;
    return Math.max(...detailed.value.hourly_activity.map(h => h.count), 1);
  });

  const maxDaily = computed(() => {
    if (!detailed.value?.daily_activity?.length) return 1;
    return Math.max(...detailed.value.daily_activity.map(d => d.count), 1);
  });

  const completionRate = computed(() => {
    if (!detailed.value) return 0;
    return safeDivide(detailed.value.totals.graded, detailed.value.totals.reports);
  });

  const gradingRate = computed(() => {
    if (!detailed.value) return 0;
    return safeDivide(detailed.value.totals.graded, detailed.value.totals.graded + detailed.value.totals.pending);
  });

  const activityRate = computed(() => {
    if (!detailed.value) return 0;
    return safeDivide(detailed.value.totals.active_users, detailed.value.totals.users);
  });

  const systemStatus = computed(() => {
    if (!health.value) return { ok: false, label: t('admin.systemLoading'), cls: 'inactive' };
    const sessions = health.value.counts.sessions || 0;
    if (sessions > 0) return { ok: true, label: t('admin.systemRunning'), cls: 'success' };
    return { ok: true, label: t('admin.systemRunningIdle'), cls: 'success' };
  });

  const totalAlerts = computed(() => {
    if (!insights.value) return 0;
    return (insights.value.inactiveUsers?.length ?? 0) +
      (insights.value.emptyClasses?.length ?? 0) +
      (insights.value.ungradedCount ? 1 : 0) +
      (insights.value.noReportsTeachers?.length ?? 0);
  });

  const hasAlerts = computed(() => totalAlerts.value > 0);
  const recentActivityList = computed(() => insights.value?.recentActivity ?? []);
  const academicGlobal = computed(() => academic.value?.global ?? null);
  const classHealth = computed(() => academic.value?.class_health ?? null);

  const healthTables = computed(() => {
    if (!health.value?.tables) return [];
    return Object.entries(health.value.tables)
      .filter(([name]) => !name.startsWith('sqlite_'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  });

  const liveEvents = ['report:submitted', 'class:created', 'user:banned', 'user:unbanned', 'dashboard:refresh'] as const;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function attach() {
    for (const e of liveEvents) eventBus.on(e, load);
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible' && isMounted) load();
    }, 60000);
  }

  function detach() {
    for (const e of liveEvents) eventBus.off(e, load);
    if (loadController) { loadController.abort(); loadController = null; }
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  onMounted(() => { isMounted = true; attach(); load(); });
  onActivated(() => { isMounted = true; attach(); load(); });
  onDeactivated(() => { isMounted = false; detach(); });
  onUnmounted(() => { isMounted = false; detach(); });

  return {
    activeTab, detailed, academic, health, insights, loading, error, load,
    usersByRole, topSchools, topClasses, maxHourly, maxDaily,
    completionRate, gradingRate, activityRate, systemStatus,
    totalAlerts, hasAlerts, recentActivityList, academicGlobal, classHealth, healthTables,
  };
}

export type AdminDashboardReturn = ReturnType<typeof useAdminDashboard>;
