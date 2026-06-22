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
  auth: auth.es,
  landing: landing.es,
  dashboard: dashboard.es,
  admin: admin.es,
  adminUser: adminUser.es,
  teacher: teacher.es,
  settings: settings.es,
  common: common.es,
  experiments: experiments.es,
  analysis: analysis.es,
  ai: ai.es,
  prism: {
    ...experiments.es,
    title: 'Dispersión de Luz por Prisma',
    emptyResults: 'Registra al menos 2 lecturas para ver resultados',
  },
} as const
