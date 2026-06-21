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
