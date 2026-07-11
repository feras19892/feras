import { auth } from './auth'
import { landing } from './landing'
import { dashboard } from './dashboard'
import { admin } from './admin'
import { adminUser } from './admin-user'
import { teacher } from './teacher'
import { common } from './common'
import { settings } from './settings'
import { analysis } from './analysis/index'
import { ai } from './ai'
import { chemistry } from './chemistry'
import { chemistryReport } from './chemistry-report'
import { chemistryAnalysis } from './chemistry-analysis'
import { chemistryShelf } from './chemistry-shelf'
import { chemistryLab } from './chemistry-lab'
import { chemistryExperiments } from './chemistry-experiments'
import { chemistryTools } from './chemistry-tools'
import { chemistryAssistant } from './chemistry-assistant'

export default {
  auth: auth.ar,
  landing: landing.ar,
  dashboard: dashboard.ar,
  admin: admin.ar,
  adminUser: adminUser.ar,
  teacher: teacher.ar,
  settings: settings.ar,
  common: common.ar,
  analysis: analysis.ar,
  ai: ai.ar,
  chemistry: chemistry.ar,
  chemistryReport: chemistryReport.ar,
  chemistryAnalysis: chemistryAnalysis.ar,
  chemistryShelf: chemistryShelf.ar,
  chemistryLab: chemistryLab.ar,
  chemistryExperiments: chemistryExperiments.ar,
  chemistryTools: chemistryTools.ar,
  chemistryAssistant: chemistryAssistant.ar,
} as const
