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
  chemistry: chemistry.en,
  chemistryReport: chemistryReport.en,
  chemistryAnalysis: chemistryAnalysis.en,
  chemistryShelf: chemistryShelf.en,
  chemistryLab: chemistryLab.en,
  chemistryExperiments: chemistryExperiments.en,
  chemistryTools: chemistryTools.en,
  chemistryAssistant: chemistryAssistant.en,
  prism: {
    ...experiments.en,
    title: 'Light Dispersion by Prism',
    emptyResults: 'Record at least 2 trials to see results',
    dragLaserSource: '⊹ Drag the laser source ↕ to change θ₁',
    dragA: 'Drag A to change prism angle',
    dragPrism: '✥ Drag the prism to move it on screen',
    selectTool: 'Select (default)',
    moveMode: 'Move mode',
    normalLines: 'Normal Lines',
    showSpectrum: 'Show Spectrum',
    angleArcs: 'Angle Arcs',
    virtualScreen: 'Virtual Screen',
    grid: 'Grid',
    resetView: 'Reset view',
  },
} as const
