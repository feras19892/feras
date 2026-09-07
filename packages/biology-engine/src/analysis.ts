import type { BiologyTrackingState, ReportAnalysis, AnalysisConfig } from './types.js';

/** يحلل تقرير تجربة أحياء ويستخرج مؤشرات تعلّم. */
export function analyzeReport(
  state: BiologyTrackingState,
  config: AnalysisConfig,
): ReportAnalysis {
  const totalPartsExplored = state.exploredParts.length;
  const totalToolsUsed = state.toolsUsed.length;
  const totalStagesVisited = state.stagesVisited.length;
  const durationMs = state.durationMs;

  const partsRatio = config.expectedPartsCount > 0
    ? Math.min(1, totalPartsExplored / config.expectedPartsCount)
    : 0;
  const stagesRatio = config.expectedStagesCount > 0
    ? Math.min(1, totalStagesVisited / config.expectedStagesCount)
    : 0;
  const durationRatio = config.expectedDurationMs > 0
    ? Math.min(1, durationMs / config.expectedDurationMs)
    : 0;

  const completionRatio = (partsRatio + stagesRatio) / 2;
  const engagementScore = Math.round(
    ((completionRatio * 0.5) + (durationRatio * 0.3) + (Math.min(1, totalToolsUsed / 3) * 0.2)) * 100,
  );

  const insights: string[] = [];
  if (partsRatio < 0.5) {
    insights.push('low_parts_exploration');
  }
  if (stagesRatio < 0.5) {
    insights.push('low_stages_visited');
  }
  if (durationRatio < 0.3) {
    insights.push('short_session');
  }
  if (totalToolsUsed === 0) {
    insights.push('no_tools_used');
  }
  if (completionRatio >= 1 && durationRatio >= 0.5) {
    insights.push('thorough_exploration');
  }
  if (state.exploredParts.some((p) => p.visits > 2)) {
    insights.push('revisited_parts');
  }

  return {
    experimentId: '',
    totalPartsExplored,
    totalToolsUsed,
    totalStagesVisited,
    durationMs,
    completionRatio,
    engagementScore,
    insights,
  };
}

/** يصنّف مستوى التعلّم بناءً على درجة التفاعل. */
export function classifyEngagement(score: number): 'low' | 'medium' | 'high' {
  if (score < 40) return 'low';
  if (score < 70) return 'medium';
  return 'high';
}
