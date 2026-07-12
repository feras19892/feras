import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from './modules/auth/stores/auth';
import './types/router'; // augmentation

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('./pages/index.vue'),
  },
  {
    path: '/language',
    name: 'Language',
    component: () => import('./pages/language.vue'),
  },
  {
    path: '/login',
    redirect: '/',
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('./pages/register.vue'),
  },
  {
    path: '/dashboard',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'] },
    component: () => import('./pages/dashboard.vue'),
  },
  {
    path: '/chemistry',
    name: 'Chemistry',
    component: () => import('./modules/chemistry/ChemistryLanding.vue'),
  },
  {
    path: '/chemistry/analysis-calc',
    name: 'ChemistryAnalysis',
    meta: { requiresAuth: true },
    component: () => import('./modules/chemistry/analysis-calc/ChemAnalysisPage.vue'),
  },
  {
    path: '/physics',
    name: 'Branches',
    component: () => import('./modules/physics/branches-page.vue'),
  },
  {
    path: '/physics/:branchId',
    name: 'Branch',
    component: () => import('./modules/physics/branch-page.vue'),
  },
  {
    path: '/physics/:branchId/:experimentId',
    name: 'Experiment',
    component: () => import('./modules/physics/experiment-page.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    meta: { requiresAuth: true, roles: ['admin'] },
    component: () => import('./pages/admin.vue'),
  },
  {
    path: '/analysis',
    name: 'Analysis',
    meta: { requiresAuth: true },
    component: () => import('./modules/physics/experiments/analysis-calc/AnalysisCalcExperiment.vue'),
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import('./components/dev/ExperimentMonitorPage.vue'),
  },
  {
    path: '/math',
    name: 'MathHome',
    component: () => import('./pages/math/index.vue'),
  },
  {
    path: '/biology',
    name: 'BiologyHome',
    component: () => import('./pages/biology/index.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated && !auth.isGuest) {
    return next('/');
  }

  const requiredRoles = to.meta.roles;
  if (requiredRoles && auth.role && !requiredRoles.includes(auth.role)) {
    return next('/');
  }

  next();
});

export default router;
