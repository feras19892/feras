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
  auth: auth.en,
  ew: ew.en,
  landing: landing.en,
  dashboard: dashboard.en,
  admin: admin.en,
  adminUser: adminUser.en,
  teacher: teacher.en,
  settings: settings.en,
  common: common.en,
  analysis: analysis.en,
  ai: ai.en,
  chemistry: chemistry.en,
  chemistryReport: chemistryReport.en,
  chemistryAnalysis: chemistryAnalysis.en,
  chemistryShelf: chemistryShelf.en,
  chemistryLab: chemistryLab.en,
  chemistryExperiments: chemistryExperiments.en,
  chemistryTools: chemistryTools.en,
  chemistryAssistant: chemistryAssistant.en,
  biology: biology.en,
  math: math.en,
  lens: lens.en,
  report: report.en,
  legal: legal.en,
  privacy: privacy.en,
  terms: terms.en,
  account: account.en,
  school: school.en,
} as const
