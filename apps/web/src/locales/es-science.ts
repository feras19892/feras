import { chemistryEs } from './chemistry-es'
import { chemistryReport } from './chemistry-report'
import { chemistryAnalysis } from './chemistry-analysis'
import { chemistryShelf } from './chemistry-shelf'
import { chemistryLab } from './chemistry-lab'
import { chemistryExperimentsEs } from './chemistry-experiments-es'
import { chemistryTools } from './chemistry-tools'
import { chemistryAssistant } from './chemistry-assistant'
import { biologyEs } from './biology-es_a'
import { biologyEs_b } from './biology-es_b'
import { biologyEs_c } from './biology-es_c'
import { math } from './math'
import { lens } from './lens'
import { report } from './report'
import { ew } from './electricWorkshop'

export default {
  chemistry: chemistryEs,
  chemistryReport: chemistryReport.es,
  chemistryAnalysis: chemistryAnalysis.es,
  chemistryShelf: chemistryShelf.es,
  chemistryLab: chemistryLab.es,
  chemistryExperiments: chemistryExperimentsEs,
  chemistryTools: chemistryTools.es,
  chemistryAssistant: chemistryAssistant.es,
  biology: { ...biologyEs, ...biologyEs_b, anatomy: { ...(biologyEs as Record<string, unknown>).anatomy as Record<string, unknown>, ...(biologyEs_b as Record<string, unknown>).anatomy as Record<string, unknown>, ...biologyEs_c } },
  math: math.es,
  lens: lens.es,
  report: report.es,
  ew: ew.es,
} as const
