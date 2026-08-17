<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useClassManager } from '../../composables/teacher/useClassManager'
import { getClassStats } from '../../services/class.service'
import CreateClassModal from './CreateClassModal.vue'
import ClassGrid from './ClassGrid.vue'
import ClassDetail from './ClassDetail.vue'

const { t } = useI18n()
const { classes, expandedId, classStudents, showModal, newClassName, createClass, deleteClass, renameClass, copyCode, loadClassDetails, loading } = useClassManager()

const renameTarget = ref<{ id: string; name: string } | null>(null)
const renameValue = ref('')

interface ClassStatItem { student_count: number; total_reports: number; pending_count: number; class_average: number }
const classStats = ref<Record<string, ClassStatItem>>({})
const statsLoading = ref(false)

const selectedClass = computed(() => classes.value.find(c => c.id === expandedId.value) || null)

const summaryStats = computed(() => {
  let totalStudents = 0, totalReports = 0, totalPending = 0, avgAccum = 0, avgCount = 0
  for (const key in classStats.value) {
    const s = classStats.value[key]
    if (!s) continue
    totalStudents += s.student_count
    totalReports += s.total_reports
    totalPending += s.pending_count
    if (s.class_average > 0) { avgAccum += s.class_average; avgCount++ }
  }
  return { totalClasses: classes.value.length, totalStudents, totalReports, totalPending, avg: avgCount ? Math.round(avgAccum / avgCount) : 0 }
})

async function loadStats(classId: string) {
  statsLoading.value = true
  try {
    const res = await getClassStats(classId)
    if (res.success) classStats.value = { ...classStats.value, [classId]: res.stats }
  } catch (err) { console.error('load class stats failed:', err) }
  statsLoading.value = false
}

async function openClass(id: string) {
  await loadClassDetails(id)
  if (expandedId.value === id) await loadStats(id)
}

function startRename(cls: { id: string; name: string }) {
  renameTarget.value = cls
  renameValue.value = cls.name
}

async function confirmRename() {
  if (!renameTarget.value || !renameValue.value.trim()) return
  await renameClass(renameTarget.value.id, renameValue.value)
  renameTarget.value = null
  renameValue.value = ''
}

async function loadAllStats() {
  const missing = classes.value.filter(c => !classStats.value[c.id])
  const results = await Promise.all(
    missing.map(c => getClassStats(c.id).catch(() => null))
  )
  const next = { ...classStats.value }
  for (let i = 0; i < missing.length; i++) {
    const res = results[i]
    if (res?.success) next[missing[i].id] = res.stats
  }
  classStats.value = next
}

onMounted(() => {
  loadAllStats()
})

watch(() => classes.value.length, () => {
  loadAllStats()
})
</script>

<template>
  <div class="class-manager">
    <div class="manager-header">
      <div class="header-title">
        <h2>{{ t('teacher.myClassesTitle') }}</h2>
        <span v-if="summaryStats.totalClasses" class="class-count">
          {{ summaryStats.totalClasses }} {{ t('teacher.classCount') }}
        </span>
      </div>
      <button class="create-btn" @click="showModal = true">
        <span>+</span><span>{{ t('teacher.createClass') }}</span>
      </button>
    </div>

    <div class="summary-row" v-if="summaryStats.totalClasses">
      <div class="summary-card"><span class="summary-label">{{ t('teacher.studentsLabel') }}</span><span class="summary-value">{{ summaryStats.totalStudents }}</span></div>
      <div class="summary-card"><span class="summary-label">{{ t('teacher.reportsStat') }}</span><span class="summary-value">{{ summaryStats.totalReports }}</span></div>
      <div class="summary-card"><span class="summary-label">{{ t('teacher.pendingStat') }}</span><span class="summary-value">{{ summaryStats.totalPending }}</span></div>
      <div class="summary-card"><span class="summary-label">{{ t('teacher.avgStat') }}</span><span class="summary-value">{{ summaryStats.avg }}%</span></div>
    </div>

    <div v-if="classes.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <p>{{ t('teacher.noClassesYet') }}</p>
      <button class="create-btn alt" @click="showModal = true">{{ t('teacher.createFirstClass') }}</button>
    </div>

    <ClassGrid
      v-else
      :classes="classes"
      :active-id="expandedId"
      :class-stats="classStats"
      @open="openClass"
      @copy="copyCode"
      @delete="deleteClass"
      @rename="startRename"
    />

    <ClassDetail
      v-if="selectedClass"
      :cls="selectedClass"
      :stats="classStats[selectedClass.id]"
      :stats-loading="statsLoading"
      :students="classStudents"
      :loading="loading"
      @close="expandedId = null"
    />

    <CreateClassModal v-model:show="showModal" v-model="newClassName" @confirm="createClass" />

    <!-- Rename Modal -->
    <div v-if="renameTarget" class="modal-overlay" @click.self="renameTarget = null">
      <div class="rename-modal">
        <h3>{{ t('dashboard.renameClass') }}</h3>
        <input v-model="renameValue" type="text" :placeholder="t('dashboard.enterClassName')" @keyup.enter="confirmRename" />
        <div class="rename-actions">
          <button class="rename-cancel" @click="renameTarget = null">{{ t('dashboard.close') }}</button>
          <button class="rename-confirm" @click="confirmRename">{{ t('common.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.class-manager { width: 100%; margin: 0; padding: 1rem 1.5rem; }
.manager-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
.header-title { display: flex; align-items: center; gap: 0.7rem; }
.manager-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #67e8f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.class-count { font-size: 0.75rem; color: #64748b; background: rgba(255, 255, 255, 0.05); padding: 0.2rem 0.6rem; border-radius: 999px; }
.create-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border: none; border-radius: 0.7rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.35); transition: all 0.25s ease; }
.create-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 6px 22px rgba(79, 70, 229, 0.45); }
.create-btn.alt { margin-top: 0.8rem; }
.empty-state { text-align: center; padding: 3rem 1rem; color: #64748b; }
.empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
.summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.8rem; margin-bottom: 1.4rem; }
.summary-card { padding: 0.8rem 1rem; border-radius: 0.9rem; background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(148, 163, 184, 0.35); }
.summary-label { display: block; font-size: 0.78rem; color: #9ca3af; margin-bottom: 0.1rem; }
.summary-value { font-size: 1.25rem; font-weight: 800; color: #e5e7eb; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 500; }
.rename-modal { background: rgba(15,23,42,0.97); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 1.5rem; width: 90%; max-width: 400px; }
.rename-modal h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #e5e7eb; }
.rename-modal input { width: 100%; padding: 0.6rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-size: 0.9rem; font-family: inherit; margin-bottom: 1rem; }
.rename-modal input:focus { outline: none; border-color: rgba(99,102,241,0.4); }
.rename-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
.rename-cancel { padding: 0.5rem 1.2rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.rename-cancel:hover { background: rgba(255,255,255,0.08); }
.rename-confirm { padding: 0.5rem 1.2rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.rename-confirm:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
</style>
