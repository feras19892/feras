/** أدوات محاكاة PCR. */

/** يحسب عدد نسخ DNA بعد عدد دورات. */
export function pcrCopiesAfterCycles(cycles: number): number {
  return Math.pow(2, cycles);
}

/** يحسب الحرارة المثلى لكل مرحلة PCR. */
export function pcrStageTemperature(stage: 'denaturation' | 'annealing' | 'extension'): number {
  switch (stage) {
    case 'denaturation': return 95;
    case 'annealing': return 55;
    case 'extension': return 72;
  }
}

/** يحسب الزمن التقديري لكل مرحلة (بالثواني). */
export function pcrStageDuration(stage: 'denaturation' | 'annealing' | 'extension'): number {
  switch (stage) {
    case 'denaturation': return 30;
    case 'annealing': return 20;
    case 'extension': return 60;
  }
}
