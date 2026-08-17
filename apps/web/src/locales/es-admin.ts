import { dashboardEs } from './dashboard-es'
import { adminEs } from './admin-es'
import { adminUser } from './admin-user'
import { adminExtras } from './admin-extras'
import { teacherEs } from './teacher-es'
import { approval } from './approval'
import { school } from './school'
import { schoolDashboardEs } from './school-dashboard-es'
import { schoolReportsLocale } from './school-reports-locale'

export default {
  dashboard: dashboardEs,
  admin: adminEs,
  adminUser: adminUser.es,
  adminExtras: adminExtras.es,
  teacher: teacherEs,
  approval: approval.es,
  school: { ...school.es, ...schoolDashboardEs, ...schoolReportsLocale.es },
} as const
