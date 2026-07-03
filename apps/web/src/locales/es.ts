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
  chemistry: chemistry.es,
  chemistryReport: chemistryReport.es,
  chemistryAnalysis: chemistryAnalysis.es,
  chemistryShelf: chemistryShelf.es,
  chemistryLab: chemistryLab.es,
  chemistryExperiments: chemistryExperiments.es,
  chemistryTools: chemistryTools.es,
  chemistryAssistant: chemistryAssistant.es,
  prism: {
    ...experiments.es,
    title: 'Dispersión de Luz por Prisma',
    emptyResults: 'Registra al menos 2 lecturas para ver resultados',
    dragLaserSource: '⊹ Arrastra la fuente láser ↕ para cambiar θ₁',
    dragA: 'Arrastra A para cambiar el ángulo del prisma',
    dragPrism: '✥ Arrastra el prisma para moverlo en la pantalla',
    selectTool: 'Seleccionar (predeterminado)',
    moveMode: 'Modo mover',
    normalLines: 'Líneas Normales',
    showSpectrum: 'Mostrar Espectro',
    angleArcs: 'Arcos de Ángulo',
    virtualScreen: 'Pantalla Virtual',
    grid: 'Cuadrícula',
    resetView: 'Restablecer vista',
  },
} as const
