<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { useAuthStore } from '../../../modules/auth/stores/auth';
import SubmitReportModal from '../../../components/experiment/SubmitReportModal.vue';
import type { BiologyTracking } from '../../../composables/biology/useBiologyTracking';

const { t } = useI18n();

const props = defineProps<{
  experimentId?: string;
  experimentName: string;
  experimentType?: string;
  /** تتبّع استكشاف الطالب — يغذّي readings/params في التقرير */
  tracking?: BiologyTracking | null;
  /** التقاط لقطة شاشة من الـ canvas لحظة فتح نافذة التقرير */
  getScreenshot?: () => string | null | Promise<string | null>;
}>();

const auth = useAuthStore();
const reportOpen = ref(false);
const capturing = ref(false);

// تُلتقط اللقطة قبل الفتح (قبل أن يغطي overlay النافذة الـ canvas)
const chartSnapshot = ref<string | undefined>(undefined);
async function openReport(): Promise<void> {
  if (!auth.isStudent || capturing.value) return;
  capturing.value = true;
  try {
    if (props.getScreenshot) {
      const data = await props.getScreenshot();
      chartSnapshot.value = data ?? undefined;
    }
  } catch (err) {
    console.error('[BiologyReportButton] screenshot failed:', err);
    chartSnapshot.value = undefined;
  } finally {
    capturing.value = false;
    reportOpen.value = true;
  }
}

// الأجزاء التي استكشفها الطالب تُرسل كصفوف readings حقيقية
const readingsJson = computed(() => {
  const parts = props.tracking?.exploredParts.value ?? [];
  return JSON.stringify(parts.map((p, i) => ({
    trial: i + 1,
    part_id: p.id,
    part_name: p.label,
    examined_at: p.examinedAt,
    first_at: p.firstAt,
    visits: p.visits,
    sequence: p.sequence,
  })));
});

// الأدوات المستخدمة والمراحل المكتملة ومدة الاستكشاف تُرسل ضمن params
const paramsJson = computed(() => {
  const tracking = props.tracking;
  return JSON.stringify({
    tools_used: tracking ? [...tracking.toolsUsed.value] : [],
    stages_completed: tracking ? [...tracking.stagesVisited.value] : [],
    exploration_duration_seconds: tracking ? tracking.getDurationSeconds() : undefined,
  });
});
</script>

<template>
  <button
    v-if="experimentId"
    class="header-action"
    :disabled="!auth.isStudent || capturing"
    @click="openReport"
    :title="auth.isStudent ? t('biology.sendReport') : t('biology.sendReportStudentOnly')"
  >
    📋 {{ t('biology.sendReport') }}
  </button>
  <SubmitReportModal
    v-if="experimentId"
    v-model:show="reportOpen"
    :experiment-type="experimentType ?? 'biology'"
    :experiment-id="experimentId"
    :experiment-name="experimentName"
    :readings="readingsJson"
    :params="paramsJson"
    :chart-snapshot="chartSnapshot"
  />
</template>
