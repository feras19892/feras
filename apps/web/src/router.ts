import { createRouter, createWebHistory } from 'vue-router';

const routes = [
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
