import { ref, type Ref } from 'vue';

/** جزء تشريحي/خلوي استكشفه الطالب أثناء التجربة. */
export interface ExploredPart {
  id: string;
  label: string;
  /** وقت آخر استكشاف (يُحافَظ عليه للتوافق مع التقارير الحالية) */
  examinedAt: string;
  /** وقت أول استكشاف */
  firstAt: string;
  /** عدد مرات العودة */
  visits: number;
  /** ترتيب الاستكشاف (1 = أولاً) */
  sequence: number;
}

/** واجهة تتبّع الاستكشاف — تُمرَّر إلى BiologyReportButton لتغذية التقرير. */
export interface BiologyTracking {
  exploredParts: Ref<ExploredPart[]>;
  toolsUsed: Ref<string[]>;
  stagesVisited: Ref<string[]>;
  trackPart: (id: string, label: string) => void;
  trackTool: (name: string) => void;
  trackStage: (id: string) => void;
  getDurationSeconds: () => number;
}

/**
 * يتتبّع ما فعله الطالب داخل تجربة الأحياء (الأجزاء، الأدوات، المراحل، المدة)
 * ليصل التقرير إلى المدرس ببيانات حقيقية بدلاً من readings فارغة.
 */
export function useBiologyTracking(): BiologyTracking {
  const startedAt = Date.now();
  const exploredParts = ref<ExploredPart[]>([]);
  const toolsUsed = ref<string[]>([]);
  const stagesVisited = ref<string[]>([]);
  let sequenceCounter = 0;

  function trackPart(id: string, label: string): void {
    if (!id) return;
    const now = new Date().toISOString();
    const existing = exploredParts.value.find((p) => p.id === id);
    if (existing) {
      existing.visits += 1;
      existing.examinedAt = now;
      return;
    }
    sequenceCounter += 1;
    exploredParts.value.push({ id, label, examinedAt: now, firstAt: now, visits: 1, sequence: sequenceCounter });
  }

  function trackTool(name: string): void {
    if (name && !toolsUsed.value.includes(name)) toolsUsed.value.push(name);
  }

  function trackStage(id: string): void {
    if (id && !stagesVisited.value.includes(id)) stagesVisited.value.push(id);
  }

  function getDurationSeconds(): number {
    return Math.max(1, Math.round((Date.now() - startedAt) / 1000));
  }

  return { exploredParts, toolsUsed, stagesVisited, trackPart, trackTool, trackStage, getDurationSeconds };
}
