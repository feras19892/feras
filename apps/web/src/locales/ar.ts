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
import { math } from './math'
import { lens } from './lens'
import { report } from './report'
import { ew } from './electricWorkshop'
import { legal, privacy, terms } from './legal'
import { account } from './account'
import { school } from './school'

export default {
  auth: auth.ar,
  ew: ew.ar,
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
  biology: biology.ar,
  math: math.ar,
  lens: lens.ar,
  report: report.ar,
  legal: legal.ar,
  privacy: privacy.ar,
  terms: terms.ar,
  account: account.ar,
  school: school.ar,
} as const
