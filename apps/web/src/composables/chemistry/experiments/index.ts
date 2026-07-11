// ================== EXPERIMENTS MODULE ==================
// Import this file once (e.g. in ChemistryLanding) to register all experiments.
// To add a new experiment: create a file in definitions/ and import it here.

import './definitions/neutralization-hcl-naoh';
import './definitions/neutralization-ch3cooh-naoh';
import './definitions/precipitation-cuso4-naoh';

// Re-export public API
export type {
  ExperimentDefinition,
  ExperimentCategory,
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
} from './types';

export {
  registerExperiment,
  getExperiment,
  listExperiments,
  listByCategory,
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
