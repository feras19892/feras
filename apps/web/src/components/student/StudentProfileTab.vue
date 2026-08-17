<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useAuthStore } from '../../modules/auth/stores/auth'
import AccountSettingsModal from '../shared/AccountSettingsModal.vue'
import { updateAvatar } from '../../services/enhancements.service'
import type { StudentKPI, StudentReportRow } from '../../composables/student/useStudentDashboard'

const props = defineProps<{
  kpi: StudentKPI
  recent: StudentReportRow[]
}>()
const { t } = useI18n()
const auth = useAuthStore()

const personalAvg = computed(() => {
  const graded = props.recent.filter(r => r.status === 'graded' && r.grade !== null)
  if (graded.length === 0) return null
  return Math.round(graded.reduce((s, r) => s + (r.grade as number), 0) / graded.length)
})

const avgDiff = computed(() => {
  if (personalAvg.value === null) return null
  return props.kpi.avgGrade - personalAvg.value
})

const avatarUploading = ref(false)
const avatarError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function triggerAvatarUpload() {
  fileInput.value?.click()
}

async function handleAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    avatarError.value = t('shared.avatarTooLarge')
    return
  }
  avatarUploading.value = true
  avatarError.value = ''
  try {
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const res = await updateAvatar(dataUrl)
      if (res.success) {
        if (auth.user) auth.user.avatar_url = dataUrl
      } else {
        avatarError.value = res.message || t('shared.avatarUploadFailed')
      }
      avatarUploading.value = false
    }
    reader.onerror = () => {
      avatarError.value = t('shared.avatarReadFailed')
      avatarUploading.value = false
    }
    reader.readAsDataURL(file)
  } catch {
    avatarError.value = t('shared.avatarUploadFailed')
    avatarUploading.value = false
  }
  input.value = ''
}

function statusLabel(s: string): string {
  if (s === 'graded') return t('dashboard.statusGraded')
  if (s === 'submitted') return t('dashboard.statusSubmitted')
  if (s === 'resubmitted') return t('dashboard.statusResubmitted')
  return t('dashboard.statusDraft')
}
</script>

<template>
  <div class="tab-panel">
    <!-- Profile header -->
    <div class="panel-card profile-card">
      <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" class="avatar-img" alt="avatar" />
      <div v-else class="avatar">🎓</div>
      <div class="info">
        <h2>{{ auth.user?.name }}</h2>
        <p class="email">{{ auth.user?.email }}</p>
        <span class="role-badge">{{ t('dashboard.student') }}</span>
      </div>
      <div class="profile-actions">
        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleAvatarChange" />
        <button class="avatar-btn" :disabled="avatarUploading" @click="triggerAvatarUpload">
          {{ avatarUploading ? '...' : t('shared.avatarBtn') }}
        </button>
        <p v-if="avatarError" class="avatar-error">{{ avatarError }}</p>
        <AccountSettingsModal />
      </div>
    </div>

    <!-- Stats grid -->
    <div class="stats-grid">
      <div class="stat-card"><span class="stat-val">{{ kpi.totalReports }}</span><span class="stat-label">{{ t('dashboard.totalReports') }}</span></div>
      <div class="stat-card"><span class="stat-val">{{ kpi.gradedCount }}</span><span class="stat-label">{{ t('dashboard.graded') }}</span></div>
      <div class="stat-card"><span class="stat-val">{{ kpi.pendingCount }}</span><span class="stat-label">{{ t('dashboard.pending') }}</span></div>
      <div class="stat-card highlight">
        <span class="stat-val">{{ kpi.avgGrade }}%</span>
        <span class="stat-label">{{ t('dashboard.average') }}</span>
        <span v-if="avgDiff !== null" :class="['avg-badge', avgDiff >= 0 ? 'above' : 'below']">
          {{ avgDiff >= 0 ? '▲' : '▼' }} {{ Math.abs(avgDiff) }}% {{ avgDiff >= 0 ? t('dashboard.aboveRecentAvg', 'فوق متوسطك الأخير') : t('dashboard.belowRecentAvg', 'تحت متوسطك الأخير') }}
        </span>
      </div>
      <div class="stat-card highlight"><span class="stat-val">{{ kpi.bestGrade }}%</span><span class="stat-label">{{ t('dashboard.bestGrade') }}</span></div>
      <div class="stat-card"><span class="stat-val">{{ kpi.totalClasses }}</span><span class="stat-label">{{ t('dashboard.classes') }}</span></div>
    </div>

    <!-- Recent reports -->
    <div class="panel-card">
      <div class="pc-header"><h3>📋 {{ t('dashboard.recentReports') }}</h3></div>
      <div v-if="recent.length === 0" class="pc-empty">📝 {{ t('dashboard.noReportsMsg') }}</div>
      <div v-else class="pc-list">
        <div v-for="r in recent" :key="r.id" class="pc-row">
          <span class="pc-name">{{ r.experimentName }}</span>
          <span :class="['badge', r.status]">{{ statusLabel(r.status) }}</span>
          <span v-if="r.grade !== null" class="pc-grade">{{ r.grade }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1rem; margin-bottom: 0.8rem; }
.profile-card { display: flex; align-items: center; gap: 1rem; }
.profile-card .info { flex: 1; }
.avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
.avatar-img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(99,102,241,0.3); flex-shrink: 0; }
.profile-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; }
.avatar-btn { padding: 0.35rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(99,102,241,0.3); background: rgba(99,102,241,0.1); color: #c7d2fe; font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.avatar-btn:hover { background: rgba(99,102,241,0.2); }
.avatar-btn:disabled { opacity: 0.6; cursor: wait; }
.avatar-error { color: #f87171; font-size: 0.72rem; margin: 0; }
.info h2 { margin: 0; font-size: 1.1rem; color: #f1f5f9; }
.email { margin: 0.2rem 0 0; font-size: 0.8rem; color: #94a3b8; }
.role-badge { font-size: 0.7rem; color: #67e8f9; background: rgba(99,102,241,0.1); padding: 0.15rem 0.5rem; border-radius: 999px; display: inline-block; margin-top: 0.3rem; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.8rem; }
@media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
.stat-card { text-align: center; padding: 0.7rem; border-radius: 0.5rem; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); }
.stat-card.highlight { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.15); }
.stat-val { display: block; font-size: 1.2rem; font-weight: 800; color: #67e8f9; }
.stat-card.highlight .stat-val { color: #a5b4fc; }
.stat-label { font-size: 0.7rem; color: #94a3b8; }
.avg-badge { display: inline-block; margin-top: 0.25rem; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.62rem; font-weight: 700; }
.avg-badge.above { background: rgba(34,197,94,0.12); color: #22c55e; }
.avg-badge.below { background: rgba(248,113,113,0.12); color: #f87171; }
.pc-header { margin-bottom: 0.6rem; }
.pc-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #e5e7eb; }
.pc-empty { text-align: center; color: #64748b; padding: 1rem; font-size: 0.82rem; }
.pc-list { display: flex; flex-direction: column; gap: 0.3rem; }
.pc-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; border-radius: 0.4rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); }
.pc-name { flex: 1; font-size: 0.8rem; font-weight: 600; color: #f1f5f9; }
.badge { padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.68rem; font-weight: 700; }
.badge.graded { background: rgba(34,197,94,0.15); color: #22c55e; }
.badge.submitted { background: rgba(245,158,11,0.15); color: #fbbf24; }
.badge.resubmitted { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.badge.draft { background: rgba(148,163,184,0.15); color: #94a3b8; }
.pc-grade { color: #67e8f9; font-weight: 700; font-family: monospace; font-size: 0.8rem; }
</style>
