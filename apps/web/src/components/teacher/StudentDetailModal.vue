<script setup lang="ts">
import { ref, watch } from 'vue';
import { getReports, getStudentStats } from '../../services/report.service';
import type { Report } from '../../services/report.service';
import type { ClassStudent } from '../../services/class.service';
import { useI18n } from '../../composables/useI18n';

const props = defineProps<{
  show: boolean;
  student: ClassStudent | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();

const reports = ref<Report[]>([]);
const stats = ref({ total: 0, graded: 0, pending: 0, average: 0 });
const loading = ref(false);

watch(() => props.show, async (val) => {
  if (val && props.student) {
    loading.value = true;
    try {
      const [rRes, sRes] = await Promise.all([
        getReports({ student_id: String(props.student.id) }),
        getStudentStats(props.student.id),
      ]);
      if (rRes.success) reports.value = rRes.reports;
      if (sRes.success) stats.value = sRes.stats;
    } catch (err) {
      console.error('load student detail failed:', err);
    }
    loading.value = false;
  }
});

function statusLabel(s: string) {
  if (s === 'graded') return t('teacher.statusGraded');
  if (s === 'submitted') return t('teacher.statusSubmitted');
  if (s === 'resubmitted') return t('teacher.statusResubmitted');
  return t('teacher.statusDraft');
}
</script>

<template>
  <div v-if="show && student" class="modal-overlay" @click.self="emit('close')">
    <div class="detail-modal">
      <div class="student-header">
        <span class="avatar">🎓</span>
        <div>
          <h3>{{ student.name }}</h3>
          <p class="email">{{ student.email }}</p>
          <p class="joined">{{ t('teacher.joined') }}: {{ student.joined_at?.slice(0, 10) }}</p>
        </div>
      </div>

      <div class="stats-bar">
        <div class="stat">
          <span class="val">{{ stats.total }}</span>
          <span class="lab">{{ t('teacher.reportsLabel') }}</span>
        </div>
        <div class="stat">
          <span class="val">{{ stats.graded }}</span>
          <span class="lab">{{ t('teacher.graded') }}</span>
        </div>
        <div class="stat">
          <span class="val">{{ stats.pending }}</span>
          <span class="lab">{{ t('teacher.pendingStat') }}</span>
        </div>
        <div class="stat highlight">
          <span class="val">{{ stats.average }}%</span>
          <span class="lab">{{ t('teacher.avgStat') }}</span>
        </div>
      </div>

      <div class="reports-section">
        <h4>{{ t('teacher.studentReportsTitle') }}</h4>
        <div v-if="loading" class="empty">...</div>
        <div v-else-if="reports.length === 0" class="empty">{{ t('teacher.noStudentReports') }}</div>
        <div v-else class="list">
          <div v-for="r in reports" :key="r.id" class="row">
            <span class="name">{{ r.experiment_name }}</span>
            <span class="status">{{ statusLabel(r.status) }}</span>
            <span v-if="r.grade !== undefined" class="grade">{{ r.grade }}/100</span>
            <span class="date">{{ r.submitted_at?.slice(0, 10) }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-close" @click="emit('close')">{{ t('teacher.closeBtn') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.detail-modal { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
.student-header { display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
.student-header h3 { margin: 0; font-size: 1.1rem; color: #f1f5f9; }
.email { margin: 0.15rem 0 0; font-size: 0.8rem; color: #94a3b8; }
.joined { margin: 0.15rem 0 0; font-size: 0.75rem; color: #64748b; }
.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem; }
.stat { text-align: center; padding: 0.5rem; border-radius: 0.4rem; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); }
.stat.highlight { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.12); }
.val { display: block; font-size: 1.2rem; font-weight: 800; color: #67e8f9; }
.stat.highlight .val { color: #a5b4fc; }
.lab { font-size: 0.7rem; color: #94a3b8; }
.reports-section h4 { margin: 0 0 0.5rem; font-size: 0.9rem; color: #e2e8f0; }
.empty { text-align: center; padding: 1rem; color: #64748b; font-size: 0.8rem; }
.list { display: flex; flex-direction: column; gap: 0.35rem; }
.row { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.7rem; border-radius: 0.35rem; background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.05); font-size: 0.8rem; }
.name { flex: 1; font-weight: 600; color: #f1f5f9; }
.status { color: #94a3b8; font-size: 0.75rem; }
.grade { color: #67e8f9; font-weight: 700; font-family: monospace; }
.date { color: #475569; margin-right: auto; font-size: 0.75rem; }
.actions { display: flex; justify-content: center; margin-top: 0.5rem; }
.btn-close { padding: 0.55rem 1.5rem; border-radius: 0.55rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
</style>
