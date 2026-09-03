export interface SiteInfo {
  title: string;
  language: string;
  description: string;
}

export interface HomeCard {
  id: string;
  icon: string;
  title: string;
  desc: string;
  stats: string;
  branchId: string;
}

export interface PhysicsExperiment {
  id: string;
  title: string;
  icon: string;
  description: string;
  tools: string[];
  variables: string[];
  sourcePath?: string;
}

export interface PhysicsBranch {
  id: string;
  title: string;
  description: string;
  icon: string;
  stats: string;
  sourcePath?: string;
  experiments: PhysicsExperiment[];
}

export interface ExperimentDetails extends PhysicsExperiment {
  branchId: string;
  branchTitle: string;
}

/* ─── Analysis & Calculation ─── */

export interface AnalysisColumnMeta {
  key: string;
  label: string;
  unit?: string;
}

export interface AnalysisVariable {
  symbol: string;
  label: string;
  value?: number;
}

export interface AnalysisEquation {
  name: string;
  formula: string;
  variables: AnalysisVariable[];
  solveFor: string[];
}

export interface AnalysisPlotConfig {
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  type: 'scatter' | 'line';
}

export interface AnalysisPayload {
  sourceExperiment: string;
  sourceNameAr: string;
  readings: Record<string, string | number>[];
  columns: AnalysisColumnMeta[];
  equations: AnalysisEquation[];
  suggestedPlots: AnalysisPlotConfig[];
  mediumType?: string;
  mediumN2?: number;
  calculatedN2?: number;
  expectedN2?: number;
  hasCalcTab?: boolean;
  theoretical?: { value: number; label: string; unit: string };
  equipment?: string[];
}
