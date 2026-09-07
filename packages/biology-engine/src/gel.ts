/** أدوات محاكاة الرحلان الكهربائي للجل. */

/** يحسب موضع شريط DNA في الجل بناءً على حجم القطعة (bp). */
export function gelBandPosition(bp: number, minBp = 100, maxBp = 5000): number {
  const logBp = Math.log10(bp);
  const minLog = Math.log10(minBp);
  const maxLog = Math.log10(maxBp);
  // القطع الصغيرة تهاجر أبعد (نسبة مئوية من أعلى الجل)
  return 100 - ((logBp - minLog) / (maxLog - minLog)) * 85;
}

/** يحسب سرعة الهجرة بناءً على الجهد الكهربائي. */
export function gelMigrationSpeed(voltage: number): number {
  // سرعة نسبية — جهد أعلى = هجرة أسرع
  return voltage / 100;
}

/** يقدّر الزمن اللازم لفصل العينات (بالدقائق). */
export function gelEstimatedRunTime(voltage: number, maxFragmentBp: number): number {
  const speed = gelMigrationSpeed(voltage);
  const distance = gelBandPosition(maxFragmentBp);
  return Math.ceil((distance / 100) * 45 / speed);
}
