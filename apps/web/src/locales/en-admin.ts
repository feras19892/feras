import { dashboardEn } from './dashboard-en'
import { adminReports } from './admin-reports'
import { adminEn } from './admin-en'
import { adminUser } from './admin-user'
import { adminExtras } from './admin-extras'
import { teacherEn } from './teacher-en'
import { approval } from './approval'
import { school } from './school'
import { schoolDashboardEn } from './school-dashboard-en'
import { schoolReportsLocale } from './school-reports-locale'
import { system } from './system'

export default {
  dashboard: { ...dashboardEn, dashNew: adminReports.en },
  admin: adminEn,
  adminUser: adminUser.en,
  adminExtras: adminExtras.en,
  teacher: teacherEn,
  approval: approval.en,
  school: { ...school.en, ...schoolDashboardEn, ...schoolReportsLocale.en },
  system: system.en,
} as const
