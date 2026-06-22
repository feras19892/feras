<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useClassManager } from '../../composables/teacher/useClassManager'
import { getClassStats } from '../../services/class.service'
import type { ClassStudent } from '../../services/class.service'
import CreateClassModal from './CreateClassModal.vue'
import StudentDetailModal from './StudentDetailModal.vue'

const { t } = useI18n()
const { classes, expandedId, classStudents, showModal, newClassName, createClass, deleteClass, copyCode, loadClassDetails, loading } = useClassManager()

const selectedStudent = ref<ClassStudent | null>(null)
const detailOpen = ref(false)
interface ClassStatItem { student_count: number; total_reports: number; pending_count: number; class_average: number }
const classStats = ref<Record<string, ClassStatItem>>({})
const statsLoading = ref(false)

async function showStudentDetail(s: ClassStudent) {
  selectedStudent.value = s
  detailOpen.value = true
}

async function loadStats(classId: string) {
  if (classStats.value[classId]) return
  statsLoading.value = true
  try {
    const res = await getClassStats(classId)
    if (res.success) classStats.value[classId] = res.stats
  } catch (err) {
    console.error('load class stats failed:', err)
  }
  statsLoading.value = false
}

async function toggleClass(id: string) {
  await loadClassDetails(id)
  if (expandedId.value === id) {
    await loadStats(id)
  }
}
</script>

<template>
  <div class="class-manager">
    <div class="manager-header">
      <div class="header-title">
        <h2>{{ t('teacher.myClassesTitle') }}</h2>
        <span v-if="classes.length" class="class-count">{{ classes.length }} {{ t('teacher.classCount') }}</span>
      </div>
      <button class="create-btn" @click="showModal = true">
        <span>+</span>
        <span>{{ t('teacher.createClass') }}</span>
      </button>
    </div>

    <div v-if="classes.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <p>{{ t('teacher.noClassesYet') }}</p>
      <button class="create-btn alt" @click="showModal = true">{{ t('teacher.createFirstClass') }}</button>
    </div>

    <div v-else class="class-list">
      <div v-for="cls in classes" :key="cls.id" class="class-card">
        <div class="class-row" @click="toggleClass(cls.id)">
          <span class="sc-toggle">{{ expandedId === cls.id ? '▼' : '▶' }}</span>
          <span class="sc-icon">📚</span>
          <span class="sc-name">{{ cls.name }}</span>
          <span class="sc-code">{{ cls.code }}</span>
          <button class="sc-copy" @click.stop="copyCode(cls.code)">📋</button>
          <button class="sc-delete" @click.stop="deleteClass(cls.id)">🗑️</button>
        </div>
        <div v-if="expandedId === cls.id" class="class-details">
          <!-- Class Stats -->
          <div v-if="classStats[cls.id]" class="stats-panel">
            <div class="stat-mini">
              <span class="val">{{ classStats[cls.id].student_count }}</span>
              <span class="lab">{{ t('teacher.studentsLabel') }}</span>
            </div>
            <div class="stat-mini">
              <span class="val">{{ classStats[cls.id].total_reports }}</span>
              <span class="lab">{{ t('teacher.reportsStat') }}</span>
            </div>
            <div class="stat-mini">
              <span class="val">{{ classStats[cls.id].pending_count }}</span>
              <span class="lab">{{ t('teacher.pendingStat') }}</span>
            </div>
            <div class="stat-mini highlight">
              <span class="val">{{ classStats[cls.id].class_average }}%</span>
              <span class="lab">{{ t('teacher.avgStat') }}</span>
            </div>
          </div>

          <div v-if="loading" class="detail-empty">...</div>
          <div v-else-if="classStudents.length === 0" class="detail-empty">{{ t('teacher.noStudentsRegistered') }}</div>
          <div v-else class="student-list">
            <div class="student-header">
              <span>{{ t('teacher.studentCol') }}</span>
              <span>{{ t('teacher.emailCol') }}</span>
              <span>{{ t('teacher.joinDate') }}</span>
            </div>
            <div v-for="s in classStudents" :key="s.id" class="student-row" @click="showStudentDetail(s)">
              <span class="stu-name">{{ s.name }}</span>
              <span class="stu-email">{{ s.email }}</span>
              <span class="stu-date">{{ s.joined_at?.slice(0, 10) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CreateClassModal
      v-model:show="showModal"
      v-model="newClassName"
      @confirm="createClass"
    />

    <StudentDetailModal
      :show="detailOpen"
      :student="selectedStudent"
      @close="detailOpen = false"
    />
  </div>
</template>

<style scoped>
.class-manager {
  width: 100%;
  margin: 0;
  padding: 1rem 1.5rem;
}

.manager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.manager-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #67e8f9, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.class-count {
  font-size: 0.75rem;
  color: #64748b;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: 0.7rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.35);
  transition: all 0.25s ease;
}

.create-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 22px rgba(79, 70, 229, 0.45);
}

.create-btn.alt {
  margin-top: 0.8rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.class-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.class-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1rem;
  border-radius: 0.6rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: all 0.2s;
}

.class-row:hover {
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.04);
}

.sc-icon { font-size: 1.2rem; }

.sc-name {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 700;
  color: #f1f5f9;
}

.sc-code {
  font-size: 0.85rem;
  font-weight: 700;
  color: #67e8f9;
  font-family: monospace;
  letter-spacing: 1px;
  background: rgba(0, 0, 0, 0.4);
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
  border: 1px solid rgba(103, 232, 249, 0.15);
}

.class-card { display: flex; flex-direction: column; border-radius: 0.6rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.07); transition: all 0.2s; }
.class-card:hover { border-color: rgba(99, 102, 241, 0.25); }
.sc-toggle { font-size: 0.7rem; color: #64748b; width: 16px; cursor: pointer; }
.sc-copy, .sc-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.sc-copy:hover, .sc-delete:hover { opacity: 1; }
.class-details { padding: 0 1rem 1rem 1rem; border-top: 1px solid rgba(255,255,255,0.05); }
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
