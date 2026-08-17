import { chemistryAr } from './chemistry-ar'
import { chemistryReport } from './chemistry-report'
import { chemistryAnalysis } from './chemistry-analysis'
import { chemistryShelf } from './chemistry-shelf'
import { chemistryLab } from './chemistry-lab'
import { chemistryExperimentsAr } from './chemistry-experiments-ar'
import { chemistryTools } from './chemistry-tools'
import { chemistryAssistant } from './chemistry-assistant'
import { biologyAr } from './biology-ar_a'
import { biologyAr_b } from './biology-ar_b'
import { biologyAr_c } from './biology-ar_c'
import { math } from './math'
import { lens } from './lens'
import { report } from './report'
import { ew } from './electricWorkshop'

export default {
  chemistry: chemistryAr,
  chemistryReport: chemistryReport.ar,
  chemistryAnalysis: chemistryAnalysis.ar,
  chemistryShelf: chemistryShelf.ar,
  chemistryLab: chemistryLab.ar,
  chemistryExperiments: chemistryExperimentsAr,
  chemistryTools: chemistryTools.ar,
  chemistryAssistant: chemistryAssistant.ar,
  biology: { ...biologyAr, ...biologyAr_b, anatomy: { ...(biologyAr as Record<string, unknown>).anatomy as Record<string, unknown>, ...(biologyAr_b as Record<string, unknown>).anatomy as Record<string, unknown>, ...biologyAr_c } },
  math: math.ar,
  lens: lens.ar,
  report: report.ar,
  ew: ew.ar,
} as const
