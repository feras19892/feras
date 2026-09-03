import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../pages/index.vue'),
  },
  {
    path: '/language',
    name: 'Language',
    component: () => import('../pages/language.vue'),
  },
  {
    path: '/login',
    redirect: '/',
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/register.vue'),
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: () => import('../pages/verify-email.vue'),
  },
  {
    path: '/dashboard',
    redirect: '/',
  },
  {
    path: '/student',
    name: 'StudentDashboard',
    meta: { requiresAuth: true, roles: ['student'] },
    component: () => import('../pages/student/index.vue'),
  },
  {
    path: '/teacher',
    name: 'TeacherDashboard',
    meta: { requiresAuth: true, roles: ['teacher'] },
    component: () => import('../pages/teacher/index.vue'),
  },
  {
    path: '/teacher/payment',
    name: 'TeacherPayment',
    meta: { requiresAuth: true, roles: ['teacher'] },
    component: () => import('../pages/teacher/Payment.vue'),
  },
  {
    path: '/student/payment',
    name: 'StudentPayment',
    meta: { requiresAuth: true, roles: ['student'] },
    component: () => import('../pages/student/Payment.vue'),
  },
  {
    path: '/school/payment',
    name: 'SchoolPayment',
    meta: { requiresAuth: true, roles: ['school'] },
    component: () => import('../pages/school/Payment.vue'),
  },
  {
    path: '/chemistry',
    name: 'Chemistry',
    component: () => import('../modules/chemistry/ChemistryLanding.vue'),
  },
  {
    path: '/chemistry/analysis-calc',
    name: 'ChemistryAnalysis',
    meta: { requiresAuth: true },
    component: () => import('../modules/chemistry/analysis-calc/ChemAnalysisPage.vue'),
  },
  {
    path: '/physics',
    name: 'Branches',
    component: () => import('../modules/physics/branches-page.vue'),
  },
  {
    path: '/physics/:branchId',
    name: 'Branch',
    component: () => import('../modules/physics/branch-page.vue'),
  },
  {
    path: '/physics/:branchId/:experimentId',
    name: 'Experiment',
    component: () => import('../modules/physics/experiment-page.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    meta: { requiresAuth: true, roles: ['admin'] },
    component: () => import('../pages/admin/index.vue'),
  },
  {
    path: '/school/register',
    name: 'SchoolRegister',
    component: () => import('../pages/school-register.vue'),
  },
  {
    path: '/school/login',
    name: 'SchoolLogin',
    component: () => import('../pages/school-login.vue'),
  },
  {
    path: '/school',
    name: 'SchoolDashboard',
    meta: { requiresAuth: true, roles: ['school'] },
    component: () => import('../pages/school/index.vue'),
  },
  {
    path: '/school/members',
    name: 'SchoolMembers',
    meta: { requiresAuth: true, roles: ['school'] },
    component: () => import('../pages/school/tabs/SchoolMembers.vue'),
  },
  {
    path: '/analysis',
    name: 'Analysis',
    meta: { requiresAuth: true },
    component: () => import('../pages/analysis-v3.vue'),
  },
  {
    path: '/analysis-v2',
    name: 'AnalysisV2',
    component: () => import('../pages/analysis-v3.vue'),
  },
  {
    path: '/analysis-v3',
    name: 'AnalysisV3',
    component: () => import('../pages/analysis-v3.vue'),
  },
  {
    path: '/report/:id',
    name: 'TeacherReport',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin', 'school'] },
    component: () => import('../pages/report-view.vue'),
  },
  {
    path: '/math',
    name: 'MathHome',
    component: () => import('../pages/math/index.vue'),
  },
  {
    path: '/biology',
    name: 'BiologyHome',
    component: () => import('../pages/biology/index.vue'),
  },
  {
    path: '/biology/cell',
    name: 'BiologyCell',
    component: () => import('../pages/biology/cell/index.vue'),
  },
  {
    path: '/biology/cell/dna-structure',
    name: 'BiologyDnaStructure',
    meta: { requiresAuth: true },
    component: () => import('../pages/biology/cell/dna-structure.vue'),
  },
  {
    path: '/biology/cell/plant-cell',
    name: 'BiologyPlantCell',
    meta: { requiresAuth: true },
    component: () => import('../pages/biology/cell/plant-cell.vue'),
  },
  {
    path: '/biology/cell/protein-synthesis',
    name: 'BiologyProteinSynthesis',
    meta: { requiresAuth: true },
    component: () => import('../pages/biology/cell/protein-synthesis.vue'),
  },
  {
    path: '/biology/anatomy',
    name: 'BiologyAnatomy',
    component: () => import('../pages/biology/anatomy/index.vue'),
  },
  {
    path: '/biology/anatomy/heart',
    name: 'BiologyHeart',
    meta: { requiresAuth: true },
    component: () => import('../pages/biology/anatomy/heart.vue'),
  },
  {
    path: '/biology/anatomy/lungs',
    name: 'BiologyLungs',
    meta: { requiresAuth: true },
    component: () => import('../pages/biology/anatomy/lungs.vue'),
  },
  {
    path: '/biology/anatomy/skeleton',
    name: 'BiologySkeleton',
    meta: { requiresAuth: true },
    component: () => import('../pages/biology/anatomy/skeleton.vue'),
  },
  {
    path: '/biology/anatomy/digestive',
    name: 'BiologyDigestive',
    meta: { requiresAuth: true },
    component: () => import('../pages/biology/anatomy/digestive.vue'),
  },
  {
    path: '/biology/anatomy/kidney',
    name: 'BiologyKidney',
    meta: { requiresAuth: true },
    component: () => import('../pages/biology/anatomy/kidney.vue'),
  },
  {
    path: '/biology/anatomy/eye',
    name: 'BiologyEye',
    meta: { requiresAuth: true },
    component: () => import('../pages/biology/anatomy/eye.vue'),
  },
  {
    path: '/privacy',
    name: 'PrivacyPolicy',
    component: () => import('../pages/PrivacyPolicy.vue'),
  },
  {
    path: '/terms',
    name: 'TermsOfService',
    component: () => import('../pages/TermsOfService.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
  },
];
