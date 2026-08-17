import { dashboardEn } from './dashboard-en'
import { adminEn } from './admin-en'
import { adminUser } from './admin-user'
import { adminExtras } from './admin-extras'
import { teacherEn } from './teacher-en'
import { approval } from './approval'
import { school } from './school'
import { schoolDashboardEn } from './school-dashboard-en'
import { schoolReportsLocale } from './school-reports-locale'

export default {
  dashboard: dashboardEn,
  admin: adminEn,
  adminUser: adminUser.en,
  adminExtras: adminExtras.en,
  teacher: teacherEn,
  approval: approval.en,
  school: { ...school.en, ...schoolDashboardEn, ...schoolReportsLocale.en },
} as const
