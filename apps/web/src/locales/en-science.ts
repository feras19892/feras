import { chemistryEn } from './chemistry-en'
import { chemistryReport } from './chemistry-report'
import { chemistryAnalysis } from './chemistry-analysis'
import { chemistryShelf } from './chemistry-shelf'
import { chemistryLab } from './chemistry-lab'
import { chemistryExperimentsEn } from './chemistry-experiments-en'
import { chemistryTools } from './chemistry-tools'
import { chemistryAssistant } from './chemistry-assistant'
import { biologyEn } from './biology-en_a'
import { biologyEn_b } from './biology-en_b'
import { biologyEn_c } from './biology-en_c'
import { math } from './math'
import { lens } from './lens'
import { report } from './report'
import { ew } from './electricWorkshop'

export default {
  chemistry: chemistryEn,
  chemistryReport: chemistryReport.en,
  chemistryAnalysis: chemistryAnalysis.en,
  chemistryShelf: chemistryShelf.en,
  chemistryLab: chemistryLab.en,
  chemistryExperiments: chemistryExperimentsEn,
  chemistryTools: chemistryTools.en,
  chemistryAssistant: chemistryAssistant.en,
  biology: { ...biologyEn, ...biologyEn_b, anatomy: { ...(biologyEn as Record<string, unknown>).anatomy as Record<string, unknown>, ...(biologyEn_b as Record<string, unknown>).anatomy as Record<string, unknown>, ...biologyEn_c } },
  math: math.en,
  lens: lens.en,
  report: report.en,
  ew: ew.en,
} as const
