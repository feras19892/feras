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
  experiments: experiments.ar,
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
  prism: {
    ...experiments.ar,
    title: 'تحلل الضوء بالمنشور',
    emptyResults: 'سجل قراءتين على الأقل لعرض النتائج',
    dragLaserSource: '⊹ اسحب مصدر الليزر ↕ لتغيير θ₁',
    dragA: 'اسحب A لتغيير زاوية المنشور',
    dragPrism: '✥ اسحب المنشور لتحريكه على الشاشة',
    selectTool: 'تحديد (افتراضي)',
    moveMode: 'وضع النقل',
    normalLines: 'خطوط عمودية',
    showSpectrum: 'إظهار الطيف',
    angleArcs: 'أقواس الزوايا',
    virtualScreen: 'شاشة افتراضية',
    grid: 'شبكة',
    resetView: 'إعادة ضبط العرض',
  },
} as const
