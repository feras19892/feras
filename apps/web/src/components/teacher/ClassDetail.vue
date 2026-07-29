<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import type { ClassItem, ClassStudent } from '../../services/class.service'
import ClassReportsTab from './ClassReportsTab.vue'
import ClassStatsTab from './ClassStatsTab.vue'
import StudentDetailModal from './StudentDetailModal.vue'
import CreateAnnouncementForm from './CreateAnnouncementForm.vue'
import AnnouncementsPanel from '../shared/AnnouncementsPanel.vue'
import PlagiarismChecker from './PlagiarismChecker.vue'

interface ClassStatItem { student_count: number; total_reports: number; pending_count: number; class_average: number }

const props = defineProps<{
  cls: ClassItem
  stats: ClassStatItem | undefined
  statsLoading: boolean
  students: ClassStudent[]
  loading: boolean
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()
const activeSection = ref<'overview' | 'students' | 'reports' | 'stats' | 'announcements' | 'plagiarism'>('overview')
const selectedStudent = ref<ClassStudent | null>(null)
const detailOpen = ref(false)

function showStudentDetail(s: ClassStudent) {
  selectedStudent.value = s
  detailOpen.value = true
}
</script>

<template>
  <section class="detail-section">
    <div class="detail-card">
      <header class="detail-header">
        <div>
          <h3>{{ cls.name }}</h3>
          <p class="detail-sub">
            <span class="detail-code">{{ cls.code }}</span>
            <span v-if="stats" class="detail-summary">
              • {{ stats.student_count }} {{ t('teacher.studentsLabel') }} ·
              {{ stats.total_reports }} {{ t('teacher.reportsStat') }}
            </span>
          </p>
        </div>
        <button class="close-detail" @click="emit('close')">✕</button>
      </header>

      <div class="detail-tabs">
        <button class="tab-btn" :class="{ active: activeSection === 'overview' }" @click="activeSection = 'overview'">{{ t('teacher.tabOverview') }}</button>
        <button class="tab-btn" :class="{ active: activeSection === 'students' }" @click="activeSection = 'students'">{{ t('teacher.tabStudents') }}</button>
        <button class="tab-btn" :class="{ active: activeSection === 'reports' }" @click="activeSection = 'reports'">{{ t('teacher.tabReports') }}</button>
        <button class="tab-btn" :class="{ active: activeSection === 'stats' }" @click="activeSection = 'stats'">{{ t('teacher.tabStats') }}</button>
        <button class="tab-btn" :class="{ active: activeSection === 'announcements' }" @click="activeSection = 'announcements'">📢 إعلانات</button>
        <button class="tab-btn" :class="{ active: activeSection === 'plagiarism' }" @click="activeSection = 'plagiarism'">🔍 احتيال</button>
      </div>

      <!-- Overview -->
      <div v-if="activeSection === 'overview'">
        <div v-if="statsLoading" class="detail-empty">...</div>
        <div v-else-if="stats" class="stats-panel">
          <div class="stat-mini"><span class="val">{{ stats.student_count }}</span><span class="lab">{{ t('teacher.studentsLabel') }}</span></div>
          <div class="stat-mini"><span class="val">{{ stats.total_reports }}</span><span class="lab">{{ t('teacher.reportsStat') }}</span></div>
          <div class="stat-mini"><span class="val">{{ stats.pending_count }}</span><span class="lab">{{ t('teacher.pendingStat') }}</span></div>
          <div class="stat-mini highlight"><span class="val">{{ stats.class_average }}%</span><span class="lab">{{ t('teacher.avgStat') }}</span></div>
        </div>
        <div v-else class="detail-empty">{{ t('teacher.noStudentsRegistered') }}</div>
      </div>

      <!-- Students -->
      <div v-else-if="activeSection === 'students'">
        <div v-if="loading" class="detail-empty">...</div>
        <div v-else-if="students.length === 0" class="detail-empty">{{ t('teacher.noStudentsRegistered') }}</div>
        <div v-else class="student-list">
          <div class="student-header">
            <span>{{ t('teacher.studentCol') }}</span>
            <span>{{ t('teacher.emailCol') }}</span>
            <span>{{ t('teacher.joinDate') }}</span>
          </div>
          <div v-for="s in students" :key="s.id" class="student-row" @click="showStudentDetail(s)">
            <span class="stu-name">{{ s.name }}</span>
            <span class="stu-email">{{ s.email }}</span>
            <span class="stu-date">{{ s.joined_at?.slice(0, 10) }}</span>
          </div>
        </div>
      </div>

      <!-- Reports -->
      <div v-else-if="activeSection === 'reports'">
        <ClassReportsTab :class-id="cls.id" />
      </div>

      <!-- Stats -->
      <div v-else-if="activeSection === 'stats'">
        <ClassStatsTab :class-id="cls.id" />
      </div>

      <!-- Announcements -->
      <div v-else-if="activeSection === 'announcements'">
        <CreateAnnouncementForm :class-id="cls.id" />
        <div style="margin-top: 1rem">
          <AnnouncementsPanel />
        </div>
      </div>

      <!-- Plagiarism -->
      <div v-else-if="activeSection === 'plagiarism'">
        <PlagiarismChecker :class-id="cls.id" />
      </div>
    </div>

    <StudentDetailModal :show="detailOpen" :student="selectedStudent" @close="detailOpen = false" />
  </section>
</template>

<style scoped>
.detail-section { margin-top: 0.2rem; }
.detail-card { border-radius: 0.9rem; background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.98)); border: 1px solid rgba(148, 163, 184, 0.3); padding: 1.3rem 1.4rem; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.9); }
.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem; }
.detail-header h3 { margin: 0; font-size: 1.2rem; font-weight: 800; color: #e5e7eb; }
.detail-sub { margin: 0.15rem 0 0; font-size: 0.8rem; color: #9ca3af; }
.detail-code { font-family: monospace; letter-spacing: 1px; }
.detail-summary { margin-inline-start: 0.4rem; }
.close-detail { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 1rem; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.close-detail:hover { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border-color: rgba(239, 68, 68, 0.3); }
.detail-tabs { display: flex; gap: 0.3rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 0.5rem; flex-wrap: wrap; }
.tab-btn { padding: 0.4rem 0.8rem; border: none; border-radius: 0.5rem; background: transparent; color: #94a3b8; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.tab-btn:hover { background: rgba(255, 255, 255, 0.04); color: #e5e7eb; }
.tab-btn.active { background: rgba(99, 102, 241, 0.15); color: #c7d2fe; }
.detail-empty { padding: 1rem; text-align: center; color: #64748b; font-size: 0.85rem; }
.student-list { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.5rem; }
.student-header { display: grid; grid-template-columns: 1.5fr 2fr 1fr; gap: 0.5rem; padding: 0.4rem 0.6rem; font-size: 0.75rem; color: #64748b; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05); }
.student-row { display: grid; grid-template-columns: 1.5fr 2fr 1fr; gap: 0.5rem; padding: 0.5rem 0.6rem; font-size: 0.85rem; color: #e2e8f0; border-radius: 0.35rem; transition: background 0.15s; cursor: pointer; }
.student-row:hover { background: rgba(99,102,241,0.08); }
.stu-name { font-weight: 600; color: #f1f5f9; }
.stu-email { color: #94a3b8; font-size: 0.8rem; }
.stu-date { color: #64748b; font-size: 0.8rem; }
.stats-panel { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem; margin: 0.75rem 0; padding: 0.6rem; background: rgba(0,0,0,0.2); border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.05); }
.stat-mini { text-align: center; }
.stat-mini .val { display: block; font-size: 1.1rem; font-weight: 800; color: #67e8f9; }
.stat-mini.highlight .val { color: #a5b4fc; }
.stat-mini .lab { font-size: 0.7rem; color: #94a3b8; }
</style>
