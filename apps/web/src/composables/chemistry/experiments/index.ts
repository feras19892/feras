// ================== EXPERIMENTS MODULE ==================
// Import this file once (e.g. in ChemistryLanding) to register all experiments.
// To add a new experiment: create a file in definitions/ and import it here.

import './definitions/neutralization-hcl-naoh';
import './definitions/neutralization-ch3cooh-naoh';
import './definitions/precipitation-cuso4-naoh';
import './definitions/middle-acid-base-identification';
import './definitions/middle-metal-acid-gas';
import './definitions/middle-carbonate-gas';
import './definitions/uni-redox-kmno4-h2o2';
import './definitions/uni-precip-pbi2';

// Re-export public API
export type {
  ExperimentDefinition,
  ExperimentCategory,
  ExperimentLevel,
  StepDef,
  StepRule,
  ExperimentTheory,
  ReportTemplate,
  ReportField,
  ReportContext,
  ReportType,
  SetupHint,
  ExperimentStep,
  TitrationReading,
  ReportData,
  ResolvedExperimentTheory,
} from './types';

export {
  registerExperiment,
  getExperiment,
  listExperiments,
  listByCategory,
  listByLevel,
  hasExperiment,
} from './registry';

export {
  validateSteps,
  validateStep,
  completedCount,
  isComplete,
} from './validators';

export {
  buildReportContext,
  generateReport,
} from './reports';
