import { dashboardAr } from './dashboard-ar'
import { adminAr } from './admin-ar'
import { adminUser } from './admin-user'
import { adminExtras } from './admin-extras'
import { teacherAr } from './teacher-ar'
import { approval } from './approval'
import { school } from './school'
import { schoolDashboardAr } from './school-dashboard-ar'
import { schoolReportsLocale } from './school-reports-locale'

export default {
  dashboard: dashboardAr,
  admin: adminAr,
  adminUser: adminUser.ar,
  adminExtras: adminExtras.ar,
  teacher: teacherAr,
  approval: approval.ar,
  school: { ...school.ar, ...schoolDashboardAr, ...schoolReportsLocale.ar },
} as const
