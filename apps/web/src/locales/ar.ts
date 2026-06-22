import { auth } from './auth'
import { landing } from './landing'
import { dashboard } from './dashboard'
import { admin } from './admin'
import { adminUser } from './admin-user'
import { teacher } from './teacher'
import { common } from './common'
import { settings } from './settings'
import { experiments } from './experiments/index'
import { analysis } from './analysis/index'
import { ai } from './ai'

export default {
  auth: auth.ar,
  landing: landing.ar,
  dashboard: dashboard.ar,
  admin: admin.ar,
  adminUser: adminUser.ar,
  teacher: teacher.ar,
  settings: settings.ar,
  common: common.ar,
  experiments: experiments.ar,
  analysis: analysis.ar,
  ai: ai.ar,
  prism: {
    ...experiments.ar,
    title: 'تحلل الضوء بالمنشور',
    emptyResults: 'سجل قراءتين على الأقل لعرض النتائج',
  },
} as const
