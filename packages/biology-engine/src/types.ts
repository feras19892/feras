/** أنواع مشتركة لمحرك الأحياء. */

/** نوع التتبع الجزئي المستخدم في تقارير التجارب. */
export interface PartExploration {
  partId: string;
  label: string;
  visits: number;
  firstAt: number;
  lastAt: number;
}

/** نوع التتبع الكامل لتجربة أحياء. */
export interface BiologyTrackingState {
  exploredParts: PartExploration[];
  toolsUsed: string[];
  stagesVisited: string[];
  startedAt: number | null;
  durationMs: number;
  sequence: string[];
}

/** هدف تجربة أحياء. */
export interface BiologyGoal {
  id: string;
  label: string;
  completed: boolean;
}

/** نتيجة تحليل تقرير تجربة أحياء. */
export interface ReportAnalysis {
  experimentId: string;
  totalPartsExplored: number;
  totalToolsUsed: number;
  totalStagesVisited: number;
  durationMs: number;
  completionRatio: number;
  engagementScore: number;
  insights: string[];
}

/** إعدادات تحليل التقرير. */
export interface AnalysisConfig {
  expectedPartsCount: number;
  expectedStagesCount: number;
  expectedDurationMs: number;
}
