<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/composables/useI18n';
import ReportQuestionsSection from '@/components/teacher/ReportQuestionsSection.vue';
import type { Report } from '@/services/report.service';

const { t, locale } = useI18n();

const props = defineProps<{
  report: Report;
  /** وضع المدرس — يفعّل تصحيح الإجابات القصيرة يدوياً */
  editable?: boolean;
}>();

interface BiologyReading {
  trial?: number;
  part_id?: string;
  part_name?: string;
  examined_at?: string;
  first_at?: string;
  visits?: number;
  sequence?: number;
}

const readings = computed<BiologyReading[]>(() => {
  try {
    const data = JSON.parse(props.report.readings ?? '[]') as unknown[];
    if (!Array.isArray(data)) return [];
    return data.filter(
      (r): r is BiologyReading => !!r && typeof r === 'object' && typeof (r as BiologyReading).part_name === 'string'
    );
  } catch {
    return [];
  }
});

const params = computed<Record<string, unknown>>(() => {
  try {
    const p = JSON.parse(props.report.params ?? '{}');
    return p && typeof p === 'object' ? p : {};
  } catch {
    return {};
  }
});

const toolsUsed = computed<string[]>(
  () => (Array.isArray(params.value.tools_used) ? (params.value.tools_used as string[]) : [])
);

const stagesCompleted = computed<string[]>(
  () => (Array.isArray(params.value.stages_completed) ? (params.value.stages_completed as string[]) : [])
);

const durationLabel = computed<string | null>(() => {
  const s = params.value.exploration_duration_seconds;
  if (typeof s !== 'number' || s <= 0) return null;
  if (s < 60) return t('biology.report.durationSeconds', { s });
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest ? t('biology.report.durationMinutes', { m, rest }) : t('biology.report.durationMinute', { m });
});

const TOOL_KEYS: Record<string, string> = {
  'x-ray': 'biology.report.tools.x-ray',
  'cross-section': 'biology.report.tools.cross-section',
  heartbeat: 'biology.report.tools.heartbeat',
  'blood-flow': 'biology.report.tools.blood-flow',
  'inside-view': 'biology.report.tools.inside-view',
  explode: 'biology.report.tools.explode',
  punnett: 'biology.report.tools.punnett',
  simulation: 'biology.report.tools.simulation',
};

function toolLabel(tool: string): string {
  const key = TOOL_KEYS[tool];
  return key ? t(key) : tool;
}

/** يحاول ترجمة معرّف المرحلة عبر مفاتيح الترجمة، ويعيد المعرّف كما هو عند الفشل */
function stageLabel(stageId: string): string {
  // محاولة ترجمة عبر مفتاح مباشر
  const key = `biology.report.stages.${stageId}`;
  const translated = t(key);
  // إذا كان النص المعاد هو نفس المفتاح، فالترجمة غير موجودة
  return translated === key ? stageId : translated;
}

function formatTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString(locale.value);
}
</script>

<template>
  <!-- 🔬 عرض بيانات استكشاف التجارب العلمية (أحياء) بصورة بشرية للمدرس -->
  <div class="bio-section">
    <h4>{{ t('biology.report.explorationTitle') }}</h4>

    <div v-if="readings.length" class="bio-block">
      <div class="bio-label">{{ t('biology.report.partsExplored', { count: readings.length }) }}</div>
      <table class="bio-table">
        <thead>
          <tr>
            <th>{{ t('biology.report.number') }}</th>
            <th>{{ t('biology.report.name') }}</th>
            <th>{{ t('biology.report.firstAt') }}</th>
            <th>{{ t('biology.report.lastAt') }}</th>
            <th>{{ t('biology.report.visits') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in readings" :key="`${r.part_id ?? 'unknown'}-${r.sequence ?? i}`">
            <td>{{ r.sequence ?? i + 1 }}</td>
            <td class="bio-name">{{ r.part_name }}</td>
            <td class="bio-time">{{ formatTime(r.first_at) }}</td>
            <td class="bio-time">{{ formatTime(r.examined_at) }}</td>
            <td class="bio-time">{{ r.visits ?? 1 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="bio-empty">{{ t('biology.report.noParts') }}</div>

    <div v-if="toolsUsed.length" class="bio-block">
      <div class="bio-label">{{ t('biology.report.toolsUsed') }}</div>
      <div class="bio-chips">
        <span v-for="tool in toolsUsed" :key="tool" class="bio-chip">{{ toolLabel(tool) }}</span>
      </div>
    </div>

    <div v-if="stagesCompleted.length" class="bio-block">
      <div class="bio-label">{{ t('biology.report.stagesCompleted', { count: stagesCompleted.length }) }}</div>
      <ol class="bio-stages">
        <li v-for="s in stagesCompleted" :key="s">{{ stageLabel(s) }}</li>
      </ol>
    </div>

    <div v-if="durationLabel" class="bio-block">
      <div class="bio-label">{{ t('biology.report.duration') }}</div>
      <div class="bio-duration">⏱️ {{ durationLabel }}</div>
    </div>

    <div v-if="report.chart_snapshot" class="bio-block">
      <div class="bio-label">{{ t('biology.report.snapshot') }}</div>
      <img :src="report.chart_snapshot" :alt="t('biology.report.snapshotAlt')" class="bio-img" />
    </div>

    <ReportQuestionsSection
      :report-id="report.id"
      :score="report.question_score"
      :max-score="report.question_max_score"
      :editable="editable"
    />
  </div>
</template>

<style scoped>
.bio-section {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(22, 163, 74, 0.06);
  border: 1px solid rgba(22, 163, 74, 0.25);
}
.bio-section h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #4ade80;
}
.bio-block { margin-bottom: 12px; }
.bio-block:last-child { margin-bottom: 0; }
.bio-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 6px;
}
.bio-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.bio-table th {
  padding: 5px 8px;
  text-align: right;
  background: rgba(30, 41, 59, 0.6);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.bio-table td {
  padding: 5px 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}
.bio-table tbody tr:nth-child(even) { background: rgba(255, 255, 255, 0.02); }
.bio-name { font-weight: 600; color: #4ade80; }
.bio-time { color: #94a3b8; }
.bio-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.bio-chip {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(74, 222, 128, 0.12);
  border: 1px solid rgba(74, 222, 128, 0.35);
  color: #4ade80;
}
.bio-stages {
  margin: 0;
  padding-inline-start: 18px;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.7;
}
.bio-duration { font-size: 13px; color: #e2e8f0; font-weight: 600; }
.bio-img {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.bio-empty { font-size: 12px; color: #64748b; }
</style>
