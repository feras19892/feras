import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './modules/auth/stores/auth';
import { getSystemStatus, type SystemStatus } from './services/system-status.service';
import { routes } from './router/routes';
import './types/router'; // augmentation

let cachedStatus: SystemStatus | null = null;
let statusPromise: Promise<void> | null = null;
let statusLastFetch = 0;
const STATUS_TTL_MS = 5 * 60 * 1000; // 5 minutes
const STATUS_RETRY_MAX = 3;
const STATUS_RETRY_BASE_MS = 350;

function isStatusNetworkError(err: unknown): boolean {
  return err instanceof TypeError || (err instanceof Error && (err.message.includes('Failed to fetch') || err.message.includes('fetch failed')));
}

/** Fetch system status with short retry/backoff to survive the dev startup race (API boots after web). */
async function fetchSystemStatusWithRetry(): Promise<SystemStatus | null> {
  for (let attempt = 1; attempt <= STATUS_RETRY_MAX; attempt++) {
    try {
      const status = await getSystemStatus();
      cachedStatus = status;
      statusLastFetch = Date.now();
      return status;
    } catch (err) {
      if (!isStatusNetworkError(err) || attempt === STATUS_RETRY_MAX) return null;
      await new Promise(r => setTimeout(r, STATUS_RETRY_BASE_MS * attempt));
    }
  }
  return null;
}

async function ensureSystemStatus() {
  const now = Date.now();
  if (cachedStatus && now - statusLastFetch < STATUS_TTL_MS) return;
  if (statusPromise) { await statusPromise; return; }
  statusPromise = fetchSystemStatusWithRetry().then(() => { statusPromise = null; });
  await statusPromise;
}

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  await ensureSystemStatus();

  // Block registration pages if registration is disabled
  if ((to.path === '/register' || to.path === '/school/register') && cachedStatus && !cachedStatus.registration_enabled) {
    return next('/');
  }

  // Block experiment sections if disabled by admin
  if (cachedStatus) {
    if (to.path.startsWith('/physics') && !cachedStatus.experiment_physics_enabled) return next('/dashboard');
    if (to.path.startsWith('/chemistry') && !cachedStatus.experiment_chemistry_enabled) return next('/dashboard');
    if (to.path.startsWith('/biology') && !cachedStatus.experiment_biology_enabled) return next('/dashboard');
    if (to.path.startsWith('/math') && !cachedStatus.experiment_math_enabled) return next('/dashboard');
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated && !auth.isGuest) {
    return next('/');
  }

  const requiredRoles = to.meta.roles;
  if (requiredRoles && auth.role) {
    if (auth.isGuest && to.path !== '/home' && to.path !== '/approvals') {
      return next('/home');
    }
    if (!requiredRoles.includes(auth.role)) {
      return next('/');
    }
  }

  // Redirect role-specific dashboards from /home (using new routes for testing)
  if (to.path === '/home' && !to.query.view) {
    if (auth.isAdmin) return next('/admin');
    if (auth.isStudent && !auth.isGuest) return next('/student');
    if (auth.isTeacher && !auth.isGuest) return next('/teacher');
    if (auth.isSchool) return next('/school');
  }

  next();
});

export default router;

