<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import { computed, ref, onMounted } from 'vue';
import { analyzeReport, classifyEngagement } from '@my-modern-app/biology-engine';
import type { ReportAnalysis, BiologyTrackingState } from '@my-modern-app/biology-engine';
import { fetchJson } from '@/services/http';
import type { Report } from '@/services/report.service';

const { t } = useI18n();

const reports = ref<Report[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedExperiment = ref<string>('all');

const BIOLOGY_EXPERIMENT_IDS = [
  'biology-photosynthesis',
  'biology-plant-structure',
  'biology-transpiration',
  'biology-flower-reproduction',
  'biology-bacteria',
  'biology-virus',
  'biology-fungi',
  'biology-blood-cells',
  'biology-punnett-square',
  'biology-mitosis',
  'biology-meiosis',
  'biology-dna-replication',
  'biology-animal-cell',
  'biology-pcr',
  'biology-crispr',
  'biology-gel-electrophoresis',
  'biology-eye',
  'biology-heart',
  'biology-lungs',
  'biology-skeleton',
  'biology-digestive',
  'biology-kidney',
  'biology-plant-cell',
  'biology-dna-structure',
  'biology-protein-synthesis',
  'biology-food-chain',
  'biology-water-cycle',
  'biology-ecosystem-balance',
];

/** عتبات التحليل لكل تجربة — قيم افتراضية عند عدم وجود إعداد مخصص */
const EXPERIMENT_CONFIG: Record<string, { parts: number; stages: number; durationMs: number }> = {
  'biology-pcr': { parts: 4, stages: 3, durationMs: 3 * 60 * 1000 },
  'biology-crispr': { parts: 5, stages: 4, durationMs: 3 * 60 * 1000 },
  'biology-gel-electrophoresis': { parts: 6, stages: 1, durationMs: 3 * 60 * 1000 },
  'biology-punnett-square': { parts: 4, stages: 1, durationMs: 2 * 60 * 1000 },
  'biology-mitosis': { parts: 6, stages: 5, durationMs: 3 * 60 * 1000 },
  'biology-meiosis': { parts: 8, stages: 8, durationMs: 4 * 60 * 1000 },
  'biology-photosynthesis': { parts: 5, stages: 2, durationMs: 3 * 60 * 1000 },
  'biology-animal-cell': { parts: 9, stages: 1, durationMs: 3 * 60 * 1000 },
  'biology-plant-cell': { parts: 9, stages: 1, durationMs: 3 * 60 * 1000 },
};
const DEFAULT_CONFIG = { parts: 8, stages: 4, durationMs: 5 * 60 * 1000 };

/** يحوّل قيمة زمنية (ms epoch أو ISO-8601) إلى milliseconds — ISO strings تُرجع NaN مع Number() */
function toMs(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const parsed = Date.parse(String(v ?? ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** يحوّل readings/params من تقرير API إلى BiologyTrackingState المتوقع من المحرك */
function buildTrackingState(report: Report): BiologyTrackingState | null {
  try {
    const readings = report.readings ? JSON.parse(report.readings) : [];
    const params = report.params ? JSON.parse(report.params) : {};
    if (!Array.isArray(readings)) return null;

    const exploredParts = readings.map((r: Record<string, unknown>) => ({
      partId: String(r.part_id ?? r.partId ?? ''),
      label: String(r.part_name ?? r.label ?? ''),
      visits: Number(r.visits ?? 0),
      firstAt: toMs(r.first_at ?? r.firstAt),
      lastAt: toMs(r.examined_at ?? r.lastAt),
    }));

    const toolsUsed: string[] = Array.isArray(params.tools_used) ? params.tools_used.map(String) : [];
    const stagesVisited: string[] = Array.isArray(params.stages_completed)
      ? params.stages_completed.map(String)
      : [];
    const durationSeconds = Number(params.exploration_duration_seconds ?? 0);
    const durationMs = durationSeconds > 0 ? durationSeconds * 1000 : 0;

    return {
      exploredParts,
      toolsUsed,
      stagesVisited,
      startedAt: exploredParts.length > 0 && exploredParts[0].firstAt > 0 ? exploredParts[0].firstAt : null,
      durationMs,
      sequence: exploredParts.map((p: { partId: string }) => p.partId),
    };
  } catch {
    return null;
  }
}

async function loadReports(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    // /api/reports is paginated (default limit 50) — fetch every page so
    // aggregates aren't silently computed over a partial slice.
    const all: Report[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await fetchJson<{ success?: boolean; reports?: Report[]; totalPages?: number } & Report[]>(
        `/api/reports?page=${page}&limit=100`,
      );
      // التحقق من فشل الاستجابة (مثل 404)
      if (res.success === false) {
        error.value = t('biology.analyticsLoadError');
        reports.value = [];
        return;
      }
      all.push(...(res.reports ?? (Array.isArray(res) ? res : [])));
      totalPages = res.totalPages ?? 1;
      page++;
    } while (page <= totalPages);
    reports.value = all.filter((r) =>
      r.experiment_id?.startsWith('biology-') ||
      BIOLOGY_EXPERIMENT_IDS.includes(r.experiment_id ?? ''),
    );
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load reports';
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void loadReports(); });

const experimentOptions = computed(() => {
  const ids = new Set(reports.value.map((r) => r.experiment_id ?? '').filter(Boolean));
  return Array.from(ids).map((id) => ({ id, label: id }));
});

const filteredReports = computed(() => {
  if (selectedExperiment.value === 'all') return reports.value;
  return reports.value.filter((r) => r.experiment_id === selectedExperiment.value);
});

const analyses = computed<Array<Report & { analysis: ReportAnalysis | null }>>(() =>
  filteredReports.value.map((r) => {
    let analysis: ReportAnalysis | null = null;
    const tracking = buildTrackingState(r);
    if (tracking) {
      const cfg = EXPERIMENT_CONFIG[r.experiment_id ?? ''] ?? DEFAULT_CONFIG;
      try {
        analysis = analyzeReport(tracking, {
          expectedPartsCount: cfg.parts,
          expectedStagesCount: cfg.stages,
          expectedDurationMs: cfg.durationMs,
        });
        analysis.experimentId = r.experiment_id ?? '';
      } catch {
        analysis = null;
      }
    }
    return { ...r, analysis };
  }),
);

const summary = computed(() => {
  const total = analyses.value.length;
  const scored = analyses.value.filter((a) => a.analysis);
  const avgEngagement = scored.length
    ? Math.round(scored.reduce((s, a) => s + (a.analysis?.engagementScore ?? 0), 0) / scored.length)
    : 0;
  const highEngagement = scored.filter((a) => classifyEngagement(a.analysis?.engagementScore ?? 0) === 'high').length;
  const lowEngagement = scored.filter((a) => classifyEngagement(a.analysis?.engagementScore ?? 0) === 'low').length;
  const graded = analyses.value.filter((a) => a.grade != null);
  const avgScore = graded.length
    ? Math.round(graded.reduce((s, a) => s + (a.grade ?? 0), 0) / graded.length)
    : 0;
  return { total, scored: scored.length, avgEngagement, highEngagement, lowEngagement, avgScore };
});

const engagementDistribution = computed<{ low: number; medium: number; high: number }>(() => {
  const dist: { low: number; medium: number; high: number } = { low: 0, medium: 0, high: 0 };
  for (const a of analyses.value) {
    if (!a.analysis) continue;
    const level = classifyEngagement(a.analysis.engagementScore);
    dist[level] += 1;
  }
  return dist;
});

const experimentCounts = computed(() => {
  const counts: Record<string, { count: number; name: string }> = {};
  for (const r of reports.value) {
    const id = r.experiment_id ?? '';
    if (!id) continue;
    if (!counts[id]) counts[id] = { count: 0, name: r.experiment_name || id };
    counts[id].count += 1;
  }
  return Object.entries(counts)
    .map(([id, info]) => ({ id, count: info.count, name: info.name }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
});

const insightLabels: Record<string, string> = {
  low_parts_exploration: t('biology.insightLowParts'),
  low_stages_visited: t('biology.insightLowStages'),
  short_session: t('biology.insightShortSession'),
  no_tools_used: t('biology.insightNoTools'),
  thorough_exploration: t('biology.insightThorough'),
  revisited_parts: t('biology.insightRevisited'),
};
</script>

<template>
  <div class="bio-analytics">
    <header class="ba-header">
      <h1 class="ba-title">{{ t('biology.analyticsTitle') }}</h1>
      <p class="ba-subtitle">{{ t('biology.analyticsSubtitle') }}</p>
    </header>

    <div v-if="loading" class="ba-loading">{{ t('biology.analyticsLoading') }}</div>
    <div v-else-if="error" class="ba-error">{{ error }}</div>
    <template v-else>
      <section class="ba-summary">
        <div class="ba-stat-card">
          <div class="ba-stat-icon">📊</div>
          <div class="ba-stat-value">{{ summary.total }}</div>
          <div class="ba-stat-label">{{ t('biology.analyticsTotalReports') }}</div>
        </div>
        <div class="ba-stat-card">
          <div class="ba-stat-icon">🎯</div>
          <div class="ba-stat-value">{{ summary.avgEngagement }}</div>
          <div class="ba-stat-label">{{ t('biology.analyticsAvgEngagement') }}</div>
        </div>
        <div class="ba-stat-card">
          <div class="ba-stat-icon">⭐</div>
          <div class="ba-stat-value">{{ summary.avgScore }}</div>
          <div class="ba-stat-label">{{ t('biology.analyticsAvgScore') }}</div>
        </div>
        <div class="ba-stat-card">
          <div class="ba-stat-icon">🔥</div>
          <div class="ba-stat-value">{{ summary.highEngagement }}</div>
          <div class="ba-stat-label">{{ t('biology.analyticsHighEngagement') }}</div>
        </div>
      </section>

      <section class="ba-charts">
        <div class="ba-panel">
          <h3 class="ba-panel-title">{{ t('biology.analyticsEngagementDistribution') }}</h3>
          <div class="ba-bars">
            <div class="ba-bar-row">
              <span class="ba-bar-label">🔴 {{ t('biology.analyticsLowEngagement') }}</span>
              <div class="ba-bar-track"><div class="ba-bar-fill low" :style="{ width: (engagementDistribution.low / Math.max(1, summary.scored) * 100) + '%' }" /></div>
              <span class="ba-bar-count">{{ engagementDistribution.low }}</span>
            </div>
            <div class="ba-bar-row">
              <span class="ba-bar-label">🟡 {{ t('biology.analyticsMediumEngagement') }}</span>
              <div class="ba-bar-track"><div class="ba-bar-fill medium" :style="{ width: (engagementDistribution.medium / Math.max(1, summary.scored) * 100) + '%' }" /></div>
              <span class="ba-bar-count">{{ engagementDistribution.medium }}</span>
            </div>
            <div class="ba-bar-row">
              <span class="ba-bar-label">🟢 {{ t('biology.analyticsHighEngagement') }}</span>
              <div class="ba-bar-track"><div class="ba-bar-fill high" :style="{ width: (engagementDistribution.high / Math.max(1, summary.scored) * 100) + '%' }" /></div>
              <span class="ba-bar-count">{{ engagementDistribution.high }}</span>
            </div>
          </div>
        </div>

        <div class="ba-panel">
          <h3 class="ba-panel-title">{{ t('biology.analyticsTopExperiments') }}</h3>
          <div v-if="experimentCounts.length" class="ba-bars">
            <div v-for="e in experimentCounts" :key="e.id" class="ba-bar-row">
              <span class="ba-bar-label">{{ e.name }}</span>
              <div class="ba-bar-track"><div class="ba-bar-fill exp" :style="{ width: (e.count / Math.max(1, experimentCounts[0].count) * 100) + '%' }" /></div>
              <span class="ba-bar-count">{{ e.count }}</span>
            </div>
          </div>
          <p v-else class="ba-empty">{{ t('biology.analyticsNoData') }}</p>
        </div>
      </section>

      <section class="ba-filter">
        <label class="ba-filter-label">{{ t('biology.analyticsFilterByExperiment') }}</label>
        <select v-model="selectedExperiment" class="ba-select">
          <option value="all">{{ t('biology.analyticsAllExperiments') }}</option>
          <option v-for="opt in experimentOptions" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
        </select>
      </section>

      <section class="ba-table-section">
        <h3 class="ba-panel-title">{{ t('biology.analyticsReportDetails') }}</h3>
        <table v-if="analyses.length" class="ba-table">
          <thead>
            <tr>
              <th>{{ t('biology.analyticsStudent') }}</th>
              <th>{{ t('biology.analyticsExperiment') }}</th>
              <th>{{ t('biology.analyticsEngagement') }}</th>
              <th>{{ t('biology.analyticsParts') }}</th>
              <th>{{ t('biology.analyticsStages') }}</th>
              <th>{{ t('biology.analyticsInsights') }}</th>
              <th>{{ t('biology.analyticsScore') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in analyses" :key="r.id">
              <td>{{ r.student_name || '—' }}</td>
              <td>{{ r.experiment_name || r.experiment_id || '—' }}</td>
              <td>
                <span v-if="r.analysis" class="ba-engagement-badge" :class="classifyEngagement(r.analysis.engagementScore)">
                  {{ r.analysis.engagementScore }}
                </span>
                <span v-else>—</span>
              </td>
              <td>{{ r.analysis?.totalPartsExplored ?? '—' }}</td>
              <td>{{ r.analysis?.totalStagesVisited ?? '—' }}</td>
              <td>
                <span v-for="ins in (r.analysis?.insights ?? [])" :key="ins" class="ba-insight-tag">
                  {{ insightLabels[ins] ?? ins }}
                </span>
              </td>
              <td>{{ r.grade ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="ba-empty">{{ t('biology.analyticsNoData') }}</p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.bio-analytics { padding: 1.5rem; color: #e2e8f0; max-width: 1200px; margin: 0 auto; }
.ba-header { margin-bottom: 1.5rem; }
.ba-title { font-size: 1.75rem; margin: 0 0 0.25rem; color: #4ade80; }
.ba-subtitle { margin: 0; color: #94a3b8; font-size: 0.95rem; }
.ba-loading, .ba-error { padding: 2rem; text-align: center; color: #94a3b8; }
.ba-error { color: #ef4444; }
.ba-summary { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.ba-stat-card { background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; text-align: center; }
.ba-stat-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
.ba-stat-value { font-size: 2rem; font-weight: 700; color: #4ade80; }
.ba-stat-label { font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem; }
.ba-charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
.ba-panel { background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; }
.ba-panel-title { margin: 0 0 1rem; font-size: 1rem; color: #cbd5e1; }
.ba-bars { display: flex; flex-direction: column; gap: 0.6rem; }
.ba-bar-row { display: flex; align-items: center; gap: 0.5rem; }
.ba-bar-label { font-size: 0.8rem; color: #cbd5e1; min-width: 120px; flex-shrink: 0; }
.ba-bar-track { flex: 1; height: 18px; background: rgba(15, 23, 42, 0.6); border-radius: 9px; overflow: hidden; }
.ba-bar-fill { height: 100%; border-radius: 9px; transition: width 0.5s ease; }
.ba-bar-fill.low { background: #ef4444; }
.ba-bar-fill.medium { background: #facc15; }
.ba-bar-fill.high { background: #22c55e; }
.ba-bar-fill.exp { background: #3b82f6; }
.ba-bar-count { font-size: 0.85rem; font-weight: 700; min-width: 30px; text-align: end; }
.ba-filter { margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
.ba-filter-label { font-size: 0.85rem; color: #94a3b8; }
.ba-select { background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; color: #e2e8f0; padding: 0.4rem 0.6rem; border-radius: 0.4rem; font-size: 0.85rem; }
.ba-table-section { background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; }
.ba-table { width: 100%; border-collapse: collapse; }
.ba-table th, .ba-table td { padding: 0.6rem 0.5rem; text-align: start; border-bottom: 1px solid #334155; font-size: 0.82rem; }
.ba-table th { color: #94a3b8; font-weight: 600; }
.ba-table td { color: #e2e8f0; }
.ba-engagement-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 0.75rem; }
.ba-engagement-badge.low { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.ba-engagement-badge.medium { background: rgba(250, 204, 21, 0.2); color: #fde047; }
.ba-engagement-badge.high { background: rgba(34, 197, 94, 0.2); color: #86efac; }
.ba-insight-tag { display: inline-block; background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-inline-end: 4px; margin-bottom: 2px; }
.ba-empty { color: #94a3b8; text-align: center; padding: 1rem; }
</style>
