import { auth } from './auth'
import { landing } from './landing'
import { dashboard } from './dashboard'
import { admin } from './admin'
import { adminUser } from './admin-user'
import { teacher } from './teacher'
import { common } from './common'
import { settings } from './settings'
import { experiments } from './experiments'
import { analysis } from './analysis'
import { ai } from './ai'

export default {
  auth: auth.en,
  landing: landing.en,
  dashboard: dashboard.en,
  admin: admin.en,
  adminUser: adminUser.en,
  teacher: teacher.en,
  settings: settings.en,
  common: common.en,
  experiments: experiments.en,
  analysis: analysis.en,
  ai: ai.en,
} as const
