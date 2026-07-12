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
import { biology } from './biology'

export default {
  auth: auth.es,
  landing: landing.es,
  dashboard: dashboard.es,
  admin: admin.es,
  adminUser: adminUser.es,
  teacher: teacher.es,
  settings: settings.es,
  common: common.es,
  analysis: analysis.es,
  ai: ai.es,
  chemistry: chemistry.es,
  chemistryReport: chemistryReport.es,
  chemistryAnalysis: chemistryAnalysis.es,
  chemistryShelf: chemistryShelf.es,
  chemistryLab: chemistryLab.es,
  chemistryExperiments: chemistryExperiments.es,
  chemistryTools: chemistryTools.es,
  chemistryAssistant: chemistryAssistant.es,
  biology: biology.es,
} as const
