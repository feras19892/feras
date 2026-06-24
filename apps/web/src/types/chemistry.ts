/* ─── Analysis & Calculation for Chemistry ─── */

export interface ChemAnalysisColumnMeta {
  key: string;
  label: string;
  unit?: string;
}

export interface ChemAnalysisVariable {
  symbol: string;
  label: string;
  value?: number;
}

export interface ChemAnalysisEquation {
  name: string;
  formula: string;
  variables: ChemAnalysisVariable[];
  solveFor: string[];
}

export interface ChemAnalysisPlotConfig {
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  type: 'scatter' | 'line';
}

export interface ChemAnalysisPayload {
  sourceExperiment: string;
  sourceNameAr: string;
  readings: Record<string, string | number>[];
  columns: ChemAnalysisColumnMeta[];
  equations: ChemAnalysisEquation[];
  suggestedPlots: ChemAnalysisPlotConfig[];
  mediumType?: string;
  calculatedResult?: number;
  expectedResult?: number;
}

export interface ChemStudentInfo {
  name: string;
  email: string;
  grade: string;
  notes: string;
}
