// ================== EXPERIMENT TYPES ==================
// Declarative experiment definition system.
// Each experiment is a data object + rules, not hardcoded functions.

export type ExperimentCategory =
  | 'titration'
  | 'precipitation'
  | 'gas'
  | 'redox'
  | 'complex'
  | 'heating'
  | 'custom';

// ---- Steps ----

export interface StepDef {
  id: number;
  textKey: string;
  rules: StepRule[];
}

// ---- Declarative validation rules ----

export type StepRule =
  | { type: 'hasTool'; toolId: string }
  | { type: 'hasAnyTool'; toolPrefix: string }
  | { type: 'hasChemicalIn'; chemicalId: string; container: 'burette' | 'any' | 'reactionVessel' }
  | { type: 'hasPipetteWith'; chemicalId: string }
  | { type: 'valveOpen'; chemicalId: string }
  | { type: 'buretteDispensed'; chemicalId: string }
  | { type: 'indicatorPresent'; indicator: string; container: 'any' | 'reactionVessel' }
  | { type: 'pHCondition'; op: '>' | '<' | '>=' | '<='; value: number; container: 'any' | 'reactionVessel'; indicator?: string }
  | { type: 'consumedAbove'; minMl: number }
  | { type: 'stoichiometricCompletion'; analyteId: string; titrantId: string; ratio: number; threshold: number }
  | { type: 'temperatureAbove'; value: number; container: 'any' | 'reactionVessel' }
  | { type: 'precipitateFormed'; container: 'any' | 'reactionVessel' }
  | { type: 'gasEvolved'; container: 'any' | 'reactionVessel' }
  | { type: 'colorChanged'; container: 'any' | 'reactionVessel' }
  | { type: 'all'; rules: StepRule[] }
  | { type: 'any'; rules: StepRule[] };

// ---- Theory ----

export interface ExperimentTheory {
  titleKey: string;
  sections: { headingKey: string; contentKey: string }[];
}

// ---- Report templates ----

export type ReportType = 'titration' | 'precipitation' | 'gas' | 'generic';

export interface ReportField {
  key: string;
  labelKey: string;
  source: 'consumedVolume' | 'acidVolume' | 'baseMolarity' | 'calculatedAcidMolarity'
    | 'phAtEquivalence' | 'colorAtEquivalence' | 'readingsCount'
    | 'precipitateColor' | 'gasType' | 'temperatureMax' | 'custom';
  customFn?: (ctx: ReportContext) => string | number | null;
}

export interface ReportTemplate {
  type: ReportType;
  fields: ReportField[];
  // For titration: acid volume and base molarity (can be overridden per experiment)
  defaults?: {
    acidVolume?: number;
    baseMolarity?: number;
  };
}

export interface ReportContext {
  consumedVolume: number;
  acidVolume: number;
  baseMolarity: number;
  phAtEquivalence: number | null;
  colorAtEquivalence: string;
  readingsCount: number;
  precipitateColor: string | null;
  gasType: string | null;
  temperatureMax: number;
}

// ---- Setup hints (optional: suggest tools/chemicals when experiment starts) ----

export interface SetupHint {
  kind: 'tool' | 'chemical';
  toolId?: string;
  chemicalId?: string;
  labelKey: string;
}

// ---- Full experiment definition ----

export interface ExperimentDefinition {
  id: string;
  category: ExperimentCategory;
  nameKey: string;
  descKey: string;
  icon: string;
  steps: StepDef[];
  theory?: ExperimentTheory;
  reportTemplate: ReportTemplate;
  setupHints?: SetupHint[];
}

// ---- Runtime types (used by UI) ----

export interface ExperimentStep {
  id: number;
  textKey: string;
}

export interface TitrationReading {
  n: number;
  volume: number;
  ph: number | null;
  color: string;
}
